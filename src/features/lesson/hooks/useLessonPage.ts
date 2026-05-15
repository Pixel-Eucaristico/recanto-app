'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { lessonPageService, LessonPageData } from '@/application/lesson/LessonPageService';
import { lessonProgressReconciler } from '@/application/formation/LessonProgressReconciler';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';

/**
 * Merge stable: quando lesson/track/module IDs + updated_at iguais, preserva refs antigas.
 * Evita LessonVideoSection / LockedYouTubePlayer remount em cada reload (trocavam lesson.ref
 * mesmo sem conteúdo mudar). Só progress + unlockResult realmente trocam após activity submit.
 */
function mergeStable(prev: LessonPageData | null, next: LessonPageData): LessonPageData {
  if (!prev) return next;
  const lessonStable = prev.lesson.id === next.lesson.id && prev.lesson.updated_at === next.lesson.updated_at;
  const trackStable = prev.track.id === next.track.id && prev.track.updated_at === next.track.updated_at;
  const moduleStable = prev.module.id === next.module.id && prev.module.updated_at === next.module.updated_at;
  return {
    ...next,
    track: trackStable ? prev.track : next.track,
    module: moduleStable ? prev.module : next.module,
    lesson: lessonStable ? prev.lesson : next.lesson,
  };
}

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
          setData(prev => mergeStable(prev, fresh));
          lastStatusRef.current = fresh.progress?.status ?? null;
          return;
        }
      }
      setData(prev => mergeStable(prev, result));
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

      // Atualiza data.progress granular SEM re-fetch da lesson — push real-time.
      // Componentes que dependem de progress (header, checklist) re-renderizam só.
      // lesson/track/module refs preservadas → LockedYouTubePlayer não remonta.
      setData(prev => prev ? { ...prev, progress: snap } : prev);

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

  /**
   * Trigger leve após activity submit: roda reconciler, sem fetch da lesson inteira.
   * Reconciler grava progress doc → Firebase onSnapshot dispara automaticamente em
   * TODOS hooks subscribers (useLessonPage, useLessonChecklist, sidebar, header) →
   * UI atualiza granular sem re-fetch. Zero re-render desnecessário.
   */
  const triggerReconcile = useCallback(async () => {
    if (!userId || !dataRef.current) return;
    try {
      await lessonProgressReconciler.reconcile(
        userId,
        dataRef.current.lesson,
        dataRef.current.module.id,
        dataRef.current.track.id,
      );
      // Não chama setData. onSnapshot do progress doc fará isso (push real-time).
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [userId]);

  return { data, loading, error, reload, refreshProgress: triggerReconcile };
}
