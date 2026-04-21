'use client';

import { useState } from 'react';
import { PlayCircle } from 'lucide-react';
import { LockedVideoPlayer, UnlockCountdown, useVideoSession } from '@/features/video-player';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

const DEMO_VIDEOS = [
  { label: 'YouTube — Fireship (curto, unlisted funciona igual)', url: 'https://www.youtube.com/watch?v=O6xtMrDEhcE' },
  { label: 'YouTube — short', url: 'https://youtu.be/DHjqpvDnNGE' },
  { label: 'MP4 — Mozilla flower (15s)', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
  { label: 'MP4 — w3schools bunny', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
];

const DEMO_LESSON = {
  lessonId: 'playground-lesson',
  moduleId: 'playground-module',
  trackId: 'playground-track',
  unlockAfterHours: 0,
};

export default function VideoPlayerPlaygroundPage() {
  const user = useCurrentUser();
  const [videoUrl, setVideoUrl] = useState<string>(DEMO_VIDEOS[0].url);
  const [minWatchPercent, setMinWatchPercent] = useState<number>(50);
  const [minWatchSeconds, setMinWatchSeconds] = useState<number>(0);

  const { session, loading, error, tick } = useVideoSession({
    userId: user?.id,
    lessonId: DEMO_LESSON.lessonId,
    moduleId: DEMO_LESSON.moduleId,
    trackId: DEMO_LESSON.trackId,
    minWatchPercent,
    minWatchSeconds,
    durationSeconds: 0,
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
              Aceita MP4 ou YouTube (inclusive unlisted). Mínimo por % ou por segundos — qualquer um libera.
            </p>
          </div>
        </div>
      </header>

      <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-4 space-y-3">
        <label className="form-control w-full">
          <span className="label-text text-xs mb-1">URL do vídeo (MP4 ou YouTube)</span>
          <input
            type="url"
            className="input input-bordered input-sm w-full"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            placeholder="https://..."
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="form-control">
            <span className="label-text text-xs mb-1">% mínimo (1–100)</span>
            <input
              type="number"
              className="input input-bordered input-sm"
              min={1}
              max={100}
              value={minWatchPercent}
              onChange={e => setMinWatchPercent(Number(e.target.value) || 50)}
            />
          </label>
          <label className="form-control">
            <span className="label-text text-xs mb-1">Tempo mínimo em segundos (0 = desativado)</span>
            <input
              type="number"
              className="input input-bordered input-sm"
              min={0}
              value={minWatchSeconds}
              onChange={e => setMinWatchSeconds(Number(e.target.value) || 0)}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {DEMO_VIDEOS.map(v => (
            <button
              key={v.url}
              className={`btn btn-xs ${videoUrl === v.url ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setVideoUrl(v.url)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-error"><span>{error}</span></div>}
      {loading && <div className="alert alert-info"><span>Carregando sessão...</span></div>}

      {session && (
        <div className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6 space-y-4">
          <LockedVideoPlayer videoUrl={videoUrl} session={session} onTick={tick} />
          <UnlockCountdown
            startedAt={session.completedAt}
            unlockAfterHours={DEMO_LESSON.unlockAfterHours}
          />
          <div className="text-xs text-base-content/50 break-all">
            Estado: watchPercent={session.watchPercent.toFixed(2)}, watchSeconds={session.watchSeconds.toFixed(1)}, lastPos={session.lastPositionSeconds.toFixed(1)}, duration={session.durationSeconds.toFixed(0)}, completedAt={session.completedAt || '—'}
          </div>
        </div>
      )}
    </div>
  );
}
