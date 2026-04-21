'use client';

import { CheckCircle2, Clock, FileEdit } from 'lucide-react';
import { Reflection } from '@/domain/spiritual-notebook/types';
import { ReflectionEntity } from '@/domain/spiritual-notebook/entities/Reflection';

interface NotebookEntryProps {
  reflection: Reflection;
}

export function NotebookEntry({ reflection }: NotebookEntryProps) {
  const StatusIcon = reflection.status === 'reviewed'
    ? CheckCircle2
    : reflection.status === 'submitted'
    ? Clock
    : FileEdit;

  const statusColor = reflection.status === 'reviewed'
    ? 'text-success'
    : reflection.status === 'submitted'
    ? 'text-info'
    : 'text-base-content/60';

  const date = reflection.submitted_at ?? reflection.created_at;

  return (
    <article className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-base-content/50">
              <span>{reflection.track_title}</span>
              <span>·</span>
              <span>{reflection.module_title}</span>
            </div>
            <h3 className="text-lg font-semibold text-base-content mt-1">{reflection.lesson_title}</h3>
          </div>
          <div className={`flex items-center gap-1 text-sm ${statusColor}`}>
            <StatusIcon className="w-4 h-4" />
            <span>{ReflectionEntity.statusLabel(reflection.status)}</span>
          </div>
        </div>

        <p className="text-sm text-base-content/80 whitespace-pre-wrap">
          {ReflectionEntity.preview(reflection.content, 300)}
        </p>

        {reflection.status === 'reviewed' && reflection.review_notes && (
          <div className="bg-base-200 rounded-lg p-3 mt-1">
            <div className="text-xs font-semibold text-base-content/60 mb-1">Comentário do formador</div>
            <p className="text-sm text-base-content/80">{reflection.review_notes}</p>
          </div>
        )}

        <div className="text-xs text-base-content/50 mt-1">
          {new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </div>
      </div>
    </article>
  );
}
