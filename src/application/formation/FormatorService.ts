/**
 * FormatorService — agrega dados pra a visão do formador.
 * Lista trilhas que o formador é responsável + alunos com progresso nelas.
 */

import { trackRepository } from '@/infrastructure/formation/TrackRepository';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';
import { lessonRepository } from '@/infrastructure/formation/LessonRepository';
import { formationService } from '@/application/formation/FormationService';
import { trackEnrollmentRepository } from '@/infrastructure/enrollment/TrackEnrollmentRepository';
import { userService } from '@/services/firebase';
import type { FormationTrack, LessonProgress } from '@/domain/formation/types';
import type { FirebaseUser } from '@/types/firebase-entities';

export interface StudentSummary {
  user: FirebaseUser;
  /** trilhas onde o aluno tem progresso (filtradas pelas do formador). */
  trackIds: string[];
  totalLessonsTouched: number;
  totalLessonsCompleted: number;
  lastActivityAt: string | null;
}

export interface FormatorScope {
  tracks: FormationTrack[];
  students: StudentSummary[];
  stats: FormatorStats;
}

/**
 * Faixa de atividade do aluno. Exaustiva e sem lacuna — todo aluno cai em exatamente
 * uma. A versão anterior classificava só `<=7d` e `>14d`, então quem estava no meio
 * não aparecia em nenhum contador.
 */
export type ActivityBand = 'active' | 'attention' | 'stale' | 'never';

export const ACTIVITY_BAND_LABELS: Record<ActivityBand, string> = {
  active: 'Ativos (7d)',
  attention: 'Atenção (7-14d)',
  stale: 'Parados (+14d)',
  never: 'Não começaram',
};

/** Classifica pela última atividade. `null` = nunca registrou nada. */
export function activityBand(lastActivityAt: string | null | undefined): ActivityBand {
  if (!lastActivityAt) return 'never';
  const dias = (Date.now() - new Date(lastActivityAt).getTime()) / 86_400_000;
  if (dias <= 7) return 'active';
  if (dias <= 14) return 'attention';
  return 'stale';
}

export interface FormatorStats {
  totalStudents: number;
  /** Atividade nos últimos 7 dias. */
  activeLast7d: number;
  /** Entre 7 e 14 dias sem atividade — a faixa que antes desaparecia. */
  attention7to14d: number;
  /** Sem atividade há mais de 14 dias. */
  staleOver14d: number;
  /** Matriculado sem nenhuma atividade registrada. */
  neverStarted: number;
  /** Total agregado de aulas concluídas (pra todas trilhas + alunos). */
  totalLessonsCompleted: number;
  /** Total agregado de aulas iniciadas. */
  totalLessonsTouched: number;
  /**
   * Média das taxas por trilha. `null` quando nenhuma trilha teve o total de aulas
   * resolvido — melhor não mostrar nada do que mostrar um número inflado.
   */
  completionRate: number | null;
  /** Por trilha: conclusão sobre o currículo inteiro. */
  byTrack: Array<{
    track: FormationTrack;
    studentCount: number;
    completedLessons: number;
    touchedLessons: number;
    /** Aulas da trilha. `null` se o currículo não resolveu. */
    totalLessons: number | null;
    /** 0–100 sobre o currículo × alunos. `null` sem total. */
    rate: number | null;
  }>;
}

export class FormatorService {
  /**
   * Trilhas que o usuário gerencia (admin vê todas, formador vê só as que está em formator_ids).
   */
  async getMyTracks(userId: string, isAdmin: boolean): Promise<FormationTrack[]> {
    if (isAdmin) {
      return trackRepository.findAll();
    }
    return trackRepository.findByFormator(userId);
  }

