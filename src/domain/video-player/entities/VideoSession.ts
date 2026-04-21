import { LockState, VideoSession, VideoTickInput } from '@/domain/video-player/types';

/**
 * Tolerância (em segundos) para considerar que o usuário avançou normalmente.
 * Qualquer salto maior é tratado como skip e ignorado no tracking.
 */
export const SKIP_TOLERANCE_SECONDS = 3;

export class VideoSessionEntity {
  /**
   * Cria sessão inicial a partir do progresso salvo (ou zerado).
   */
  static from(params: Pick<VideoSession, 'userId' | 'lessonId' | 'minWatchPercent'> & Partial<VideoSession>): VideoSession {
    return {
      userId: params.userId,
      lessonId: params.lessonId,
      durationSeconds: params.durationSeconds ?? 0,
      watchPercent: params.watchPercent ?? 0,
      lastPositionSeconds: params.lastPositionSeconds ?? 0,
      minWatchPercent: params.minWatchPercent,
      completedAt: params.completedAt,
    };
  }

  /**
   * Atualiza sessão com o estado atual do player.
   * - Se currentTime avançou além de tolerance (skip), não progride watchPercent.
   * - Sempre atualiza lastPositionSeconds (para resume).
   */
  static tick(session: VideoSession, tick: VideoTickInput): VideoSession {
    const duration = tick.duration > 0 ? tick.duration : session.durationSeconds;
    const delta = tick.currentTime - session.lastPositionSeconds;
    const isSkip = delta > SKIP_TOLERANCE_SECONDS || delta < -SKIP_TOLERANCE_SECONDS;

    let nextPercent = session.watchPercent;
    if (!isSkip && duration > 0) {
      // soma delta proporcional ao duration — mas nunca regride
      const deltaPercent = Math.max(0, delta) / duration * 100;
      nextPercent = Math.min(100, session.watchPercent + deltaPercent);
    }

    return {
      ...session,
      durationSeconds: duration,
      watchPercent: Math.round(nextPercent * 100) / 100,
      lastPositionSeconds: tick.currentTime,
    };
  }

  /**
   * Verifica se o vídeo atingiu o % mínimo para desbloquear próxima etapa.
   */
  static isMinimumReached(session: VideoSession): boolean {
    return session.watchPercent >= session.minWatchPercent;
  }

  static lockState(session: VideoSession): LockState {
    if (session.completedAt) return 'unlocked';
    if (VideoSessionEntity.isMinimumReached(session)) return 'unlockable';
    return 'locked';
  }

  /**
   * Calcula posição máxima permitida no scrub bar (anti-skip).
   * Usuário pode voltar livremente, mas não avançar além do que já assistiu.
   */
  static maxAllowedSeekSeconds(session: VideoSession): number {
    if (session.durationSeconds <= 0) return 0;
    const watchedSeconds = (session.watchPercent / 100) * session.durationSeconds;
    return watchedSeconds + SKIP_TOLERANCE_SECONDS;
  }
}
