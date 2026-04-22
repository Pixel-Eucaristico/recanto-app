'use client';

import { CheckCircle2, Circle, PlayCircle, PenLine, Award, MessageSquare } from 'lucide-react';
import { useLessonChecklist, ChecklistItemId } from '@/features/progress-checklist/hooks/useLessonChecklist';

interface LessonChecklistProps {
  userId: string | null;
  lessonId: string | null;
  moduleId: string | null;
  trackId: string | null;
  userHabitsBlocked?: boolean;
  /** Oculta itens não-obrigatórios dessa aula (default: só mostra obrigatórios). */
  showOptional?: boolean;
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
  showOptional = false,
}: LessonChecklistProps) {
  const { items, activeItems, completed, total, percent, loading, error } = useLessonChecklist({
    userId, lessonId, moduleId, trackId, userHabitsBlocked,
  });

  if (loading) return <div className="text-sm text-base-content/60">Carregando checklist...</div>;
  if (error) return <div className="alert alert-error text-sm"><span>{error}</span></div>;

  const rendered = showOptional ? items : activeItems;

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-base-content">Progresso da aula</h3>
          <span className="badge badge-primary">{completed} / {total}</span>
        </div>

        <progress className="progress progress-primary w-full" value={percent} max={100} />

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
