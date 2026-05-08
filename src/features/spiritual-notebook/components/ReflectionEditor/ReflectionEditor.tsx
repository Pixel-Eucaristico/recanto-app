'use client';

import { useEffect, useState } from 'react';
import { Save, Send, CheckCircle2, Lock, Plus, StickyNote } from 'lucide-react';
import { ReflectionEntity, REFLECTION_MIN_LENGTH, REFLECTION_MAX_LENGTH } from '@/domain/spiritual-notebook/entities/Reflection';
import { Reflection } from '@/domain/spiritual-notebook/types';
import { RichTextEditor } from '@/shared/components/RichTextEditor';

interface ReflectionEditorProps {
  reflection: Reflection | null;
  saving: boolean;
  error: string | null;
  onSaveDraft: (content: string) => Promise<unknown>;
  onSubmit: (content: string) => Promise<unknown>;
  onAddNote?: (content: string) => Promise<unknown>;
}

export function ReflectionEditor({ reflection, saving, error, onSaveDraft, onSubmit, onAddNote }: ReflectionEditorProps) {
  const [content, setContent] = useState(reflection?.content ?? '');
  const [noteDraft, setNoteDraft] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);

  useEffect(() => {
    setContent(reflection?.content ?? '');
  }, [reflection?.id]);

  const status = reflection?.status ?? 'draft';
  const locked = status === 'reviewed';
  const validation = ReflectionEntity.validate(content);
  const canSubmit = validation.valid && !saving && !locked;
  const canSave = !locked && !saving && content.trim().length > 0;
  const charCount = content.trim().length;
  const submittedNotReviewed = status === 'submitted';
  const notes = reflection?.post_review_notes ?? [];

  async function handleAddNote() {
    if (!onAddNote || !noteDraft.trim()) return;
    try {
      await onAddNote(noteDraft);
      setNoteDraft('');
      setShowNoteForm(false);
    } catch {}
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className={`badge ${status === 'reviewed' ? 'badge-success' : status === 'submitted' ? 'badge-info' : 'badge-ghost'}`}>
            {ReflectionEntity.statusLabel(status)}
          </span>
          {reflection?.submitted_at && (
            <span className="text-base-content/50 text-xs">
              Enviada em {new Date(reflection.submitted_at).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
        <span className={`text-xs ${charCount < REFLECTION_MIN_LENGTH ? 'text-warning' : 'text-base-content/60'}`}>
          {charCount} / {REFLECTION_MIN_LENGTH} caracteres mínimos
        </span>
      </div>

      {submittedNotReviewed && (
        <div className="alert alert-info text-sm py-2">
          <span>Enviada — você ainda pode editar e reenviar enquanto não for revisada.</span>
        </div>
      )}

      {/* key={reflection?.id} força remount quando reflection carrega — LoadInitialMarkdown
          plugin do Lexical só carrega 1x no mount, então sem key o rascunho não aparece. */}
      <RichTextEditor
        key={reflection?.id ?? 'new'}
        value={content}
        onChange={v => { if (!locked) setContent(v.slice(0, REFLECTION_MAX_LENGTH)); }}
        height={360}
        disabled={locked}
        placeholder="Escreva sua reflexão..."
      />

      {!locked && (
        <p className="text-xs text-base-content/50">
          Use a barra de ferramentas pra formatar: negrito, itálico, títulos, listas, citações e mais.
        </p>
      )}

      {error && (
        <div className="alert alert-error text-sm">
          <span>{error}</span>
        </div>
      )}

      {status === 'reviewed' && reflection?.review_notes && (
        <div className="alert alert-success">
          <CheckCircle2 className="w-5 h-5" />
          <div>
            <div className="font-semibold">Comentário do formador:</div>
            <p className="text-sm mt-1">{reflection.review_notes}</p>
          </div>
        </div>
      )}

      {locked && (
        <div className="space-y-2 pt-2 border-t border-base-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-base-content/70">
              <StickyNote className="w-4 h-4" />
              Anotações pessoais
              {notes.length > 0 && <span className="badge badge-sm badge-ghost">{notes.length}</span>}
            </div>
            {onAddNote && !showNoteForm && (
              <button className="btn btn-ghost btn-xs gap-1" onClick={() => setShowNoteForm(true)}>
                <Plus className="w-3 h-3" />
                Nova nota
              </button>
            )}
          </div>

          {notes.length > 0 && (
            <div className="space-y-2">
              {notes.map(n => (
                <div key={n.id} className="bg-base-200 rounded-lg p-3 text-sm">
                  <div className="text-xs text-base-content/50 mb-1">
                    {new Date(n.created_at).toLocaleString('pt-BR')}
                  </div>
                  <p className="whitespace-pre-wrap">{n.content}</p>
                </div>
              ))}
            </div>
          )}

          {showNoteForm && onAddNote && (
            <div className="space-y-2">
              <textarea
                className="textarea textarea-bordered w-full text-sm"
                rows={3}
                placeholder="Anote algo após a revisão..."
                value={noteDraft}
                onChange={e => setNoteDraft(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setShowNoteForm(false); setNoteDraft(''); }}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleAddNote}
                  disabled={saving || !noteDraft.trim()}
                >
                  Salvar nota
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        {locked ? (
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <Lock className="w-4 h-4" />
            Reflexão revisada — edição bloqueada
          </div>
        ) : (
          <>
            <button
              className="btn btn-ghost btn-sm gap-1"
              onClick={() => onSaveDraft(content)}
              disabled={!canSave}
            >
              <Save className="w-4 h-4" />
              Salvar rascunho
            </button>
            <div
              className="tooltip tooltip-top"
              data-tip={
                !validation.valid
                  ? `Mínimo ${REFLECTION_MIN_LENGTH} caracteres (atual: ${charCount})`
                  : saving
                  ? 'Salvando...'
                  : submittedNotReviewed
                  ? 'Reenviar para revisão'
                  : 'Enviar para revisão'
              }
            >
              <button
                className="btn btn-primary btn-sm gap-1"
                onClick={() => onSubmit(content)}
                disabled={!canSubmit}
              >
                <Send className="w-4 h-4" />
                {submittedNotReviewed ? 'Reenviar' : 'Enviar para formador'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
