'use client';

interface EdgeEditModalProps {
  label: string;
  onChange: (label: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export function EdgeEditModal({ label, onChange, onSave, onClose }: EdgeEditModalProps) {
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-lg mb-3">Editar texto da escolha</h3>
        <input
          autoFocus
          className="input input-bordered w-full"
          value={label}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') onSave();
            else if (e.key === 'Escape') onClose();
          }}
          placeholder="Ex.: Falar sobre oração"
        />
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onSave}>Salvar</button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
