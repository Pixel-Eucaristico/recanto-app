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
    if (tracks.length === 0) return { tracks: [], students: [] };

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
    return { tracks, students };
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
