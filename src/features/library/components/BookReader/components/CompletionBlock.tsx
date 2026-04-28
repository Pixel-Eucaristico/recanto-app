'use client';

import { CheckCircle, RefreshCw } from 'lucide-react';
import type { BookChapter, BookReadingProgress } from '@/domain/library/types';

interface CompletionBlockProps {
  readPercent: number;
  progress: BookReadingProgress | null;
  chapters: BookChapter[];
  completing: boolean;
  onComplete: () => Promise<void>;
  onReread: () => Promise<void>;
}

export function CompletionBlock({ readPercent, progress, completing, onComplete, onReread }: CompletionBlockProps) {
  return (
    <div className="border-t border-base-300 pt-8 text-center space-y-3">
      {readPercent >= 100 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-success">
            <CheckCircle className="w-7 h-7" />
            <span className="text-lg font-semibold">Leitura concluída</span>
          </div>
          <p className="text-xs text-base-content/50">
            {progress?.updated_at
              ? `Em ${new Date(progress.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`
              : 'Parabéns por completar este livro.'}
          </p>
          <button
            type="button"
            className="btn btn-ghost btn-sm gap-1"
            onClick={onReread}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Marcar como releitura
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-base-content/60">Chegou ao fim do livro.</p>
          <button
            type="button"
            className="btn btn-primary gap-2"
            onClick={onComplete}
            disabled={completing}
          >
            {completing
              ? <span className="loading loading-spinner loading-xs" />
              : <CheckCircle className="w-4 h-4" />}
            Finalizar leitura
          </button>
        </div>
      )}
    </div>
  );
}
