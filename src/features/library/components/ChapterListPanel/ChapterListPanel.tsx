'use client';

import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { BookChapter, BookSectionKind } from '@/domain/library/types';

const KIND_LABELS: Record<BookSectionKind, string> = {
  chapter:      'Capítulo',
  preface:      'Prefácio',
  introduction: 'Introdução',
  credits:      'Créditos',
  appendix:     'Apêndice',
  notes:        'Notas',
  glossary:     'Glossário',
  bibliography: 'Bibliografia',
  about:        'Sobre',
};

const KIND_BADGE: Record<BookSectionKind, string> = {
  chapter:      'badge-primary',
  preface:      'badge-secondary',
  introduction: 'badge-secondary',
  credits:      'badge-secondary',
  appendix:     'badge-accent',
  notes:        'badge-accent',
  glossary:     'badge-accent',
  bibliography: 'badge-accent',
  about:        'badge-accent',
};

interface ChapterListPanelProps {
  chapters: BookChapter[];
  onCreate: () => void;
  onEdit: (chapter: BookChapter) => void;
  onDelete: (chapter: BookChapter) => void;
}

export function ChapterListPanel({ chapters, onCreate, onEdit, onDelete }: ChapterListPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Seções do livro</h3>
        <button type="button" className="btn btn-primary btn-sm gap-1" onClick={onCreate}>
          <Plus className="w-4 h-4" /> Nova seção
        </button>
      </div>

      {chapters.length === 0 ? (
        <div className="text-center py-8 text-base-content/60 text-sm">
          Nenhuma seção ainda. Clique em &quot;Nova seção&quot;.
        </div>
      ) : (
        <ul className="space-y-2">
          {chapters.map(c => {
            const k = c.kind ?? 'chapter';
            const numberedCount = c.blocks.filter(b => b.kind === 'paragraph' || b.kind === 'quote').length;
            return (
              <li key={c.id} className="card bg-base-100 border border-base-300">
                <div className="card-body p-3 flex-row items-center gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="badge badge-outline badge-sm">{c.order}</span>
                      <span className={`badge badge-sm ${KIND_BADGE[k]}`}>{KIND_LABELS[k]}</span>
                      <span className="font-semibold text-sm">{c.title}</span>
                    </div>
                    <p className="text-xs text-base-content/60 mt-1">
                      {c.blocks.length} {c.blocks.length === 1 ? 'bloco' : 'blocos'}
                      {k === 'chapter' && ` · ${numberedCount} numerado${numberedCount === 1 ? '' : 's'} (${c.order}:1–${c.order}:${numberedCount || 0})`}
                    </p>
                  </div>
                  <button type="button" className="btn btn-ghost btn-xs" onClick={() => onEdit(c)} aria-label="Editar">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="btn btn-ghost btn-xs text-error" onClick={() => onDelete(c)} aria-label="Remover">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
