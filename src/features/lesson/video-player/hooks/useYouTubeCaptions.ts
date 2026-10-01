'use client';

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import type { YouTubePlayer } from 'react-youtube';

const STORAGE_KEY = 'lesson-video-captions';
const PREFERRED_LANGUAGE = 'pt';

/** Undocumented-but-stable IFrame API methods used to control the captions module. */
interface CaptionsCapablePlayer {
  loadModule?: (module: string) => void;
  unloadModule?: (module: string) => void;
  getOption?: (module: string, option: string) => unknown;
  setOption?: (module: string, option: string, value: unknown) => void;
}

interface CaptionTrack {
  languageCode?: string;
}

function readPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
}

function savePreference(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
  } catch {}
}

/**
 * Captions on/off for the YouTube IFrame player.
 *
 * `cc_load_policy: 0` cannot force captions off — YouTube still honours the viewer's
 * account preference or the uploader's default. The only reliable way is unloading the
 * captions module once playback starts (the module loads lazily on play).
 */
export function useYouTubeCaptions(playerRef: RefObject<YouTubePlayer | null>) {
  const [enabled, setEnabled] = useState(false);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  // Read after mount to avoid SSR hydration mismatch.
  useEffect(() => {
    setEnabled(readPreference());
  }, []);

  const apply = useCallback(
    (on: boolean) => {
      const p = playerRef.current as CaptionsCapablePlayer | null;
      if (!p) return;
      try {
        if (on) {
          p.loadModule?.('captions');
          // Track list is only available shortly after the module loads.
          setTimeout(() => {
            try {
              const tracks = (p.getOption?.('captions', 'tracklist') ?? []) as CaptionTrack[];
              const preferred =
                tracks.find(t => t.languageCode?.startsWith(PREFERRED_LANGUAGE)) ?? tracks[0];
              if (preferred?.languageCode) {
                p.setOption?.('captions', 'track', { languageCode: preferred.languageCode });
              }
            } catch {}
          }, 500);
        } else {
          p.unloadModule?.('captions');
          p.unloadModule?.('cc'); // legacy (Flash-era) module name, harmless if absent
        }
      } catch {
        // player detached
      }
    },
    [playerRef]
  );

  /** Call when the player enters the "playing" state to enforce the current preference. */
  const syncOnPlay = useCallback(() => {
    if (enabledRef.current) return;
    apply(false);
    // The captions module can attach a moment after the state change.
    setTimeout(() => {
      if (!enabledRef.current) apply(false);
    }, 600);
  }, [apply]);

  const toggle = useCallback(() => {
    const next = !enabledRef.current;
    setEnabled(next);
    savePreference(next);
    apply(next);
  }, [apply]);

  return { enabled, toggle, syncOnPlay };
}
