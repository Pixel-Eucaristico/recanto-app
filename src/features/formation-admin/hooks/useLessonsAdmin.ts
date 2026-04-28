'use client';

import { useCallback, useEffect, useState } from 'react';
import { formationAdminService } from '@/application/formation/FormationAdminService';
import type { FormationLesson } from '@/domain/formation/types';

export function useLessonsAdmin(moduleId: string | null) {
  const [lessons, setLessons] = useState<FormationLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!moduleId) { setLessons([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      setLessons(await formationAdminService.listLessonsByModule(moduleId));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => { reload(); }, [reload]);

  async function save(input: Parameters<typeof formationAdminService.saveLesson>[0]): Promise<FormationLesson> {
    setSaving(true);
    setError(null);
    try {
      const result = await formationAdminService.saveLesson(input);
      await reload();
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setSaving(false);
    }
  }

  async function remove(lessonId: string): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      await formationAdminService.deleteLesson(lessonId);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setSaving(false);
    }
  }

  return { lessons, loading, saving, error, reload, save, remove };
}
