export type LockState = 'locked' | 'unlockable' | 'unlocked';

export interface VideoSession {
  lessonId: string;
  userId: string;
  durationSeconds: number;
  watchPercent: number;
  lastPositionSeconds: number;
  minWatchPercent: number;
  completedAt?: string;
}

export interface VideoTickInput {
  currentTime: number;
  duration: number;
}
