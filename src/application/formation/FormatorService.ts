/**
 * FormatorService — agrega dados pra a visão do formador.
 * Lista trilhas que o formador é responsável + alunos com progresso nelas.
 */

import { trackRepository } from '@/infrastructure/formation/TrackRepository';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';
import { lessonRepository } from '@/infrastructure/formation/LessonRepository';
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

export interface FormatorStats {
  totalStudents: number;
  /** Atividade nos últimos 7 dias. */
  activeLast7d: number;
  /** Sem atividade há mais de 14 dias. */
  staleOver14d: number;
  /** Sem atividade nenhuma registrada. */
  neverStarted: number;
  /** Total agregado de aulas concluídas (pra todas trilhas + alunos). */
  totalLessonsCompleted: number;
  /** Total agregado de aulas iniciadas. */
  totalLessonsTouched: number;
  /** Taxa de conclusão = completed / touched. */
  completionRate: number;
  /** Por trilha: completion rate. */
  byTrack: Array<{
    track: FormationTrack;
    studentCount: number;
    completedLessons: number;
    touchedLessons: number;
    rate: number;
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
          totalStudents: 0, activeLast7d: 0, staleOver14d: 0, neverStarted: 0,
          totalLessonsCompleted: 0, totalLessonsTouched: 0, completionRate: 0,
          byTrack: [],
        },
      };
    }

    const trackIds = tracks.map(t => t.id);
    const progresses = await progressRepository.findByTracks(trackIds);

    // Agrega por user_id
    const byUser = new Map<string, LessonProgress[]>();
    for (const p of progresses) {
      if (!byUser.has(p.user_id)) byUser.set(p.user_id, []);
      byUser.get(p.user_id)!.push(p);
    }

    const students: StudentSummary[] = [];
    for (const [uid, list] of byUser) {
      const user = await userService.get(uid).catch(() => null);
      if (!user) continue;
      const completed = list.filter(p => p.status === 'completed').length;
      const lastUpdated = list
        .map(p => p.updated_at ?? '')
        .filter(Boolean)
        .sort()
        .pop() ?? null;
      students.push({
        user,
        trackIds: Array.from(new Set(list.map(p => p.track_id))),
        totalLessonsTouched: list.length,
        totalLessonsCompleted: completed,
        lastActivityAt: lastUpdated,
      });
    }
    students.sort((a, b) => (b.lastActivityAt ?? '').localeCompare(a.lastActivityAt ?? ''));

    // Stats agregados
    const now = Date.now();
    const day = 86400000;
    let activeLast7d = 0, staleOver14d = 0, neverStarted = 0;
    for (const s of students) {
      if (!s.lastActivityAt) { neverStarted++; continue; }
      const ageDays = (now - new Date(s.lastActivityAt).getTime()) / day;
      if (ageDays <= 7) activeLast7d++;
      else if (ageDays > 14) staleOver14d++;
    }
    const totalLessonsCompleted = students.reduce((acc, s) => acc + s.totalLessonsCompleted, 0);
    const totalLessonsTouched = students.reduce((acc, s) => acc + s.totalLessonsTouched, 0);
    const completionRate = totalLessonsTouched > 0
      ? Math.round((totalLessonsCompleted / totalLessonsTouched) * 100)
      : 0;

    // Por trilha
    const byTrack = tracks.map(t => {
      const trackProgresses = progresses.filter(p => p.track_id === t.id);
      const studentCount = new Set(trackProgresses.map(p => p.user_id)).size;
      const completed = trackProgresses.filter(p => p.status === 'completed').length;
      const touched = trackProgresses.length;
      return {
        track: t,
        studentCount,
        completedLessons: completed,
        touchedLessons: touched,
        rate: touched > 0 ? Math.round((completed / touched) * 100) : 0,
      };
    });

    return {
      tracks,
      students,
      stats: {
        totalStudents: students.length,
        activeLast7d,
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
  }> {
    const tracks = await this.getMyTracks(formatorId, isAdmin);
    const trackIds = new Set(tracks.map(t => t.id));
    const all = await progressRepository.findByUser(studentId);
    const filtered = all.filter(p => trackIds.has(p.track_id));

    const grouped = new Map<string, LessonProgress[]>();
    for (const p of filtered) {
      if (!grouped.has(p.track_id)) grouped.set(p.track_id, []);
      grouped.get(p.track_id)!.push(p);
    }

    const student = await userService.get(studentId).catch(() => null);
    return {
      student,
      tracks: tracks.filter(t => grouped.has(t.id)),
      progressesByTrack: grouped,
    };
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
