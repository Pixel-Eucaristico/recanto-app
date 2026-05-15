'use client';

import { BookOpen, Edit2, Trash2, Plus } from 'lucide-react';
import { Book } from '@/domain/library/types';

interface BookListProps {
  books: Book[];
  onCreate: () => void;
  onEdit: (book: Book) => void;
  onEditChapters: (book: Book) => void;
  onDelete: (book: Book) => void;
}

export function BookList({ books, onCreate, onEdit, onEditChapters, onDelete }: BookListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base md:text-lg font-semibold">Livros</h2>
        <button type="button" className="btn btn-primary btn-sm gap-1" onClick={onCreate}>
          <Plus className="w-4 h-4" /> Novo livro
        </button>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-8 text-base-content/60 text-sm">
          Nenhum livro ainda. Cadastre o primeiro.
        </div>
      ) : (
        <ul className="space-y-2">
          {books.map(b => (
            <li key={b.id} className="card bg-base-100 border border-base-300">
              <div className="card-body p-3 md:p-4 flex-row items-center gap-3 flex-wrap">
                <div className="w-12 h-16 flex-shrink-0 bg-base-200 rounded overflow-hidden">
                  {b.cover_url ? (
                    <img src={b.cover_url} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-base-content/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{b.title}</span>
                    {!b.is_published && <span className="badge badge-warning badge-xs">rascunho</span>}
                    {b.spoiler_mode === 'progressive' && <span className="badge badge-info badge-xs">progressivo</span>}
                  </div>
                  {b.author && <p className="text-xs text-base-content/60">{b.author}</p>}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => onEditChapters(b)}
                    title="Editar capítulos"
                  >
                    Capítulos
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => onEdit(b)}
                    aria-label="Editar metadata"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => onDelete(b)}
                    aria-label="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
