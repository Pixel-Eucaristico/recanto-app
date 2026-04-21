import { LessonProgress, ProgressStatus } from '@/domain/formation/types';

export class Progress {
  static initial(userId: string, lessonId: string, moduleId: string, trackId: string): Omit<LessonProgress, 'id'> {
    const now = new Date().toISOString();
    return {
      user_id: userId,
      lesson_id: lessonId,
      module_id: moduleId,
      track_id: trackId,
      status: 'locked',
      video_watch_percent: 0,
      video_last_position_seconds: 0,
      video_completed_at: undefined,
      reflection_submitted: false,
      quiz_passed: false,
      forum_post_made: false,
      unlocked_at: undefined,
      completed_at: undefined,
      created_at: now,
    };
  }

  static isCompleted(progress: LessonProgress): boolean {
    return progress.status === 'completed';
  }

  static canMarkCompleted(progress: LessonProgress): boolean {
    return progress.status === 'unlocked' || progress.status === 'in_progress';
  }

  static withVideoUpdate(
    progress: LessonProgress,
    percent: number,
    positionSeconds: number,
    minWatchPercent: number
  ): Partial<LessonProgress> {
    const now = new Date().toISOString();
    const justCompleted = percent >= minWatchPercent && !progress.video_completed_at;
    return {
      video_watch_percent: Math.max(progress.video_watch_percent, percent),
      video_last_position_seconds: positionSeconds,
      status: progress.status === 'locked' ? 'in_progress' : progress.status,
      ...(justCompleted ? { video_completed_at: now } : {}),
    };
  }

  static nextStatus(current: ProgressStatus, allRequirementsMet: boolean): ProgressStatus {
    if (current === 'completed') return 'completed';
    if (allRequirementsMet) return 'completed';
    if (current === 'locked') return 'locked';
    return 'in_progress';
  }
}
