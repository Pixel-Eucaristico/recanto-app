'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil, Check } from 'lucide-react';
import type { BookFootnote } from '@/domain/library/types';
import { RichTextEditor } from '@/shared/components/RichTextEditor';
import { RichContent } from '@/shared/components/RichContent';

function newId(): string {
  return `fn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

interface FootnotePanelProps {
  footnotes: BookFootnote[];
  /** Markdown of the chapter — read-only, just for orphan detection */
  chapterMarkdown: string;
  onChange: (footnotes: BookFootnote[]) => void;
  /** Adds [^N] at cursor in the editor; if absent, falls back to appending at end */
  onInsertMarker?: (marker: string) => void;
}

export function FootnotePanel({ footnotes, chapterMarkdown, onChange, onInsertMarker }: FootnotePanelProps) {
  // Track which footnote is currently being edited (one at a time)
  const [editingId, setEditingId] = useState<string | null>(null);

  function addFootnote() {
    const nextNumber = footnotes.length > 0
      ? Math.max(...footnotes.map(f => f.number)) + 1
      : 1;
    const note: BookFootnote = {
      id: newId(),
      number: nextNumber,
      anchor_block_id: '',
      content: '',
    };
    onChange([...footnotes, note]);
    if (onInsertMarker) onInsertMarker(`[^${nextNumber}]`);
    // Open new note in edit mode immediately
    setEditingId(note.id);
  }

  function updateContent(id: string, content: string) {
    onChange(footnotes.map(f => f.id === id ? { ...f, content } : f));
  }

  function removeFootnote(id: string) {
    onChange(footnotes.filter(f => f.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function isOrphan(num: number): boolean {
    return !chapterMarkdown.includes(`[^${num}]`);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Notas de rodapé</h4>
        <button type="button" className="btn btn-primary btn-sm gap-1" onClick={addFootnote}>
          <Plus className="w-4 h-4" /> Inserir nota
        </button>
      </div>

      <p className="text-xs text-base-content/60">
        Marcador <sup className="font-bold text-primary">¹</sup> aparece no texto.
        Clique no <Pencil className="inline w-3 h-3" /> para editar uma nota salva.
      </p>

      {footnotes.length === 0 ? (
        <div className="text-center py-6 text-sm text-base-content/60">
          Nenhuma nota ainda. Use o botão na barra do editor ou &quot;Inserir nota&quot;.
        </div>
      ) : (
        <ul className="space-y-2">
          {footnotes.sort((a, b) => a.number - b.number).map(f => (
            <li key={f.id} className="card bg-base-100 border border-base-300">
              <div className="card-body p-3 gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="badge badge-secondary badge-sm font-bold">
                      <sup>{f.number}</sup>
                    </span>
                    {isOrphan(f.number) && (
                      <span className="badge badge-warning badge-xs" title="Marcador removido do texto. Reinsira ou apague a nota.">
                        órfã
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {editingId === f.id ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-xs gap-1"
                        onClick={() => setEditingId(null)}
                      >
                        <Check className="w-3.5 h-3.5" /> Salvar
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => setEditingId(f.id)}
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => removeFootnote(f.id)}
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {editingId === f.id ? (
                  <RichTextEditor
                    value={f.content}
                    onChange={v => updateContent(f.id, v)}
                    placeholder="Conteúdo da nota..."
                    height={120}
                  />
                ) : (
                  <div className="text-sm">
                    {f.content.trim().length > 0 ? (
                      <RichContent markdown={f.content} className="text-sm" />
                    ) : (
                      <span className="italic text-base-content/40">(vazia — clique no lápis para editar)</span>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
