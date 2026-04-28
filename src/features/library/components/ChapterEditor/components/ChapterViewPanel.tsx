'use client';

import { Pencil, Eye } from 'lucide-react';
import type { BookChapter } from '@/domain/library/types';
import { BlockPreview } from './BlockPreview';

interface ChapterViewPanelProps {
  previewBlocks: BookChapter['blocks'];
  onEdit: () => void;
}

export function ChapterViewPanel({ previewBlocks, onEdit }: ChapterViewPanelProps) {
  return (
    <div
      className="card bg-base-100 border border-base-300 cursor-pointer hover:border-primary transition-colors"
      onDoubleClick={onEdit}
      title="Duplo clique pra editar"
    >
      <div className="card-body p-4 gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-base-content/60 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> Modo leitura — duplo clique pra editar
          </span>
          <button type="button" className="btn btn-ghost btn-xs gap-1" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" /> Editar
          </button>
        </div>
        {previewBlocks.length === 0 ? (
          <p className="text-sm text-base-content/40">Capítulo vazio. Clique em &quot;Editar&quot; pra escrever.</p>
        ) : (
          <div className="space-y-2">
            {previewBlocks.map((b, i) => (
              <BlockPreview key={b.id ?? i} block={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
