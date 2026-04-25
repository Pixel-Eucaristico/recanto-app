import { Role } from '@/shared/types/role';
import {
  FormationTrack,
  FormationModule,
  FormationLesson,
  LessonProgress,
  TrackWithProgress,
  ModuleWithProgress,
  LessonWithProgress,
  UnlockResult,
} from '@/domain/formation/types';
import { UnlockRuleEngine } from '@/domain/formation/entities/UnlockRuleEngine';
import { ITrackRepository } from '@/infrastructure/formation/TrackRepository';
import { IModuleRepository } from '@/infrastructure/formation/ModuleRepository';
import { ILessonRepository } from '@/infrastructure/formation/LessonRepository';
import { IProgressRepository } from '@/infrastructure/formation/ProgressRepository';

export class FormationService {
  constructor(
    private readonly tracks: ITrackRepository,
    private readonly modules: IModuleRepository,
    private readonly lessons: ILessonRepository,
    private readonly progress: IProgressRepository,
  ) {}

  async getTracksForUser(role: Role): Promise<FormationTrack[]> {
    return this.tracks.findByRole(role);
  }

  async getAllTracks(): Promise<FormationTrack[]> {
    return this.tracks.findAll();
  }

  async getTrackWithProgress(trackId: string, userId: string, userHabitsBlocked: boolean): Promise<TrackWithProgress> {
    const track = await this.tracks.findById(trackId);
    if (!track) throw new Error(`Trilha ${trackId} não encontrada`);

    const moduleList = await this.modules.findByIds(track.module_ids);
    const trackProgress = await this.progress.findByUserAndTrack(userId, trackId);
    const progressMap = new Map(trackProgress.map(p => [p.lesson_id, p]));

    // Carrega aulas de cada módulo em paralelo
    const moduleLessons = await Promise.all(
      moduleList.map(m => this.lessons.findByIds(m.lesson_ids).then(ls => ({ module: m, lessons: ls })))
    );

    // Sequência global de aulas em ordem de track → módulo → ordem dentro do módulo
    const flatLessons = moduleLessons.flatMap(ml => ml.lessons);

    let totalLessons = 0;
    let completedLessons = 0;

    const modulesWithProgress: ModuleWithProgress[] = moduleLessons.map(({ module, lessons }) => {
      let completedCount = 0;

      const lessonsWithProgress: LessonWithProgress[] = lessons.map(lesson => {
        const prog = progressMap.get(lesson.id) ?? null;
        // Busca a aula anterior na sequência GLOBAL (não só dentro do módulo)
        const globalIdx = flatLessons.findIndex(l => l.id === lesson.id);
        const previousLesson = globalIdx > 0 ? flatLessons[globalIdx - 1] : null;
        const previousCompleted = !previousLesson || progressMap.get(previousLesson.id)?.status === 'completed';

        const unlockResult = UnlockRuleEngine.evaluate({
          lesson,
          progress: prog,
          userHabitsBlocked,
          previousLessonCompleted: previousCompleted,
        });

        if (prog?.status === 'completed') completedCount++;
        totalLessons++;
        if (prog?.status === 'completed') completedLessons++;

        return { lesson, progress: prog, unlockResult };
      });

      return { module, lessons: lessonsWithProgress, completedCount };
    });

    return { track, modules: modulesWithProgress, completedLessons, totalLessons };
  }

  async getLesson(lessonId: string): Promise<FormationLesson | null> {
    return this.lessons.findById(lessonId);
  }

  async getLessonWithProgress(
    userId: string,
    lessonId: string,
    moduleId: string,
    trackId: string,
    userHabitsBlocked: boolean,
    previousLessonId?: string
  ): Promise<LessonWithProgress> {
    const lesson = await this.lessons.findById(lessonId);
    if (!lesson) throw new Error(`Aula ${lessonId} não encontrada`);

    const prog = await this.progress.getOrCreate(userId, lessonId, moduleId, trackId);

    let previousLessonCompleted = true;
    if (previousLessonId) {
      const prevProg = await this.progress.findByUserAndLesson(userId, previousLessonId);
      previousLessonCompleted = prevProg?.status === 'completed';
    }

    const unlockResult = UnlockRuleEngine.evaluate({
      lesson,
      progress: prog,
      userHabitsBlocked,
      previousLessonCompleted,
    });

    return { lesson, progress: prog, unlockResult };
  }
}

import { trackRepository } from '@/infrastructure/formation/TrackRepository';
import { moduleRepository } from '@/infrastructure/formation/ModuleRepository';
import { lessonRepository } from '@/infrastructure/formation/LessonRepository';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';

export const formationService = new FormationService(
  trackRepository,
  moduleRepository,
  lessonRepository,
  progressRepository,
);
