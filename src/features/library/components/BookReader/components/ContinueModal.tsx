'use client';

import { X, Navigation } from 'lucide-react';
import type { BookChapter, BookReadingProgress } from '@/domain/library/types';

interface ContinueModalProps {
  progress: BookReadingProgress;
  chapters: BookChapter[];
  onClose: () => void;
  onClearPosition: () => Promise<void>;
  onContinue: () => void;
}

export function ContinueModal({ progress, onClose, onClearPosition, onContinue }: ContinueModalProps) {
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Navigation className="w-4 h-4 text-info" /> Continuar leitura
        </h3>
        <p className="py-3 text-sm text-base-content/70">
          Você parou no{' '}
          <strong>Cap. {progress.last_chapter_order}</strong>
          {progress.last_ref && <> — ref. <strong>{progress.last_ref}</strong></>}.
          Deseja ir direto para lá?
        </p>
        <div className="modal-action gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-ghost btn-sm text-error gap-1"
            onClick={onClearPosition}
          >
            <X className="w-3.5 h-3.5" /> Limpar posição
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Começar do início
          </button>
          <button
            type="button"
            className="btn btn-info btn-sm gap-1"
            onClick={onContinue}
          >
            <Navigation className="w-3.5 h-3.5" /> Continuar
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
