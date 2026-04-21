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

    let totalLessons = 0;
    let completedLessons = 0;

    const modulesWithProgress: ModuleWithProgress[] = await Promise.all(
      moduleList.map(async (module) => {
        const lessonList = await this.lessons.findByIds(module.lesson_ids);
        let completedCount = 0;

        const lessonsWithProgress: LessonWithProgress[] = lessonList.map((lesson, idx) => {
          const prog = progressMap.get(lesson.id) ?? null;
          const previousCompleted = idx === 0 || progressMap.get(lessonList[idx - 1].id)?.status === 'completed';

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
      })
    );

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
