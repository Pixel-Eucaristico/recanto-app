'use client';

import { RefObject, useCallback, useEffect, useState } from 'react';

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: 'landscape') => Promise<void>;
};

function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

function isNativeFullscreenSupported(): boolean {
  const doc = document as FullscreenDocument;
  return !!(doc.fullscreenEnabled || doc.webkitFullscreenEnabled);
}

/**
 * Fullscreen for the player container (not the iframe), so the protective overlay
 * and custom controls stay on top of the YouTube player.
 *
 * iPhone Safari does not support the Fullscreen API on non-<video> elements, so it
 * falls back to a "pseudo fullscreen" (fixed overlay covering the viewport).
 */
export function usePlayerFullscreen(containerRef: RefObject<HTMLElement | null>) {
  const [isNative, setIsNative] = useState(false);
  const [isPseudo, setIsPseudo] = useState(false);

  useEffect(() => {
    const onChange = () => setIsNative(getFullscreenElement() === containerRef.current);
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, [containerRef]);

  // Pseudo fullscreen: lock page scroll and allow Esc to exit.
  useEffect(() => {
    if (!isPseudo) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPseudo(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isPseudo]);

  const enter = useCallback(async () => {
    const el = containerRef.current as FullscreenElement | null;
    if (!el) return;
    if (!isNativeFullscreenSupported()) {
      setIsPseudo(true);
      return;
    }
    try {
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
      else await el.webkitRequestFullscreen?.();
      // Android Chrome: rotate to landscape while in fullscreen.
      await (screen.orientation as LockableOrientation | undefined)?.lock?.('landscape');
    } catch {
      if (!getFullscreenElement()) setIsPseudo(true);
    }
  }, [containerRef]);

  const exit = useCallback(async () => {
    if (isPseudo) {
      setIsPseudo(false);
      return;
    }
    const doc = document as FullscreenDocument;
    try {
      screen.orientation?.unlock?.();
    } catch {}
    try {
      if (doc.exitFullscreen) await doc.exitFullscreen();
      else await doc.webkitExitFullscreen?.();
    } catch {}
  }, [isPseudo]);

  const isFullscreen = isNative || isPseudo;

  const toggle = useCallback(() => {
    if (isFullscreen) exit();
    else enter();
  }, [isFullscreen, enter, exit]);

  return { isFullscreen, isPseudo, toggle };
}
