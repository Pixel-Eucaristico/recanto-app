'use client';

import { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { Play, Pause, Lock, CheckCircle2 } from 'lucide-react';
import { VideoSession } from '@/domain/video-player/types';
import { VideoSessionEntity } from '@/domain/video-player/entities/VideoSession';

interface LockedYouTubePlayerProps {
  videoId: string;
  session: VideoSession;
  onTick: (tick: { currentTime: number; duration: number }) => void;
}

export function LockedYouTubePlayer({ videoId, session, onTick }: LockedYouTubePlayerProps) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const lockState = VideoSessionEntity.lockState(session);

  // tick loop — lê player e repassa
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        const t = typeof p.getCurrentTime === 'function' ? p.getCurrentTime() : 0;
        const d = typeof p.getDuration === 'function' ? p.getDuration() : 0;
        setCurrentTime(t);
        setDuration(d);
        onTick({ currentTime: t, duration: d });
      } catch {
        // ignore — player may be detached
      }
    }, 500);
    return () => clearInterval(interval);
  }, [playing, onTick]);

  function handleReady(e: YouTubeEvent) {
    playerRef.current = e.target;
    const d = e.target.getDuration();
    setDuration(d);
    if (session.lastPositionSeconds > 0 && session.lastPositionSeconds < d) {
      e.target.seekTo(session.lastPositionSeconds, true);
    }
  }

  function handleStateChange(e: YouTubeEvent<number>) {
    // 1 = playing, 2 = paused, 0 = ended
    if (e.data === 1) setPlaying(true);
    else setPlaying(false);
  }

  function togglePlay() {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  }

  const watchedSeconds = session.watchSeconds;
  const safePct = duration > 0 ? Math.min(100, (watchedSeconds / duration) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
        <YouTube
          videoId={videoId}
          opts={{
            width: '100%',
            height: '100%',
            playerVars: {
              controls: 0,
              modestbranding: 1,
              rel: 0,
              iv_load_policy: 3,
              disablekb: 1,
              fs: 0,
              playsinline: 1,
              origin: typeof window !== 'undefined' ? window.location.origin : undefined,
            },
          }}
          onReady={handleReady}
          onStateChange={handleStateChange}
          className="absolute inset-0 w-full h-full"
          iframeClassName="w-full h-full"
        />

        {/* Overlay transparente bloqueia clicks no iframe (impede link "Watch on YouTube") */}
        <div className="absolute inset-0 pointer-events-auto" style={{ cursor: 'pointer' }} onClick={togglePlay} />

        {/* Custom controls */}
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="btn btn-circle btn-sm bg-white/90 hover:bg-white text-black border-0"
            aria-label={playing ? 'Pausar' : 'Reproduzir'}
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className={`h-full ${VideoSessionEntity.isMinimumReached(session) ? 'bg-success' : 'bg-primary'}`}
              style={{ width: `${safePct}%` }}
            />
          </div>
          <div className="text-xs text-white/80 whitespace-nowrap font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Badge lock */}
        {lockState !== 'unlocked' && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-base-100/90 px-3 py-1 rounded-full text-xs font-medium shadow">
            {lockState === 'unlockable' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Mínimo atingido</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-warning" />
                <span>{minimumLabel(session)}</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-base-content/60">
          <span>Assistido {formatTime(session.watchSeconds)}{session.minWatchSeconds > 0 ? ` / mín. ${formatTime(session.minWatchSeconds)}` : ''}</span>
          <span>{session.watchPercent.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function minimumLabel(session: VideoSession): string {
  if (session.minWatchSeconds > 0) {
    return `Assista ${formatTime(session.minWatchSeconds)} ou ${session.minWatchPercent}%`;
  }
  return `Assista ${session.minWatchPercent}% para continuar`;
}
