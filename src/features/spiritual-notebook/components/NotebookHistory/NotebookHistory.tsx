'use client';

import { BookHeart } from 'lucide-react';
import { Reflection } from '@/domain/spiritual-notebook/types';
import { NotebookEntry } from '../NotebookEntry';

interface NotebookHistoryProps {
  reflections: Reflection[];
  loading?: boolean;
}

export function NotebookHistory({ reflections, loading }: NotebookHistoryProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-base-100 border border-base-300 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (reflections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-base-content/40">
        <BookHeart className="w-16 h-16" />
        <p className="text-center">
          Ainda não há reflexões registradas.<br />
          Comece pela primeira aula e escreva o que o Senhor te disser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reflections.map(r => (
        <NotebookEntry key={r.id} reflection={r} />
      ))}
    </div>
  );
}