  /**
   * Lista alunos das trilhas do formador, com resumo agregado.
   */
  async getMyStudents(userId: string, isAdmin: boolean): Promise<FormatorScope> {
    const tracks = await this.getMyTracks(userId, isAdmin);
    if (tracks.length === 0) {
      return {
        tracks: [],
        students: [],
        stats: {
          totalStudents: 0, activeLast7d: 0, attention7to14d: 0, staleOver14d: 0, neverStarted: 0,
          totalLessonsCompleted: 0, totalLessonsTouched: 0, completionRate: null,
          byTrack: [],
        },
      };
    }

    const trackIds = tracks.map(t => t.id);
    const [progresses, enrollments] = await Promise.all([
      progressRepository.findByTracks(trackIds),
      // Falha silenciosa aceitável: sem matrículas a lista cai no comportamento
      // antigo (só quem tem progresso) em vez de ficar vazia.
      trackEnrollmentRepository.findApprovedByTracks(trackIds).catch(() => []),
    ]);

    // Agrega por user_id
    const byUser = new Map<string, LessonProgress[]>();
    for (const p of progresses) {
      if (!byUser.has(p.user_id)) byUser.set(p.user_id, []);
      byUser.get(p.user_id)!.push(p);
    }

    // Matriculado aprovado que nunca abriu aula entra com lista vazia — antes ele
    // simplesmente não aparecia, e a aba "Não iniciaram" ficava sempre em zero.
    const enrolledTracksByUser = new Map<string, Set<string>>();
    for (const e of enrollments) {
      if (!byUser.has(e.user_id)) byUser.set(e.user_id, []);
      if (!enrolledTracksByUser.has(e.user_id)) enrolledTracksByUser.set(e.user_id, new Set());
      enrolledTracksByUser.get(e.user_id)!.add(e.track_id);
    }

    // Em paralelo — antes era um `await userService.get` dentro do for, o que
    // serializava uma leitura por aluno e travava a tela com turmas grandes.
    const uids = Array.from(byUser.keys());
    const users = await Promise.all(uids.map(uid => userService.get(uid).catch(() => null)));

    const students: StudentSummary[] = [];
    users.forEach((user, i) => {
      if (!user) return;
      const list = byUser.get(uids[i]) ?? [];
      const completed = list.filter(p => p.status === 'completed').length;
      const lastUpdated = list
        .map(p => p.updated_at ?? '')
        .filter(Boolean)
        .sort()
        .pop() ?? null;
      // Trilhas do aluno = onde tem progresso ∪ onde está matriculado.
      const doProgresso = list.map(p => p.track_id);
      const daMatricula = Array.from(enrolledTracksByUser.get(uids[i]) ?? []);

      students.push({
        user,
        trackIds: Array.from(new Set([...doProgresso, ...daMatricula])),
        totalLessonsTouched: list.length,
        totalLessonsCompleted: completed,
        lastActivityAt: lastUpdated,
      });
    });
    students.sort((a, b) => (b.lastActivityAt ?? '').localeCompare(a.lastActivityAt ?? ''));

    // Stats agregados. As faixas cobrem TODOS os alunos — antes quem estava entre 7
    // e 14 dias parado não era contado em nenhuma delas e desaparecia do painel.
    let activeLast7d = 0, attention7to14d = 0, staleOver14d = 0, neverStarted = 0;
    for (const s of students) {
      const faixa = activityBand(s.lastActivityAt);
      if (faixa === 'never') neverStarted++;
      else if (faixa === 'active') activeLast7d++;
      else if (faixa === 'attention') attention7to14d++;
      else staleOver14d++;
    }
    const totalLessonsCompleted = students.reduce((acc, s) => acc + s.totalLessonsCompleted, 0);
    const totalLessonsTouched = students.reduce((acc, s) => acc + s.totalLessonsTouched, 0);

    // Total real do currículo por trilha — o denominador honesto.
    const lessonCounts = await formationService
      .getTrackLessonCounts(trackIds)
      .catch(() => new Map<string, number>());

    // Por trilha: conclusão = aulas concluídas ÷ (alunos × aulas da trilha).
    // Antes era ÷ aulas que os alunos abriram, o que dava 100% para uma turma que
    // mal começou.
    const byTrack = tracks.map(t => {
      const trackProgresses = progresses.filter(p => p.track_id === t.id);
      const studentCount = new Set(trackProgresses.map(p => p.user_id)).size;
      const completed = trackProgresses.filter(p => p.status === 'completed').length;
      const lessonsPerStudent = lessonCounts.get(t.id) ?? null;
      const possible = lessonsPerStudent !== null ? lessonsPerStudent * studentCount : null;
      return {
        track: t,
        studentCount,
        completedLessons: completed,
        touchedLessons: trackProgresses.length,
        totalLessons: lessonsPerStudent,
        rate: possible && possible > 0 ? Math.min(100, Math.round((completed / possible) * 100)) : null,
      };
    });

    // Média das trilhas que têm total conhecido — sem inventar quando nenhuma tem.
    const trilhasComTaxa = byTrack.filter(b => b.rate !== null);
    const completionRate = trilhasComTaxa.length > 0
      ? Math.round(trilhasComTaxa.reduce((acc, b) => acc + (b.rate ?? 0), 0) / trilhasComTaxa.length)
      : null;

    return {
      tracks,
      students,
      stats: {
        totalStudents: students.length,
        activeLast7d,
        attention7to14d,
        staleOver14d,
        neverStarted,
        totalLessonsCompleted,
        totalLessonsTouched,
        completionRate,
        byTrack,
      },
    };
  }

  /**
   * Detalhe de um aluno específico — só inclui progressos das trilhas do formador.
   */
  async getStudentDetail(
    formatorId: string,
    isAdmin: boolean,
    studentId: string,
  ): Promise<{
    student: FirebaseUser | null;
    tracks: FormationTrack[];
    progressesByTrack: Map<string, LessonProgress[]>;
    /** trackId → total real de aulas do currículo. Ausente = não resolveu. */
    lessonCounts: Map<string, number>;
  }> {
    const tracks = await this.getMyTracks(formatorId, isAdmin);
    const trackIds = new Set(tracks.map(t => t.id));
    const [all, student] = await Promise.all([
      progressRepository.findByUser(studentId),
      userService.get(studentId).catch(() => null),
    ]);
    const filtered = all.filter(p => trackIds.has(p.track_id));

    const grouped = new Map<string, LessonProgress[]>();
    for (const p of filtered) {
      if (!grouped.has(p.track_id)) grouped.set(p.track_id, []);
      grouped.get(p.track_id)!.push(p);
    }

    const visibleTracks = tracks.filter(t => grouped.has(t.id));
    const lessonCounts = await formationService
      .getTrackLessonCounts(visibleTracks.map(t => t.id))
      .catch(() => new Map<string, number>());

    return { student, tracks: visibleTracks, progressesByTrack: grouped, lessonCounts };
  }

  /** Resolve título das aulas pra um set de progresses. */
  async resolveLessonTitles(progresses: LessonProgress[]): Promise<Map<string, string>> {
    const ids = Array.from(new Set(progresses.map(p => p.lesson_id)));
    const lessons = await lessonRepository.findByIds(ids);
    const map = new Map<string, string>();
    for (const l of lessons) map.set(l.id, l.title);
    return map;
  }
}

export const formatorService = new FormatorService();
