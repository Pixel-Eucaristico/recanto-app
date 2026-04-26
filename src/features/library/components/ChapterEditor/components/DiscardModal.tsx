'use client';

import { Save, X } from 'lucide-react';

interface DiscardModalProps {
  saving: boolean;
  titleEmpty: boolean;
  onContinue: () => void;
  onDiscard: () => void;
  onSaveAndExit: () => void;
}

export function DiscardModal({ saving, titleEmpty, onContinue, onDiscard, onSaveAndExit }: DiscardModalProps) {
  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <X className="w-5 h-5 text-warning" /> Descartar alterações?
        </h3>
        <p className="py-4 text-sm">
          Você tem alterações não salvas neste capítulo. Se voltar agora elas serão perdidas.
        </p>
        <div className="modal-action gap-2 flex-wrap">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onContinue}>
            Continuar editando
          </button>
          <button type="button" className="btn btn-error btn-sm" onClick={onDiscard}>
            Descartar e sair
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm gap-1"
            onClick={onSaveAndExit}
            disabled={saving || titleEmpty}
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Salvando...' : 'Salvar e sair'}
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onContinue} />
    </div>
  );
}
