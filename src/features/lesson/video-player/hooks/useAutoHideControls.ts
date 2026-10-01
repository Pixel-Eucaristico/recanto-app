'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAutoHideControlsOptions {
  /** Controls only auto-hide while this is true (e.g. while the video is playing). */
  enabled: boolean;
  /** Idle time in ms before hiding. */
  delayMs?: number;
}

/**
 * Shows player controls on user activity and hides them after a period of inactivity.
 * While `enabled` is false (paused/ended), controls stay visible.
 */
export function useAutoHideControls({ enabled, delayMs = 3000 }: UseAutoHideControlsOptions) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    setVisible(true);
    clearTimer();
    if (enabled) {
      timerRef.current = setTimeout(() => setVisible(false), delayMs);
    }
  }, [enabled, delayMs, clearTimer]);

  const hide = useCallback(() => {
    clearTimer();
    if (enabled) setVisible(false);
  }, [enabled, clearTimer]);

  // Restart the idle timer whenever playback starts; keep visible while paused.
  useEffect(() => {
    show();
    return clearTimer;
  }, [show, clearTimer]);

  return { visible, show, hide };
}
