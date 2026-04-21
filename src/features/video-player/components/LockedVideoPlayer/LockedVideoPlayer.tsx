'use client';

import { useEffect, useRef } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { VideoSession } from '@/domain/video-player/types';
import { VideoSessionEntity } from '@/domain/video-player/entities/VideoSession';
import { WatchProgressBar } from '../WatchProgressBar';

interface LockedVideoPlayerProps {
  videoUrl: string;
  session: VideoSession;
  onTick: (tick: { currentTime: number; duration: number }) => void;
}

export function LockedVideoPlayer({ videoUrl, session, onTick }: LockedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lockState = VideoSessionEntity.lockState(session);

  // resume position
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
    if (v.currentTime > maxAllowed) {
      // reverte skip
      v.currentTime = maxAllowed;
    }
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
                <span>Assista {session.minWatchPercent}% para continuar</span>
              </>
            )}
          </div>
        )}
      </div>

      <WatchProgressBar
        watchPercent={session.watchPercent}
        minWatchPercent={session.minWatchPercent}
      />
    </div>
  );
}
