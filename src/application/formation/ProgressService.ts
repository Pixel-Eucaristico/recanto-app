import { LessonProgress } from '@/domain/formation/types';
import { Progress } from '@/domain/formation/entities/Progress';
import { IProgressRepository } from '@/infrastructure/formation/ProgressRepository';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';
import { trackRepository } from '@/infrastructure/formation/TrackRepository';
import { lessonRepository } from '@/infrastructure/formation/LessonRepository';
import { userService } from '@/services/firebase';
import { notificationService } from '@/application/notifications/NotificationService';

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
    const updated = await this.repo.upsert(userId, lessonId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
    // Notifica formadores da trilha (best-effort)
    this.notifyFormatorsOfCompletion(userId, updated.track_id, lessonId).catch(() => {});
    return updated;
  }

  private async notifyFormatorsOfCompletion(userId: string, trackId: string, lessonId: string): Promise<void> {
    const [track, lesson, user] = await Promise.all([
      trackRepository.findById(trackId),
      lessonRepository.findById(lessonId),
      userService.get(userId).catch(() => null),
    ]);
    const recipients = new Set<string>(track?.formator_ids ?? []);
    if (recipients.size === 0) return;
    recipients.delete(userId);
    await notificationService.notifyMany(Array.from(recipients), {
      kind: 'lesson_completed',
      title: 'Aluno concluiu aula',
      body: `${user?.name ?? 'Aluno'} concluiu "${lesson?.title ?? 'aula'}" em "${track?.title ?? 'trilha'}".`,
      link: `/app/dashboard/formator/students/${userId}`,
      meta: { user_id: userId, track_id: trackId, lesson_id: lessonId },
    });
  }

  private allMet(p: Partial<LessonProgress>): boolean {
    return !!(p.reflection_submitted && p.quiz_passed !== false && p.forum_post_made !== false);
  }
}

export const progressService = new ProgressService(progressRepository);
