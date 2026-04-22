'use client';

import { useCallback, useEffect, useState } from 'react';
import { mindMapService } from '@/application/mind-maps/MindMapService';
import { MindMapTemplate, MindMapState } from '@/domain/mind-maps/types';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

interface UseMindMapInput {
  lessonId?: string | null;
  templateId?: string | null;
}

export function useMindMap({ lessonId, templateId }: UseMindMapInput) {
  const user = useCurrentUser();
  const [template, setTemplate] = useState<MindMapTemplate | null>(null);
  const [state, setState] = useState<MindMapState | null>(null);
  const [loading, setLoading] = useState<boolean>(!!(lessonId || templateId));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!lessonId && !templateId) return;
    try {
      setLoading(true);
      setError(null);
      const t = lessonId
        ? await mindMapService.getTemplateByLesson(lessonId)
        : templateId
        ? await mindMapService.getTemplate(templateId)
        : null;
      setTemplate(t);
      if (t && user) {
        const s = await mindMapService.loadForStudent(user.id, t);
        setState(s);
      } else if (t) {
        setState({ nodes: t.nodes, edges: t.edges, positions: t.positions });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [lessonId, templateId, user?.id]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (next: MindMapState) => {
    if (!template || !user) return null;
    setSaving(true);
    setError(null);
    try {
      const res = await mindMapService.saveStudent(user.id, template, next);
      setState(next);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setSaving(false);
    }
  }, [template, user]);

  return { template, state, setState, loading, error, saving, save, reload: load };
}
