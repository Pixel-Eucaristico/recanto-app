import { formationService } from '@/application/formation/FormationService';
import {
  FormationTrack,
  FormationModule,
  FormationLesson,
  LessonProgress,
  LessonWithProgress,
  UnlockResult,
} from '@/domain/formation/types';

export interface LessonPageData {
  track: FormationTrack;
  module: FormationModule;
  lesson: FormationLesson;
  progress: LessonProgress | null;
  unlockResult: UnlockResult;
  /** Aulas do mesmo módulo (ordenadas), pra navegação anterior/próximo. */
  siblings: LessonWithProgress[];
  /** Índice dentro de siblings. */
  index: number;
  prev?: LessonWithProgress;
  next?: LessonWithProgress;
}

export class LessonPageService {
  async getLessonPage(trackId: string, lessonId: string, userId: string, habitsBlocked: boolean): Promise<LessonPageData> {
    const trackWithProgress = await formationService.getTrackWithProgress(trackId, userId, habitsBlocked);
    const track = trackWithProgress.track;

    // Encontra módulo que contém a aula
    const moduleWithProgress = trackWithProgress.modules.find(m =>
      m.lessons.some(l => l.lesson.id === lessonId),
    );
    if (!moduleWithProgress) throw new Error('Aula não encontrada nesta trilha.');
    const module = moduleWithProgress.module;

    const siblings = moduleWithProgress.lessons;
    const index = siblings.findIndex(l => l.lesson.id === lessonId);
    const current = siblings[index];
    if (!current) throw new Error('Aula não encontrada.');

    return {
      track,
      module,
      lesson: current.lesson,
      progress: current.progress,
      unlockResult: current.unlockResult,
      siblings,
      index,
      prev: index > 0 ? siblings[index - 1] : undefined,
      next: index < siblings.length - 1 ? siblings[index + 1] : undefined,
    };
  }
}

export const lessonPageService = new LessonPageService();
