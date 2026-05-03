'use client';

import { useState, useMemo } from 'react';
import { X, Plus, Link, AlertCircle, Pencil } from 'lucide-react';
import type { BookFootnote } from '@/domain/library/types';
import { RichTextEditor } from '@/shared/components/RichTextEditor';
import { RichContent } from '@/shared/components/RichContent';

interface FootnotePickerModalProps {
  footnotes: BookFootnote[];
  /** Markdown atual do capítulo — pra detectar markers em uso. */
  chapterMarkdown: string;
  onInsert: (number: number) => void;
  onCreate: (content: string) => number; // retorna número da nota criada
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function FootnotePickerModal({
  footnotes, chapterMarkdown, onInsert, onCreate, onUpdate, onDelete, onClose,
}: FootnotePickerModalProps) {
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Detecta orphans: notas sem `[^N]` correspondente no markdown
  const usedNumbers = useMemo(() => {
    const set = new Set<number>();
    const re = /\[\^(\d+)\]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(chapterMarkdown)) !== null) set.add(Number(m[1]));
    return set;
  }, [chapterMarkdown]);

  const sorted = [...footnotes].sort((a, b) => a.number - b.number);
  const orphans = sorted.filter(f => !usedNumbers.has(f.number));
  const linked = sorted.filter(f => usedNumbers.has(f.number));

  function handleCreate() {
    if (!newContent.trim()) return;
    const num = onCreate(newContent.trim());
    onInsert(num);
    setNewContent('');
    onClose();
  }

  function handleInsertExisting(num: number) {
    onInsert(num);
    onClose();
  }

  function handleSaveEdit(id: string) {
    if (!editContent.trim()) return;
    onUpdate(id, editContent.trim());
    setEditingId(null);
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Link className="w-4 h-4 text-primary" /> Nota de rodapé
          </h3>
          <button type="button" className="btn btn-ghost btn-xs btn-circle" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Orphans — destaque amarelo, ainda não usadas */}
        {orphans.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-warning" />
              <span className="text-xs font-semibold text-warning">
                {orphans.length} nota(s) órfã(s) — criadas mas sem `[^N]` no texto
              </span>
            </div>
            <ul className="space-y-1">
              {orphans.map(f => (
                <li key={f.id} className="bg-warning/10 border border-warning/30 rounded p-2 flex items-start gap-2">
                  <sup className="font-bold text-warning shrink-0">{f.number}</sup>
                  <div className="flex-1 min-w-0">
                    {editingId === f.id ? (
                      <div className="space-y-2">
                        <RichTextEditor value={editContent} onChange={setEditContent} height={120} />
                        <div className="flex gap-2 justify-end">
                          <button type="button" className="btn btn-ghost btn-xs" onClick={() => setEditingId(null)}>Cancelar</button>
                          <button type="button" className="btn btn-primary btn-xs" onClick={() => handleSaveEdit(f.id)}>Salvar</button>
                        </div>
                      </div>
                    ) : (
                      <RichContent markdown={f.content || '_(sem conteúdo)_'} className="text-xs [&>div]:p-0 [&_p]:my-0" />
                    )}
                  </div>
                  {editingId !== f.id && (
                    <div className="flex gap-1 shrink-0">
                      <button type="button" className="btn btn-ghost btn-xs btn-circle" onClick={() => { setEditingId(f.id); setEditContent(f.content); }} title="Editar">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button type="button" className="btn btn-primary btn-xs gap-1" onClick={() => handleInsertExisting(f.number)} title="Inserir no texto">
                        Usar
                      </button>
                      <button type="button" className="btn btn-ghost btn-xs btn-circle text-error" onClick={() => onDelete(f.id)} title="Remover">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Linked — already in text */}
        {linked.length > 0 && (
          <details className="collapse collapse-arrow bg-base-200 mb-4">
            <summary className="collapse-title text-xs font-medium py-2 min-h-0">
              {linked.length} nota(s) já em uso no texto
            </summary>
            <div className="collapse-content text-xs">
              <ul className="space-y-1">
                {linked.map(f => (
                  <li key={f.id} className="flex items-start gap-2 py-1">
                    <sup className="font-bold text-primary shrink-0">{f.number}</sup>
                    <RichContent markdown={f.content} className="flex-1 min-w-0 text-xs [&>div]:p-0 [&_p]:my-0" />
                  </li>
                ))}
              </ul>
            </div>
          </details>
        )}

        {/* Nova nota */}
        <div className="border-t border-base-300 pt-4 space-y-2">
          <p className="text-xs font-semibold text-base-content/60">Criar nova nota e inserir no cursor</p>
          <RichTextEditor
            value={newContent}
            onChange={setNewContent}
            height={140}
            placeholder="Conteúdo da nota de rodapé..."
          />
          <div className="flex justify-end">
            <button
              type="button"
              className="btn btn-primary btn-sm gap-1"
              onClick={handleCreate}
              disabled={!newContent.trim()}
            >
              <Plus className="w-3.5 h-3.5" /> Criar e inserir
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
