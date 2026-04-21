export type LockState = 'locked' | 'unlockable' | 'unlocked';

export interface VideoSession {
  lessonId: string;
  userId: string;
  durationSeconds: number;
  watchPercent: number;
  /** Total de segundos efetivamente assistidos (descontando skips). */
  watchSeconds: number;
  lastPositionSeconds: number;
  /** Mínimo por porcentagem do vídeo. */
  minWatchPercent: number;
  /** Mínimo por segundos assistidos (se > 0, qualquer um dos dois libera). */
  minWatchSeconds: number;
  completedAt?: string;
}

export interface VideoTickInput {
  currentTime: number;
  duration: number;
}
