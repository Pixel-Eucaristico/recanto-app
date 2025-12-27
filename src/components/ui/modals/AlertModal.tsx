'use client';

import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info'
}: AlertModalProps) {
  if (!isOpen) return null;

  const iconMap = {
    success: <CheckCircle className="w-12 h-12 text-success" />,
    error: <XCircle className="w-12 h-12 text-error" />,
    warning: <AlertTriangle className="w-12 h-12 text-warning" />,
    info: <Info className="w-12 h-12 text-info" />,
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
          <Button onClick={onClose}>
            OK
          </Button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={onClose} />
    </div>
  );
}
