'use client';

import { useState } from 'react';
import { X, Trash2, Pencil, MessageSquare } from 'lucide-react';
import { BookComment } from '@/domain/library/types';
import { RichContent } from '@/shared/components/RichContent';
import { RichTextEditor } from '@/shared/components/RichTextEditor';

interface CommentModalProps {
  refLabel: string;
  comments: BookComment[];
  onAdd: (text: string) => Promise<void>;
  onUpdate: (id: string, text: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export function CommentModal({ refLabel, comments, onAdd, onUpdate, onDelete, onClose }: CommentModalProps) {
  const [newText, setNewText] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!newText.trim()) return;
    setSaving(true);
    await onAdd(newText.trim());
    setNewText('');
    setSaving(false);
  }

  async function handleUpdate(id: string) {
    if (!editText.trim()) return;
    setSaving(true);
    await onUpdate(id, editText.trim());
    setEditId(null);
    setSaving(false);
  }

  function startEdit(c: BookComment) {
    setEditId(c.id);
    setEditText(c.text);
  }

  return (
    <div className="modal modal-open">
      {/* Mobile: bottom | Desktop: centralizado largo */}
      <div className="modal-box w-full max-w-md md:max-w-3xl modal-bottom sm:modal-middle flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Notas — ref. <span className="badge badge-primary badge-sm">{refLabel}</span>
          </h3>
          <button type="button" className="btn btn-ghost btn-xs btn-circle" onClick={onClose} aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notas existentes */}
        {comments.length > 0 && (
          <div className="space-y-3 max-h-48 md:max-h-64 overflow-y-auto">
            {comments.map(c => (
              <div key={c.id} className="bg-base-200 rounded-xl p-3">
                {editId === c.id ? (
                  <div className="space-y-2">
                    {/* Editor Lexical para edição */}
                    <RichTextEditor
                      value={editText}
                      onChange={setEditText}
                      height={200}
                      placeholder="Editar nota..."
                    />
                    <div className="flex gap-2 justify-end">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleUpdate(c.id)}
                        disabled={saving || !editText.trim()}
                      >
                        {saving ? <span className="loading loading-spinner loading-xs" /> : 'Salvar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 min-w-0">
                      <RichContent markdown={c.text} className="text-sm" />
                      {c.updated_at && (
                        <p className="text-[9px] text-base-content/40 mt-1">
                          Editado {new Date(c.updated_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-circle"
                        onClick={() => startEdit(c)}
                        title="Editar"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-circle text-error"
                        onClick={() => onDelete(c.id)}
                        title="Remover"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Editor para nova nota — altura responsiva */}
        <div className="space-y-2">
          <p className="text-xs text-base-content/60 font-medium">
            {comments.length === 0 ? 'Escrever nota' : 'Nova nota'}
          </p>
          <RichTextEditor
            value={newText}
            onChange={setNewText}
            height={typeof window !== 'undefined' && window.innerWidth >= 768 ? 260 : 180}
            placeholder="Escreva sua nota... use a barra lateral para formatar (negrito, título, citação, lista...)"
          />
          <div className="flex justify-end">
            <button
              type="button"
              className="btn btn-primary btn-sm gap-1"
              onClick={handleAdd}
              disabled={saving || !newText.trim()}
            >
              {saving ? <span className="loading loading-spinner loading-xs" /> : null}
              Salvar nota
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
