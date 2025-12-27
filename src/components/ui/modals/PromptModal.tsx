'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
}

export function PromptModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  placeholder = '',
  defaultValue = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}: PromptModalProps) {
  const [value, setValue] = useState(defaultValue);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim());
      onClose();
      setValue('');
    }
  };

  const handleClose = () => {
    onClose();
    setValue('');
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={handleClose} className="btn btn-sm btn-circle btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        {message && (
          <p className="text-base-content/80 mb-4">{message}</p>
        )}

        {/* Input */}
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          autoFocus
        />

        {/* Actions */}
        <div className="modal-action">
          <button onClick={handleClose} className="btn btn-ghost">
            {cancelText}
          </button>
          <Button onClick={handleConfirm} disabled={!value.trim()}>
            {confirmText}
          </Button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={handleClose} />
    </div>
  );
}
