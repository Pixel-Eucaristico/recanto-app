'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, PlayCircle, PenLine, Award, MessageSquare, History } from 'lucide-react';
import { useLessonChecklist, ChecklistItemId } from '@/features/progress-checklist/hooks/useLessonChecklist';
import { usePluginChecklist } from '@/features/progress-checklist/hooks/usePluginChecklist';
import { getLessonComponent } from '@/application/lesson/LessonComponentRegistry';
import { LessonHistoryDrawer } from '@/features/lesson/components/LessonHistoryDrawer';
import type { LessonComponentInstance } from '@/domain/lesson-components/types';

interface LessonChecklistProps {
  userId: string | null;
  lessonId: string | null;
  moduleId: string | null;
  trackId: string | null;
  userHabitsBlocked?: boolean;
  /** Se false, esconde os itens opcionais. Default mostra todos com badge "opcional". */
  showOptional?: boolean;
  /** Bump pra recarregar status dos plugins. */
  refreshKey?: number;
}

const ICONS: Record<ChecklistItemId, React.ComponentType<{ className?: string }>> = {
  video: PlayCircle,
  reflection: PenLine,
  quiz: Award,
  forum: MessageSquare,
};

export function LessonChecklist({
  userId,
  lessonId,
  moduleId,
  trackId,
  userHabitsBlocked,
  showOptional = true,
  refreshKey,
}: LessonChecklistProps) {
  const legacy = useLessonChecklist({
    userId, lessonId, moduleId, trackId, userHabitsBlocked,
  });
  const lesson = legacy.lesson;
  const ctx = userId && lessonId && moduleId && trackId
    ? { userId, lessonId, moduleId, trackId }
    : null;
  const pluginCk = usePluginChecklist({ lesson, ctx, refreshKey });
  const [historyOpen, setHistoryOpen] = useState<LessonComponentInstance | null>(null);

  if (legacy.loading || pluginCk.loading) return <div className="text-sm text-base-content/60">Carregando checklist...</div>;
  if (legacy.error) return <div className="alert alert-error text-sm"><span>{legacy.error}</span></div>;

  // Quando aula tem componentes (próprios ou derivados via shim), usa plugin checklist.
  if (pluginCk.items.length > 0) {
    const renderedPlugin = showOptional ? pluginCk.items : pluginCk.required;
    return (
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-3 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-base-content">Progresso da aula</h3>
            <span className="badge badge-primary">{pluginCk.completed} / {pluginCk.total}</span>
          </div>

          <progress className="progress progress-primary w-full" value={pluginCk.percent} max={100} />

          <ul className="space-y-2">
            {renderedPlugin.map(item => {
              const plugin = getLessonComponent(item.instance.kind);
              const Icon = plugin?.icon;
              const hasHistory = Boolean(plugin?.getHistory);
              return (
                <li key={item.instance.id} className="flex items-start gap-2">
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-base-content/40 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      {Icon && <Icon className="w-3.5 h-3.5 text-primary/70" />}
                      <span className={`text-sm ${item.done ? 'text-success line-through' : 'text-base-content'}`}>
                        {item.label}
                      </span>
                      {!item.required && <span className="badge badge-ghost badge-xs">opcional</span>}
                      {item.missingPlugin && <span className="badge badge-error badge-xs">plugin ausente</span>}
                      {hasHistory && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs ml-auto"
                          onClick={() => setHistoryOpen(item.instance)}
                          aria-label="Ver histórico"
                          title="Histórico"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-base-content/60">{item.description}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {historyOpen && ctx && (
          <LessonHistoryDrawer
            instance={historyOpen}
            ctx={ctx}
            open={Boolean(historyOpen)}
            onClose={() => setHistoryOpen(null)}
          />
        )}
      </div>
    );
  }

  // Fallback final (sem video_url, sem flags, sem components) — branco
  const rendered = showOptional ? legacy.items : legacy.activeItems;

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-base-content">Progresso da aula</h3>
          <span className="badge badge-primary">{legacy.completed} / {legacy.total}</span>
        </div>

        <progress className="progress progress-primary w-full" value={legacy.percent} max={100} />

        <ul className="space-y-2">
          {rendered.map(item => {
            const Icon = ICONS[item.id];
            return (
              <li key={item.id} className="flex items-start gap-2">
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-base-content/40 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <Icon className="w-3.5 h-3.5 text-primary/70" />
                    <span className={`text-sm ${item.done ? 'text-success line-through' : 'text-base-content'}`}>
                      {item.label}
                    </span>
                    {!item.required && (
                      <span className="badge badge-ghost badge-xs">opcional</span>
                    )}
                  </div>
                  <p className="text-xs text-base-content/60">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>

        {rendered.length === 0 && (
          <p className="text-xs text-base-content/60 text-center py-2">
            Nenhum requisito ativo pra essa aula.
          </p>
        )}
      </div>
    </div>
  );
}
