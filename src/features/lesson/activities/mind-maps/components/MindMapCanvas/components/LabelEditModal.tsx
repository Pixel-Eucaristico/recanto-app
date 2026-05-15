'use client';

interface LabelEditModalProps {
  title: string;
  label: string;
  placeholder: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export function LabelEditModal({ title, label, placeholder, onChange, onSave, onClose }: LabelEditModalProps) {
  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-lg mb-3">{title}</h3>
        <input
          autoFocus
          className="input input-bordered w-full"
          value={label}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') onSave();
            else if (e.key === 'Escape') onClose();
          }}
          placeholder={placeholder}
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
