'use client';

import { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import {
  Play,
  Pause,
  Lock,
  CheckCircle2,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Captions,
  CaptionsOff,
} from 'lucide-react';
import { VideoSession } from '@/domain/video-player/types';
import { VideoSessionEntity } from '@/domain/video-player/entities/VideoSession';
import { useAutoHideControls } from '../../hooks/useAutoHideControls';
import { usePlayerFullscreen } from '../../hooks/usePlayerFullscreen';
import { useYouTubeCaptions } from '../../hooks/useYouTubeCaptions';
import { useScreenWakeLock } from '../../hooks/useScreenWakeLock';

interface LockedYouTubePlayerProps {
  videoId: string;
  session: VideoSession;
  onTick: (tick: { currentTime: number; duration: number }) => void;
}

export function LockedYouTubePlayer({ videoId, session, onTick }: LockedYouTubePlayerProps) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastPointerTypeRef = useRef<string>('mouse');
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [muted, setMuted] = useState(false);
  const lockState = VideoSessionEntity.lockState(session);
  const controls = useAutoHideControls({ enabled: playing });
  const fullscreen = usePlayerFullscreen(containerRef);
  const captions = useYouTubeCaptions(playerRef);
  useScreenWakeLock(playing);

  function applyVolume(v: number) {
    const p = playerRef.current;
    setVolume(v);
    if (v === 0) setMuted(true);
    else setMuted(false);
    if (!p) return;
    try {
      p.setVolume(v);
      if (v === 0) p.mute();
      else p.unMute();
    } catch {}
  }

  function toggleMute() {
    const p = playerRef.current;
    const next = !muted;
    setMuted(next);
    if (!p) return;
    try { next ? p.mute() : p.unMute(); } catch {}
  }

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
    // Resume cross-device: seekTo na posição salva.
    // getDuration() pode retornar 0 no onReady — não comparar com d.
    if (session.lastPositionSeconds > 0) {
      try {
        e.target.seekTo(session.lastPositionSeconds, true);
      } catch {
        // player ainda não pronto — ignora
      }
    }
  }

  function handleStateChange(e: YouTubeEvent<number>) {
    // 1 = playing, 2 = paused, 0 = ended
    if (e.data === 1) {
      setPlaying(true);
      captions.syncOnPlay();
    } else setPlaying(false);
  }

  // Touch: a tap only toggles the controls (like native mobile players); the
  // play/pause button handles playback. Mouse: click toggles playback.
  function handleOverlayClick() {
    if (lastPointerTypeRef.current === 'mouse') {
      togglePlay();
      controls.show();
      return;
    }
    if (controls.visible) controls.hide();
    else controls.show();
  }

  function togglePlay() {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  }

  const watchedSeconds = session.watchSeconds;
  const safePct = duration > 0 ? Math.min(100, (watchedSeconds / duration) * 100) : 0;
  const positionPct = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const showRewatchOverlay = !!session.completedAt;

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className={`overflow-hidden bg-black select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] ${
          fullscreen.isPseudo
            ? 'fixed inset-0 z-[9999] w-screen h-[100dvh]'
            : fullscreen.isFullscreen
              ? 'relative w-full h-full'
              : 'relative rounded-2xl aspect-video'
        }`}
        onPointerMove={e => {
          if (e.pointerType === 'mouse') controls.show();
        }}
        onMouseLeave={controls.hide}
      >
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
              cc_load_policy: 0,
              cc_lang_pref: 'pt',
              hl: 'pt-BR',
              origin: typeof window !== 'undefined' ? window.location.origin : undefined,
            },
          }}
          onReady={handleReady}
          onStateChange={handleStateChange}
          className="absolute inset-0 w-full h-full"
          iframeClassName="w-full h-full"
        />

        {/* Overlay transparente bloqueia clicks no iframe (impede link "Watch on YouTube") */}
        <div
          className={`absolute inset-0 pointer-events-auto touch-manipulation ${controls.visible ? 'cursor-pointer' : 'cursor-none'}`}
          onPointerDown={e => {
            lastPointerTypeRef.current = e.pointerType;
          }}
          onClick={handleOverlayClick}
          onDoubleClick={() => {
            if (lastPointerTypeRef.current === 'mouse') fullscreen.toggle();
          }}
        />

        {/* Botão central de play/pause (mobile sempre; desktop só pausado) */}
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
            controls.visible ? 'opacity-100' : 'opacity-0'
          } ${playing ? 'md:hidden' : ''}`}
        >
          <button
            type="button"
            onClick={() => {
              togglePlay();
              controls.show();
            }}
            className={`btn btn-circle btn-lg bg-black/50 hover:bg-black/70 text-white border-0 backdrop-blur-sm ${
              controls.visible ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
            aria-label={playing ? 'Pausar' : 'Reproduzir'}
            tabIndex={-1}
          >
            {playing ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
          </button>
        </div>

        {/* Custom controls */}
        <div
          className={`absolute bottom-0 inset-x-0 pt-6 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-2 sm:gap-3 transition-opacity duration-300 ${
            controls.visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } ${
            fullscreen.isFullscreen
              ? 'pb-[max(0.75rem,env(safe-area-inset-bottom))] px-[max(0.75rem,env(safe-area-inset-left))]'
              : 'px-2 pb-2 sm:px-3 sm:pb-3'
          }`}
          onPointerDown={controls.show}
        >
          <button
            onClick={togglePlay}
            className="btn btn-circle btn-sm bg-white/90 hover:bg-white text-black border-0 shrink-0"
            aria-label={playing ? 'Pausar' : 'Reproduzir'}
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <div
            className={`relative flex-1 min-w-0 h-8 md:h-2 touch-none group ${VideoSessionEntity.isMinimumReached(session) ? 'cursor-pointer' : ''}`}
            onClick={e => e.stopPropagation()}
            onPointerDown={e => {
              if (!VideoSessionEntity.isMinimumReached(session)) return;
              const p = playerRef.current;
              if (!p || duration <= 0) return;
              e.stopPropagation();
              const bar = e.currentTarget as HTMLDivElement;
              bar.setPointerCapture(e.pointerId);
              const seekFromEvent = (clientX: number) => {
                const rect = bar.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                setCurrentTime(ratio * duration);
                controls.show();
                try { p.seekTo(ratio * duration, true); } catch {}
              };
              seekFromEvent(e.clientX);
              const onMove = (ev: PointerEvent) => seekFromEvent(ev.clientX);
              const onUp = (ev: PointerEvent) => {
                bar.releasePointerCapture(ev.pointerId);
                bar.removeEventListener('pointermove', onMove);
                bar.removeEventListener('pointerup', onUp);
                bar.removeEventListener('pointercancel', onUp);
              };
              bar.addEventListener('pointermove', onMove);
              bar.addEventListener('pointerup', onUp);
              bar.addEventListener('pointercancel', onUp);
            }}
          >
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 bg-base-300/30 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full ${VideoSessionEntity.isMinimumReached(session) ? 'bg-success' : 'bg-primary'}`}
                style={{ width: `${safePct}%` }}
              />
              {showRewatchOverlay && (
                <div
                  className="absolute left-0 top-0 h-full bg-warning"
                  style={{ width: `${positionPct}%` }}
                />
              )}
            </div>
            {VideoSessionEntity.isMinimumReached(session) && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow ring-2 ring-primary -translate-x-1/2 transition-transform group-hover:scale-110 pointer-events-none"
                style={{ left: `${positionPct}%` }}
              />
            )}
          </div>
          <div className="text-[10px] sm:text-xs text-white/80 whitespace-nowrap font-mono shrink-0">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <div className="flex items-center gap-1 group shrink-0" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={toggleMute}
              className="btn btn-ghost btn-xs btn-circle text-white hover:bg-white/20"
              aria-label={muted ? 'Ativar som' : 'Silenciar'}
            >
              {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : volume < 50 ? <Volume1 className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={e => applyVolume(Number(e.target.value))}
              className="range range-xs w-16 hidden md:block"
              aria-label="Volume"
            />
          </div>
          <button
            type="button"
            onClick={captions.toggle}
            className={`btn btn-ghost btn-xs btn-circle text-white hover:bg-white/20 shrink-0 ${captions.enabled ? 'bg-white/20' : ''}`}
            aria-label={captions.enabled ? 'Desativar legendas' : 'Ativar legendas'}
            aria-pressed={captions.enabled}
            title={captions.enabled ? 'Desativar legendas' : 'Ativar legendas'}
          >
            {captions.enabled ? <Captions className="w-4 h-4" /> : <CaptionsOff className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={fullscreen.toggle}
            className="btn btn-ghost btn-xs btn-circle text-white hover:bg-white/20 shrink-0"
            aria-label={fullscreen.isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            title={fullscreen.isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {fullscreen.isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>

        {/* Badge lock */}
        {lockState !== 'unlocked' && (
          <div
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 bg-base-100/90 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium shadow pointer-events-none transition-opacity duration-300 ${
              controls.visible ? 'opacity-100' : 'opacity-0'
            }`}
          >
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
