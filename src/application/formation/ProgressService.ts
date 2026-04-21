import { LessonProgress } from '@/domain/formation/types';
import { Progress } from '@/domain/formation/entities/Progress';
import { IProgressRepository } from '@/infrastructure/formation/ProgressRepository';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';

export class ProgressService {
  constructor(private readonly repo: IProgressRepository) {}

  async updateVideoProgress(
    userId: string,
    lessonId: string,
    moduleId: string,
    trackId: string,
    percent: number,
    positionSeconds: number,
    minWatchPercent: number
  ): Promise<LessonProgress> {
    const current = await this.repo.getOrCreate(userId, lessonId, moduleId, trackId);
    const patch = Progress.withVideoUpdate(current, percent, positionSeconds, minWatchPercent);
    return this.repo.upsert(userId, lessonId, patch);
  }

  async markReflectionSubmitted(userId: string, lessonId: string, moduleId: string, trackId: string): Promise<LessonProgress> {
    const current = await this.repo.getOrCreate(userId, lessonId, moduleId, trackId);
    return this.repo.upsert(userId, lessonId, {
      reflection_submitted: true,
      status: Progress.nextStatus(current.status, this.allMet({ ...current, reflection_submitted: true })),
    });
  }

  async markQuizPassed(userId: string, lessonId: string, moduleId: string, trackId: string): Promise<LessonProgress> {
    const current = await this.repo.getOrCreate(userId, lessonId, moduleId, trackId);
    return this.repo.upsert(userId, lessonId, {
      quiz_passed: true,
      status: Progress.nextStatus(current.status, this.allMet({ ...current, quiz_passed: true })),
    });
  }

  async markForumPosted(userId: string, lessonId: string, moduleId: string, trackId: string): Promise<LessonProgress> {
    const current = await this.repo.getOrCreate(userId, lessonId, moduleId, trackId);
    return this.repo.upsert(userId, lessonId, {
      forum_post_made: true,
      status: Progress.nextStatus(current.status, this.allMet({ ...current, forum_post_made: true })),
    });
  }

  async markCompleted(userId: string, lessonId: string): Promise<LessonProgress> {
    return this.repo.upsert(userId, lessonId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  }

  private allMet(p: Partial<LessonProgress>): boolean {
    return !!(p.reflection_submitted && p.quiz_passed !== false && p.forum_post_made !== false);
  }
}

export const progressService = new ProgressService(progressRepository);
