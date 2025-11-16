'use client';

import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const iconMap = {
    danger: <Trash2 className="w-12 h-12 text-error" />,
    warning: <AlertTriangle className="w-12 h-12 text-warning" />,
    info: <AlertTriangle className="w-12 h-12 text-info" />,
  };

  const buttonClass = {
    danger: 'btn-error',
    warning: 'btn-warning',
    info: 'btn-primary',
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          {iconMap[type]}
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-center mb-2">{title}</h3>

        {/* Message */}
        <p className="text-center text-base-content/80">{message}</p>

        {/* Actions */}
        <div className="modal-action justify-center">
          <button onClick={onClose} className="btn btn-ghost">
            {cancelText}
          </button>
          <Button onClick={handleConfirm} className={buttonClass[type]}>
            {confirmText}
          </Button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={onClose} />
    </div>
  );
}
