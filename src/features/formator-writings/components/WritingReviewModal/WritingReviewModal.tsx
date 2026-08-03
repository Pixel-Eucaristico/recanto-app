'use client';

import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { FormatorReview } from '@/features/spiritual-notebook';
import { reflectionRepository } from '@/infrastructure/spiritual-notebook/ReflectionRepository';
import type { Reflection } from '@/domain/spiritual-notebook/types';
import type { StudentWriting } from '@/domain/formation/writings';

interface WritingReviewModalProps {
  writing: StudentWriting;
  onClose: () => void;
  onReviewed: (updated: Reflection) => void;
}

/**
 * Comentário pastoral sobre a reflexão do aluno.
 *
 * Carrega a entidade `Reflection` aqui em vez de carregá-la na lista, pra manter
 * `StudentWriting` como view-model puro.
 */
export function WritingReviewModal({ writing, onClose, onReviewed }: WritingReviewModalProps) {
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    reflectionRepository.findById(writing.doc_id)
      .then(r => {
        if (cancelled) return;
        if (!r) setError('Reflexão não encontrada.');
        setReflection(r);
      })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [writing.doc_id]);

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="font-bold text-base">Revisar reflexão</h3>
          <button type="button" className="btn btn-ghost btn-xs" onClick={onClose} aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-base-content/50 mb-3 truncate">{writing.student_name}</p>

        {error && <div className="alert alert-error text-sm mb-2"><span>{error}</span></div>}

        {loading && (
          <div className="text-sm text-base-content/60 flex items-center gap-2 py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando reflexão...
          </div>
        )}

        {!loading && reflection && (
          <FormatorReview
            reflection={reflection}
            onReviewed={updated => { onReviewed(updated); onClose(); }}
          />
        )}

        <div className="modal-action">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Fechar</button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
