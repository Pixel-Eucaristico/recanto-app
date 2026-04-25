'use client';

import { useEffect, useMemo, useState } from 'react';
import { Save, X, Plus } from 'lucide-react';
import { BookChapter, BookBlock, BookBlockKind } from '@/domain/library/types';
import { BookEntity } from '@/domain/library/entities/Book';
import { BlockEditor } from '@/features/library/components/BlockEditor/BlockEditor';

interface ChapterEditorProps {
  bookId: string;
  chapter: BookChapter | null; // null = criar
  defaultOrder: number;
  saving: boolean;
  onSave: (chapter: { book_id: string; order: number; title: string; subtitle?: string; blocks: BookBlock[] }) => Promise<void>;
  onCancel: () => void;
}

function blockId() {
  return `b_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function emptyBlock(kind: BookBlockKind = 'paragraph'): BookBlock {
  return { id: blockId(), kind, content: '' };
}

export function ChapterEditor({ bookId, chapter, defaultOrder, saving, onSave, onCancel }: ChapterEditorProps) {
  const [title, setTitle] = useState(chapter?.title ?? '');
  const [subtitle, setSubtitle] = useState(chapter?.subtitle ?? '');
  const [order, setOrder] = useState(chapter?.order ?? defaultOrder);
  const [blocks, setBlocks] = useState<BookBlock[]>(chapter?.blocks ?? [emptyBlock('heading'), emptyBlock('paragraph')]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(chapter?.title ?? '');
    setSubtitle(chapter?.subtitle ?? '');
    setOrder(chapter?.order ?? defaultOrder);
    setBlocks(chapter?.blocks ?? [emptyBlock('heading'), emptyBlock('paragraph')]);
  }, [chapter, defaultOrder]);

  function updateBlock(idx: number, patch: Partial<BookBlock>) {
    setBlocks(prev => prev.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  }
  function deleteBlock(idx: number) {
    setBlocks(prev => prev.filter((_, i) => i !== idx));
  }
  function moveBlock(idx: number, dir: -1 | 1) {
    setBlocks(prev => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }
  function addBlock(kind: BookBlockKind) {
    setBlocks(prev => [...prev, emptyBlock(kind)]);
  }

  // Preview da numeração (usa BookEntity.numberChapter — mesma lógica do save)
  const numberedPreview = useMemo(
    () => BookEntity.numberChapter({ id: '', book_id: bookId, order, title, blocks, created_at: '' }).blocks,
    [bookId, order, title, blocks],
  );

  async function handleSave() {
    setError(null);
    const cleanedBlocks = blocks.map(b => ({ ...b, content: b.content ?? '' }));
    try {
      await onSave({
        book_id: bookId,
        order,
        title,
        subtitle: subtitle || undefined,
        blocks: cleanedBlocks,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="space-y-4">
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-base font-bold">{chapter ? `Editar capítulo ${chapter.order}` : 'Novo capítulo'}</h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
              <X className="w-4 h-4" /> Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-3">
            <label className="form-control">
              <span className="label-text text-xs mb-1">Título do capítulo</span>
              <input
                className="input input-bordered input-sm"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </label>
            <label className="form-control">
              <span className="label-text text-xs mb-1">Ordem (capítulo nº)</span>
              <input
                type="number"
                className="input input-bordered input-sm"
                value={order}
                onChange={e => setOrder(Number(e.target.value) || 1)}
                min={1}
                disabled={!!chapter}
                title={chapter ? 'Ordem fixada após criação' : ''}
              />
            </label>
          </div>

          <label className="form-control">
            <span className="label-text text-xs mb-1">Subtítulo (opcional)</span>
            <input
              className="input input-bordered input-sm"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
            />
          </label>
        </div>
      </div>

      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Blocos do capítulo</h4>
        <p className="text-xs text-base-content/60">
          Apenas <code>parágrafo</code> e <code>citação</code> recebem versículo (ex: <code>{order}:1</code>, <code>{order}:2</code>).
          Títulos, listas, código e imagens não numeram.
        </p>

        {blocks.map((block, idx) => {
          const numbered = numberedPreview[idx];
          return (
            <BlockEditor
              key={block.id}
              block={{ ...block, ref: numbered?.ref }}
              index={idx}
              total={blocks.length}
              onChange={patch => updateBlock(idx, patch)}
              onDelete={() => deleteBlock(idx)}
              onMoveUp={() => moveBlock(idx, -1)}
              onMoveDown={() => moveBlock(idx, 1)}
            />
          );
        })}

        <div className="flex flex-wrap gap-2 mt-2">
          <button type="button" className="btn btn-ghost btn-xs gap-1" onClick={() => addBlock('paragraph')}>
            <Plus className="w-3.5 h-3.5" /> Parágrafo
          </button>
          <button type="button" className="btn btn-ghost btn-xs gap-1" onClick={() => addBlock('heading')}>
            <Plus className="w-3.5 h-3.5" /> Título
          </button>
          <button type="button" className="btn btn-ghost btn-xs gap-1" onClick={() => addBlock('quote')}>
            <Plus className="w-3.5 h-3.5" /> Citação
          </button>
          <button type="button" className="btn btn-ghost btn-xs gap-1" onClick={() => addBlock('list')}>
            <Plus className="w-3.5 h-3.5" /> Lista
          </button>
          <button type="button" className="btn btn-ghost btn-xs gap-1" onClick={() => addBlock('code')}>
            <Plus className="w-3.5 h-3.5" /> Código
          </button>
          <button type="button" className="btn btn-ghost btn-xs gap-1" onClick={() => addBlock('image_ref')}>
            <Plus className="w-3.5 h-3.5" /> Imagem
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2 sticky bottom-2 bg-base-100/80 backdrop-blur p-2 rounded-lg border border-base-300">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancelar</button>
        <button
          type="button"
          className="btn btn-primary btn-sm gap-1"
          onClick={handleSave}
          disabled={saving || title.trim().length === 0}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar capítulo'}
        </button>
      </div>
    </div>
  );
}
