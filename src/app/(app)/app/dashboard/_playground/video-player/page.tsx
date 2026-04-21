'use client';

import { PlayCircle } from 'lucide-react';
import { LockedVideoPlayer, UnlockCountdown, useVideoSession } from '@/features/video-player';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

const DEMO_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const DEMO_LESSON = {
  lessonId: 'playground-lesson',
  moduleId: 'playground-module',
  trackId: 'playground-track',
  minWatchPercent: 50,
  durationSeconds: 596,
  unlockAfterHours: 0,
};

export default function VideoPlayerPlaygroundPage() {
  const user = useCurrentUser();
  const { session, loading, error, tick } = useVideoSession({
    userId: user?.id,
    ...DEMO_LESSON,
  });

  if (!user) return <div className="p-6">Faça login para testar.</div>;

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-6">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <PlayCircle className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-base-content">Playground: Vídeo travado</h1>
            <p className="text-base-content/60 text-sm">
              Demonstração do LockedVideoPlayer. Mínimo: {DEMO_LESSON.minWatchPercent}%. Skip à frente é revertido.
            </p>
          </div>
        </div>
      </header>

      {error && <div className="alert alert-error"><span>{error}</span></div>}
      {loading && <div className="alert alert-info"><span>Carregando sessão...</span></div>}

      {session && (
        <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6 space-y-4">
          <LockedVideoPlayer videoUrl={DEMO_VIDEO_URL} session={session} onTick={tick} />
          <UnlockCountdown
            startedAt={session.completedAt}
            unlockAfterHours={DEMO_LESSON.unlockAfterHours}
          />
          <div className="text-xs text-base-content/50">
            Estado da sessão: {JSON.stringify({ watchPercent: session.watchPercent, lastPos: session.lastPositionSeconds, completedAt: session.completedAt }, null, 0)}
          </div>
        </div>
      )}
    </div>
  );
}
