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

/** Log append-only — uma entry por aparição/sessão de visualização. Permite reassistir sem perder o registro. */
export interface VideoWatchSession {
  id: string;
  user_id: string;
  lesson_id: string;
  module_id: string;
  track_id: string;
  /** Início da sessão (mount do player). */
  started_at: string;
  /** Fim da sessão (unmount ou flush final). */
  ended_at?: string;
  /** Maior posição atingida nessa sessão (segundos). */
  max_position_seconds: number;
  /** Total de segundos efetivamente assistidos nessa sessão. */
  seconds_watched: number;
  /** True se o vídeo já tinha sido concluído antes (revisita). */
  is_rewatch: boolean;
}
