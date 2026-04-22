'use client';

import { useEffect, useRef } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { VideoSession } from '@/domain/video-player/types';
import { VideoSessionEntity } from '@/domain/video-player/entities/VideoSession';
import { WatchProgressBar } from '../WatchProgressBar';
import { LockedYouTubePlayer } from '../LockedYouTubePlayer';
import { parseVideoSource } from '../../utils/parseVideoSource';

interface LockedVideoPlayerProps {
  videoUrl: string;
  session: VideoSession;
  onTick: (tick: { currentTime: number; duration: number }) => void;
}

export function LockedVideoPlayer({ videoUrl, session, onTick }: LockedVideoPlayerProps) {
  const source = parseVideoSource(videoUrl);

  if (source.kind === 'youtube') {
    return <LockedYouTubePlayer videoId={source.value} session={session} onTick={onTick} />;
  }

  return <LockedMp4Player videoUrl={source.value} session={session} onTick={onTick} />;
}

function LockedMp4Player({ videoUrl, session, onTick }: LockedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lockState = VideoSessionEntity.lockState(session);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onLoaded = () => {
      if (session.lastPositionSeconds > 0 && session.lastPositionSeconds < v.duration) {
        v.currentTime = session.lastPositionSeconds;
      }
    };
    v.addEventListener('loadedmetadata', onLoaded);
    return () => v.removeEventListener('loadedmetadata', onLoaded);
  }, [videoUrl]);

  function handleTimeUpdate() {
    const v = videoRef.current;
    if (!v) return;
    onTick({ currentTime: v.currentTime, duration: v.duration || session.durationSeconds });
  }

  function handleSeeking() {
    const v = videoRef.current;
    if (!v) return;
    const maxAllowed = VideoSessionEntity.maxAllowedSeekSeconds(session);
    if (v.currentTime > maxAllowed) v.currentTime = maxAllowed;
  }

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden bg-base-300 aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          controlsList="nodownload noplaybackrate"
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
          className="w-full h-full"
        />
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

      <WatchProgressBar
        watchPercent={session.watchPercent}
        watchSeconds={session.watchSeconds}
        minWatchPercent={session.minWatchPercent}
        minWatchSeconds={session.minWatchSeconds}
      />
    </div>
  );
}

function minimumLabel(session: VideoSession): string {
  if (session.minWatchSeconds > 0) {
    const m = Math.floor(session.minWatchSeconds / 60);
    const s = Math.floor(session.minWatchSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')} ou ${session.minWatchPercent}%`;
  }
  return `Assista ${session.minWatchPercent}% para continuar`;
}
