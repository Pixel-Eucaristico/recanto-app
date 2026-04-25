'use client';

import { CheckCircle2, PlayCircle, Eye } from 'lucide-react';
import { FormationLesson } from '@/domain/formation/types';
import { LockedVideoPlayer, useVideoSession, WatchProgressBar } from '@/features/lesson/video-player';

interface LessonVideoSectionProps {
  lesson: FormationLesson;
  moduleId: string;
  trackId: string;
  userId: string;
}

export function LessonVideoSection({ lesson, moduleId, trackId, userId }: LessonVideoSectionProps) {
  const { session, tick, loading, error, watchCount } = useVideoSession({
    userId,
    lessonId: lesson.id,
    moduleId,
    trackId,
    minWatchPercent: lesson.min_watch_percent,
    durationSeconds: lesson.video_duration_seconds,
  });

  if (loading) {
    return <div className="aspect-video bg-base-300 rounded-2xl animate-pulse" />;
  }

  if (error || !session) {
    return <div className="alert alert-error text-sm"><span>{error ?? 'Erro ao carregar vídeo.'}</span></div>;
  }

  const reachedMin = session.watchPercent >= lesson.min_watch_percent;

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-0 gap-0">
        <div className="p-4 flex items-center gap-2 border-b border-base-300 flex-wrap">
          <PlayCircle className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-base-content flex-1">Vídeo</h3>
          {watchCount > 0 && (
            <span className="badge badge-ghost gap-1" title="Total de visualizações armazenadas">
              <Eye className="w-3 h-3" />
              {watchCount}x
            </span>
          )}
          {reachedMin && (
            <span className="badge badge-success gap-1">
              <CheckCircle2 className="w-3 h-3" /> Mínimo atingido
            </span>
          )}
        </div>

        <div className="aspect-video bg-black">
          <LockedVideoPlayer
            videoUrl={lesson.video_url}
            session={session}
            onTick={t => tick({ currentTime: t.currentTime, duration: t.duration })}
          />
        </div>

        <div className="p-4 space-y-2">
          <WatchProgressBar
            watchPercent={session.watchPercent}
            watchSeconds={session.watchSeconds}
            minWatchPercent={lesson.min_watch_percent}
            lastPositionSeconds={session.lastPositionSeconds}
            durationSeconds={session.durationSeconds || lesson.video_duration_seconds}
          />
        </div>
      </div>
    </div>
  );
}
