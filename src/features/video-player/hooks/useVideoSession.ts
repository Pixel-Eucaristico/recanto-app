'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { videoSessionService } from '@/application/video-player/VideoSessionService';
import { VideoSession, VideoTickInput } from '@/domain/video-player/types';
import { VideoSessionEntity } from '@/domain/video-player/entities/VideoSession';

interface UseVideoSessionInput {
  userId: string | null | undefined;
  lessonId: string;
  moduleId: string;
  trackId: string;
  minWatchPercent: number;
  durationSeconds: number;
}

const SAVE_DEBOUNCE_MS = 3000;

export function useVideoSession(input: UseVideoSessionInput) {
  const [session, setSession] = useState<VideoSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSession = useRef<VideoSession | null>(null);

  useEffect(() => {
    if (!input.userId || !input.lessonId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const s = await videoSessionService.load({
          userId: input.userId!,
          lessonId: input.lessonId,
          moduleId: input.moduleId,
          trackId: input.trackId,
          minWatchPercent: input.minWatchPercent,
          durationSeconds: input.durationSeconds,
        });
        if (!cancelled) {
          setSession(s);
          latestSession.current = s;
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [input.userId, input.lessonId, input.moduleId, input.trackId, input.minWatchPercent, input.durationSeconds]);

  const flushSave = useCallback(async () => {
    if (!latestSession.current) return;
    try {
      await videoSessionService.save(latestSession.current);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { flushSave(); }, SAVE_DEBOUNCE_MS);
  }, [flushSave]);

  const tick = useCallback((t: VideoTickInput) => {
    setSession(prev => {
      if (!prev) return prev;
      const next = VideoSessionEntity.tick(prev, t);
      latestSession.current = next;
      return next;
    });
    scheduleSave();
  }, [scheduleSave]);

  // flush on unmount
  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    flushSave();
  }, [flushSave]);

  return { session, loading, error, tick, flushSave };
}
