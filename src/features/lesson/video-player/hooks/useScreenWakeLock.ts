'use client';

import { useEffect } from 'react';

/**
 * Keeps the phone screen awake while `active` is true (e.g. while the lesson video plays).
 * Silently does nothing where the Screen Wake Lock API is unavailable.
 */
export function useScreenWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (cancelled) lock.release().catch(() => {});
        else sentinel = lock;
      } catch {
        // Denied (low battery, not visible, etc.) — ignore.
      }
    };

    // The lock is released automatically when the tab is hidden; re-acquire on return.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') request();
    };

    request();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      sentinel?.release().catch(() => {});
    };
  }, [active]);
}
