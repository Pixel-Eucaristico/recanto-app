'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { videoSessionService } from '@/application/video-player/VideoSessionService';
import { videoWatchSessionRepository } from '@/infrastructure/video-player/VideoWatchSessionRepository';
import { VideoSession, VideoTickInput } from '@/domain/video-player/types';
import { VideoSessionEntity } from '@/domain/video-player/entities/VideoSession';

interface UseVideoSessionInput {
  userId: string | null | undefined;
  lessonId: string;
  moduleId: string;
  trackId: string;
  minWatchPercent: number;
  minWatchSeconds?: number;
  durationSeconds: number;
}

const SAVE_DEBOUNCE_MS = 3000;

export function useVideoSession(input: UseVideoSessionInput) {
  const [session, setSession] = useState<VideoSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchCount, setWatchCount] = useState<number>(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSession = useRef<VideoSession | null>(null);
  // Marca se já registrou a sessão dessa montagem (evita duplicar quando cruza min novamente)
  const sessionLogged = useRef(false);
  // Marca o início do tracking dentro dessa montagem pra calcular seconds_watched
  const mountStart = useRef<{ pos: number; sec: number; at: string } | null>(null);

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
          minWatchSeconds: input.minWatchSeconds,
          durationSeconds: input.durationSeconds,
        });
        if (!cancelled) {
          setSession(s);
          latestSession.current = s;
          mountStart.current = {
            pos: s.lastPositionSeconds,
            sec: s.watchSeconds,
            at: new Date().toISOString(),
          };
        }

        // Conta apenas visualizações COMPLETAS já armazenadas
        try {
          const count = await videoWatchSessionRepository.countByUserAndLesson(input.userId!, input.lessonId);
          if (!cancelled) setWatchCount(count);
        } catch {
          // count é nice-to-have
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [input.userId, input.lessonId, input.moduleId, input.trackId, input.minWatchPercent, input.minWatchSeconds, input.durationSeconds]);

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

  /** Registra UMA entry de sessão completa quando o usuário cruza o mínimo nessa montagem. */
  const logCompletedSession = useCallback(async () => {
    if (sessionLogged.current) return;
    if (!input.userId || !mountStart.current || !latestSession.current) return;
    sessionLogged.current = true;
    const s = latestSession.current;
    const start = mountStart.current;
    const wasAlreadyComplete = !!s.completedAt;
    const deltaWatched = Math.max(0, s.watchSeconds - start.sec);
    try {
      await videoWatchSessionRepository.start({
        user_id: input.userId,
        lesson_id: input.lessonId,
        module_id: input.moduleId,
        track_id: input.trackId,
        started_at: start.at,
        max_position_seconds: s.lastPositionSeconds,
        seconds_watched: deltaWatched,
        is_rewatch: wasAlreadyComplete,
      });
      // Já que é "completa", também grava ended_at imediatamente
      // (o repo.start não inclui ended_at, então fazemos um update aqui se necessário —
      //  pra simplicidade, considera que a sessão termina ao atingir o mínimo)
      const newCount = await videoWatchSessionRepository.countByUserAndLesson(input.userId, input.lessonId);
      setWatchCount(newCount);
    } catch {
      // log não-crítico
    }
  }, [input.userId, input.lessonId, input.moduleId, input.trackId]);

  const tick = useCallback((t: VideoTickInput) => {
    let justReachedMin = false;
    setSession(prev => {
      if (!prev) return prev;
      const next = VideoSessionEntity.tick(prev, t);
      const wasMet = VideoSessionEntity.isMinimumReached(prev);
      const isMet = VideoSessionEntity.isMinimumReached(next);
      if (!wasMet && isMet) justReachedMin = true;
      latestSession.current = next;
      return next;
    });
    if (justReachedMin) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      flushSave();
      logCompletedSession();
    } else {
      scheduleSave();
    }
  }, [scheduleSave, flushSave, logCompletedSession]);

  // Flush no unmount (não cria sessão se não chegou ao mínimo)
  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    flushSave();
  }, [flushSave]);

  return { session, loading, error, tick, flushSave, watchCount };
}
