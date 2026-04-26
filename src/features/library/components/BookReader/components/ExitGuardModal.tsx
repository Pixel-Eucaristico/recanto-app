'use client';

import { Bookmark } from 'lucide-react';

interface ExitGuardModalProps {
  readPercent: number;
  onClose: () => void;
  onExit: () => void;
  onSaveAndExit: () => Promise<void>;
}

export function ExitGuardModal({ readPercent, onClose, onExit, onSaveAndExit }: ExitGuardModalProps) {
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-warning" /> Marcar onde parou?
        </h3>
        <p className="py-3 text-sm text-base-content/70">
          Você está no meio do livro ({readPercent}% lido) e não marcou sua posição. Deseja salvar onde parou antes de sair?
        </p>
        <div className="modal-action gap-2 flex-wrap">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Continuar lendo
          </button>
          <button type="button" className="btn btn-ghost btn-sm text-error" onClick={onExit}>
            Sair sem salvar
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm gap-1"
            onClick={onSaveAndExit}
          >
            <Bookmark className="w-3.5 h-3.5" /> Salvar e sair
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}
