'use client';

import { useEffect, useState } from 'react';
import { Save, Send, CheckCircle2, Lock } from 'lucide-react';
import { ReflectionEntity, REFLECTION_MIN_LENGTH, REFLECTION_MAX_LENGTH } from '@/domain/spiritual-notebook/entities/Reflection';
import { Reflection } from '@/domain/spiritual-notebook/types';

interface ReflectionEditorProps {
  reflection: Reflection | null;
  saving: boolean;
  error: string | null;
  onSaveDraft: (content: string) => Promise<unknown>;
  onSubmit: () => Promise<unknown>;
}

export function ReflectionEditor({ reflection, saving, error, onSaveDraft, onSubmit }: ReflectionEditorProps) {
  const [content, setContent] = useState(reflection?.content ?? '');

  useEffect(() => {
    setContent(reflection?.content ?? '');
  }, [reflection?.id]);

  const status = reflection?.status ?? 'draft';
  const locked = status === 'reviewed';
  const submitted = status === 'submitted' || status === 'reviewed';
  const validation = ReflectionEntity.validate(content);
  const canSubmit = validation.valid && !saving && !submitted;
  const canSave = !submitted && !saving && content.trim().length > 0;
  const charCount = content.trim().length;

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

      <textarea
        className="textarea textarea-bordered w-full min-h-48 bg-base-100 text-base-content"
        placeholder="Escreva aqui sua reflexão a partir da aula..."
        value={content}
        onChange={e => setContent(e.target.value)}
        disabled={locked}
        maxLength={REFLECTION_MAX_LENGTH}
      />

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
            <button
              className="btn btn-primary btn-sm gap-1"
              onClick={() => onSubmit()}
              disabled={!canSubmit}
            >
              <Send className="w-4 h-4" />
              {submitted ? 'Enviada' : 'Enviar para formador'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
