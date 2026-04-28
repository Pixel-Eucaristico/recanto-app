import { LockState, VideoSession, VideoTickInput } from '@/domain/video-player/types';

/**
 * Tolerância (em segundos) para considerar que o usuário avançou normalmente.
 * Qualquer salto maior é tratado como skip e ignorado no tracking.
 */
export const SKIP_TOLERANCE_SECONDS = 3;

export class VideoSessionEntity {
  static from(
    params: Pick<VideoSession, 'userId' | 'lessonId' | 'minWatchPercent'> &
      Partial<VideoSession>,
  ): VideoSession {
    return {
      userId: params.userId,
      lessonId: params.lessonId,
      durationSeconds: params.durationSeconds ?? 0,
      watchPercent: params.watchPercent ?? 0,
      watchSeconds: params.watchSeconds ?? 0,
      lastPositionSeconds: params.lastPositionSeconds ?? 0,
      minWatchPercent: params.minWatchPercent,
      minWatchSeconds: params.minWatchSeconds ?? 0,
      completedAt: params.completedAt,
    };
  }

  /**
   * Atualiza sessão com o estado atual do player.
   * - Se delta > tolerance (skip à frente) ou delta < -tolerance (pulou atrás): não soma.
   * - Sempre atualiza lastPositionSeconds (para resume).
   * - Acumula watchSeconds e recalcula watchPercent.
   */
  static tick(session: VideoSession, tick: VideoTickInput): VideoSession {
    const duration = tick.duration > 0 ? tick.duration : session.durationSeconds;
    const delta = tick.currentTime - session.lastPositionSeconds;
    const isSkip = delta > SKIP_TOLERANCE_SECONDS || delta < -SKIP_TOLERANCE_SECONDS;
    const positiveDelta = !isSkip && delta > 0 ? delta : 0;

    const nextWatchSeconds = Math.min(
      duration > 0 ? duration : session.watchSeconds + positiveDelta,
      session.watchSeconds + positiveDelta,
    );
    const nextPercent =
      duration > 0 ? Math.min(100, (nextWatchSeconds / duration) * 100) : session.watchPercent;

    return {
      ...session,
      durationSeconds: duration,
      watchSeconds: Math.round(nextWatchSeconds * 100) / 100,
      watchPercent: Math.round(nextPercent * 100) / 100,
      lastPositionSeconds: tick.currentTime,
    };
  }

  /**
   * Desbloqueia se:
   * - watchPercent >= minWatchPercent, OU
   * - minWatchSeconds > 0 E watchSeconds >= minWatchSeconds
   */
  static isMinimumReached(session: VideoSession): boolean {
    if (session.watchPercent >= session.minWatchPercent) return true;
    if (session.minWatchSeconds > 0 && session.watchSeconds >= session.minWatchSeconds) return true;
    return false;
  }

  static lockState(session: VideoSession): LockState {
    if (session.completedAt) return 'unlocked';
    if (VideoSessionEntity.isMinimumReached(session)) return 'unlockable';
    return 'locked';
  }

  /**
   * Posição máxima permitida no scrub (anti-skip).
   * Pode voltar livremente, mas não avançar além do ponto já assistido.
   */
  static maxAllowedSeekSeconds(session: VideoSession): number {
    return session.watchSeconds + SKIP_TOLERANCE_SECONDS;
  }
}
