'use client';

import { useCallback, useEffect, useState } from 'react';
import { reflectionService } from '@/application/spiritual-notebook/ReflectionService';
import { Reflection } from '@/domain/spiritual-notebook/types';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

interface LessonContext {
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  trackId: string;
  trackTitle: string;
}

export function useReflection(ctx: LessonContext | null) {
  const user = useCurrentUser();
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [loading, setLoading] = useState<boolean>(!!ctx);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const userId = user?.id;
  const lessonId = ctx?.lessonId;

  useEffect(() => {
    if (!lessonId || !userId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const existing = await reflectionService.findByLesson(userId, lessonId);
        if (!cancelled) setReflection(existing);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId, lessonId]);

  const saveDraft = useCallback(async (content: string) => {
    if (!ctx || !user) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await reflectionService.saveDraft({
        userId: user.id,
        ...ctx,
        content,
      });
      setReflection(saved);
      return saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setSaving(false);
    }
  }, [ctx, user]);

  const submit = useCallback(async () => {
    if (!reflection) return;
    setSaving(true);
    setError(null);
    try {
      const submitted = await reflectionService.submit(reflection.id);
      setReflection(submitted);
      return submitted;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setSaving(false);
    }
  }, [reflection]);

  return { reflection, loading, error, saving, saveDraft, submit };
}
