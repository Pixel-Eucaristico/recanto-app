'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { lessonPageService, LessonPageData } from '@/application/lesson/LessonPageService';
import { lessonProgressReconciler } from '@/application/formation/LessonProgressReconciler';

export function useLessonPage(trackId: string, lessonId: string, userId: string | null, habitsBlocked = false) {
  const [data, setData] = useState<LessonPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reconciledKey = useRef<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await lessonPageService.getLessonPage(trackId, lessonId, userId, habitsBlocked);
      // Reconciler — idempotente, roda uma vez por (user, lesson) até reload explícito
      const key = `${userId}_${lessonId}`;
      if (reconciledKey.current !== key) {
        reconciledKey.current = key;
        const rc = await lessonProgressReconciler.reconcile(userId, result.lesson, result.module.id, result.track.id);
        if (rc.updated) {
          const fresh = await lessonPageService.getLessonPage(trackId, lessonId, userId, habitsBlocked);
          setData(fresh);
          return;
        }
      }
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [trackId, lessonId, userId, habitsBlocked]);

  useEffect(() => {
    load();
  }, [load]);

  const reload = useCallback(async () => {
    reconciledKey.current = null;
    await load();
  }, [load]);

  return { data, loading, error, reload };
}
