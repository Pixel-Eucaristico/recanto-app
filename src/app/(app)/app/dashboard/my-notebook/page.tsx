'use client';

import { BookHeart } from 'lucide-react';
import { useNotebookHistory } from '@/features/spiritual-notebook';
import { NotebookHistory } from '@/features/spiritual-notebook';

export default function MyNotebookPage() {
  const { reflections, loading, error } = useNotebookHistory();

  return (
    <div className="min-h-screen bg-base-200 p-6 space-y-8">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <BookHeart className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-base-content">Minha Jornada</h1>
            <p className="text-base-content/60 text-sm">
              Caderno espiritual — linha do tempo das reflexões que registrou.
            </p>
          </div>
        </div>
      </header>

      {error ? (
        <div className="alert alert-error">
          <span>Erro ao carregar reflexões: {error}</span>
        </div>
      ) : (
        <NotebookHistory reflections={reflections} loading={loading} />
      )}
    </div>
  );
}
