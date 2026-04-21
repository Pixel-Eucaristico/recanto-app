import { progressRepository, IProgressRepository } from '@/infrastructure/formation/ProgressRepository';
import { VideoSession } from '@/domain/video-player/types';
import { VideoSessionEntity } from '@/domain/video-player/entities/VideoSession';
import { LessonProgress } from '@/domain/formation/types';

export interface LoadSessionInput {
  userId: string;
  lessonId: string;
  moduleId: string;
  trackId: string;
  minWatchPercent: number;
  minWatchSeconds?: number;
  durationSeconds: number;
}

export class VideoSessionService {
  constructor(private readonly repo: IProgressRepository = progressRepository) {}

  async load(input: LoadSessionInput): Promise<VideoSession> {
    const progress = await this.repo.getOrCreate(
      input.userId,
      input.lessonId,
      input.moduleId,
      input.trackId,
    );
    return VideoSessionEntity.from({
      userId: input.userId,
      lessonId: input.lessonId,
      minWatchPercent: input.minWatchPercent,
      minWatchSeconds: input.minWatchSeconds ?? 0,
      durationSeconds: input.durationSeconds,
      watchPercent: progress.video_watch_percent ?? 0,
      watchSeconds: progress.video_watch_seconds ?? 0,
      lastPositionSeconds: progress.video_last_position_seconds ?? 0,
      completedAt: progress.video_completed_at,
    });
  }

  async save(session: VideoSession): Promise<LessonProgress> {
    const data: Partial<LessonProgress> = {
      video_watch_percent: session.watchPercent,
      video_watch_seconds: session.watchSeconds,
      video_last_position_seconds: session.lastPositionSeconds,
    };
    if (VideoSessionEntity.isMinimumReached(session) && !session.completedAt) {
      data.video_completed_at = new Date().toISOString();
    }
    return this.repo.upsert(session.userId, session.lessonId, data);
  }
}

export const videoSessionService = new VideoSessionService();
