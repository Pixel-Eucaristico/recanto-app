'use client';

import Link from 'next/link';
import { BookOpen, Bookmark, Highlighter, MessageSquare, Calendar, CheckCircle } from 'lucide-react';
import { BookReadingProgress } from '@/domain/library/types';

interface BookHistoryCardProps {
  progress: BookReadingProgress;
}

export function BookHistoryCard({ progress }: BookHistoryCardProps) {
  const {
    book_id, book_title, book_cover_url,
    percent, started_at, completed_at, last_ref,
    highlights_count = 0, notes_count = 0,
  } = progress;

  const title = book_title ?? 'Livro';
  const isCompleted = percent >= 100;

  function fmtDate(iso?: string) {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  return (
    <div className="card bg-base-100 border border-base-300 hover:border-primary transition-colors overflow-hidden">
      <div className="flex gap-3 p-4">
        {/* Capa */}
        <div className="shrink-0 w-14 h-20 rounded-md overflow-hidden bg-base-200 flex items-center justify-center">
          {book_cover_url ? (
            <img src={book_cover_url} alt={title} className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="w-6 h-6 text-base-content/30" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/app/dashboard/library/${book_id}`}
              className="text-sm font-semibold text-base-content hover:text-primary transition-colors truncate leading-snug"
            >
              {title}
            </Link>
            {isCompleted && <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />}
          </div>

          {/* Barra de progresso */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] text-base-content/50">
              <span>Progresso</span>
              <span>{percent}%</span>
            </div>
            <div className="h-1.5 bg-base-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isCompleted ? 'bg-success' : 'bg-primary'}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Datas */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-base-content/50">
            {started_at && (
              <span className="flex items-center gap-0.5">
                <Calendar className="w-3 h-3" /> Iniciado {fmtDate(started_at)}
              </span>
            )}
            {completed_at && (
              <span className="flex items-center gap-0.5 text-success">
                <CheckCircle className="w-3 h-3" /> Concluído {fmtDate(completed_at)}
              </span>
            )}
          </div>

          {/* Badges de anotações */}
          <div className="flex flex-wrap gap-2">
            {highlights_count > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-warning badge badge-warning badge-outline badge-sm">
                <Highlighter className="w-2.5 h-2.5" /> {highlights_count} destaque{highlights_count > 1 ? 's' : ''}
              </span>
            )}
            {notes_count > 0 && (
              <span className="flex items-center gap-1 text-[10px] badge badge-info badge-outline badge-sm">
                <MessageSquare className="w-2.5 h-2.5" /> {notes_count} nota{notes_count > 1 ? 's' : ''}
              </span>
            )}
            {last_ref && (
              <span className="flex items-center gap-1 text-[10px] badge badge-ghost badge-sm">
                <Bookmark className="w-2.5 h-2.5" /> ref. {last_ref}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Link continuar */}
      {!isCompleted && (
        <div className="border-t border-base-300 px-4 py-2">
          <Link
            href={`/app/dashboard/library/${book_id}`}
            className="text-xs text-primary hover:underline"
          >
            Continuar leitura →
          </Link>
        </div>
      )}
    </div>
  );
}
