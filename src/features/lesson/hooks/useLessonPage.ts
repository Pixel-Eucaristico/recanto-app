'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { lessonPageService, LessonPageData } from '@/application/lesson/LessonPageService';
import { lessonProgressReconciler } from '@/application/formation/LessonProgressReconciler';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';

export function useLessonPage(trackId: string, lessonId: string, userId: string | null, habitsBlocked = false) {
  const [data, setData] = useState<LessonPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reconciledKey = useRef<string | null>(null);
  const lastStatusRef = useRef<string | null>(null);
  const dataRef = useRef<LessonPageData | null>(null);
  dataRef.current = data;

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await lessonPageService.getLessonPage(trackId, lessonId, userId, habitsBlocked);
      const key = `${userId}_${lessonId}`;
      if (reconciledKey.current !== key) {
        reconciledKey.current = key;
        const rc = await lessonProgressReconciler.reconcile(userId, result.lesson, result.module.id, result.track.id);
        if (rc.updated) {
          const fresh = await lessonPageService.getLessonPage(trackId, lessonId, userId, habitsBlocked);
          setData(fresh);
          lastStatusRef.current = fresh.progress?.status ?? null;
          return;
        }
      }
      setData(result);
      lastStatusRef.current = result.progress?.status ?? null;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [trackId, lessonId, userId, habitsBlocked]);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * Subscribe enxuto:
   * - Roda reconciler quando snapshot mostra um doc cujo status não é 'completed'
   *   (pra avaliar se obrigatórias acabaram de ficar todas verdadeiras).
   * - Reload completo SOMENTE quando o status realmente mudou — evita loop.
   */
  useEffect(() => {
    if (!userId || !lessonId) return;
    let initial = true;
    let reconciling = false;
    const unsub = progressRepository.subscribe(userId, lessonId, async snap => {
      if (initial) {
        initial = false;
        lastStatusRef.current = snap?.status ?? null;
        return;
      }
      if (!snap) return;
      if (reconciling) return;

      const prevStatus = lastStatusRef.current;
      lastStatusRef.current = snap.status;

      // Status mudou (ex: -> completed): reload pra atualizar unlock da próxima
      if (snap.status !== prevStatus) {
        reconciledKey.current = null;
        await load();
        return;
      }

      // Mesmo status mas pode ter virado completable (todas obrigatórias feitas).
      // Roda reconciler — se subir pra completed, snapshot fira de novo e cai no caso anterior.
      if (snap.status !== 'completed' && dataRef.current) {
        reconciling = true;
        try {
          await lessonProgressReconciler.reconcile(
            userId,
            dataRef.current.lesson,
            dataRef.current.module.id,
            dataRef.current.track.id,
          );
        } finally {
          reconciling = false;
        }
      }
    });
    return () => unsub();
  }, [userId, lessonId, load]);

  const reload = useCallback(async () => {
    reconciledKey.current = null;
    await load();
  }, [load]);

  return { data, loading, error, reload };
}
