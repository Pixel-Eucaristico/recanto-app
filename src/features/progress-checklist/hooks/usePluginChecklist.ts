'use client';

import { useEffect, useState } from 'react';
import type { FormationLesson } from '@/domain/formation/types';
import type { LessonComponentInstance, LessonComponentRuntimeContext } from '@/domain/lesson-components/types';
import { getLessonComponent } from '@/application/lesson/LessonComponentRegistry';
import { effectiveComponents } from '@/domain/lesson-components/migrationShim';

export interface PluginChecklistItem {
  instance: LessonComponentInstance;
  label: string;
  description?: string;
  required: boolean;
  done: boolean;
  /** Quando plugin não está registrado, usado pra mostrar erro graceful. */
  missingPlugin?: boolean;
}

interface UsePluginChecklistArgs {
  lesson: FormationLesson | null;
  ctx: LessonComponentRuntimeContext | null;
  /** Bump pra forçar reload (ex: ao concluir uma atividade). */
  refreshKey?: number;
}

export function usePluginChecklist({ lesson, ctx, refreshKey }: UsePluginChecklistArgs) {
  const [items, setItems] = useState<PluginChecklistItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lesson || !ctx) {
      setItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    const components = effectiveComponents(lesson);

    if (components.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(components.map(async inst => {
      const plugin = getLessonComponent(inst.kind);
      if (!plugin) {
        return {
          instance: inst,
          label: `Plugin "${inst.kind}" ausente`,
          required: inst.required,
          done: false,
          missingPlugin: true,
        } as PluginChecklistItem;
      }
      const summary = plugin.summary(inst.config);
      const done = await plugin.isCompleted(inst.config, ctx).catch(() => false);
      return {
        instance: inst,
        label: summary.label,
        description: summary.description,
        required: inst.required,
        done,
      } as PluginChecklistItem;
    })).then(result => {
      if (cancelled) return;
      setItems(result);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [lesson?.id, ctx?.userId, ctx?.lessonId, refreshKey]);

  const required = items.filter(i => i.required);
  const completed = required.filter(i => i.done).length;
  const total = required.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { items, required, completed, total, percent, loading };
}
