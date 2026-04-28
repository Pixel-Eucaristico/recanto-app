'use client';

import { CheckCircle2, FolderOpen } from 'lucide-react';
import { useTrackChecklist } from '@/features/progress-checklist/hooks/useTrackChecklist';

interface TrackChecklistProps {
  userId: string | null;
  trackId: string | null;
  userHabitsBlocked?: boolean;
}

export function TrackChecklist({ userId, trackId, userHabitsBlocked }: TrackChecklistProps) {
  const { data, percent, loading, error } = useTrackChecklist({ userId, trackId, userHabitsBlocked });

  if (loading) return <div className="text-sm text-base-content/60">Carregando progresso...</div>;
  if (error) return <div className="alert alert-error text-sm"><span>{error}</span></div>;
  if (!data) return null;

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-base-content">{data.track.title}</h3>
          </div>
          <span className="badge badge-primary">{percent}%</span>
        </div>

        <progress className="progress progress-primary w-full" value={percent} max={100} />

        <p className="text-xs text-base-content/60">
          {data.completedLessons} de {data.totalLessons} {data.totalLessons === 1 ? 'aula' : 'aulas'} concluídas
        </p>

        <ul className="space-y-2">
          {data.modules.map(m => {
            const total = m.lessons.length;
            const done = m.completedCount;
            const modulePercent = total > 0 ? Math.round((done / total) * 100) : 0;
            const isDone = total > 0 && done === total;
            return (
              <li key={m.module.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs flex items-center gap-1 ${isDone ? 'text-success' : 'text-base-content'}`}>
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {m.module.title}
                  </span>
                  <span className="text-xs text-base-content/60">
                    {done} / {total}
                  </span>
                </div>
                <progress className="progress progress-primary w-full h-1" value={modulePercent} max={100} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
