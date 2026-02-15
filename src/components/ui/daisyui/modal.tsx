"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const Modal = ({ isOpen, onClose, children, className, title }: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        // Prevenir scroll do body quando o modal está aberto
        document.body.style.overflow = 'hidden';
      }
    } else {
      if (dialog.open) {
        dialog.close();
        document.body.style.overflow = 'unset';
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle backdrop-blur-sm"
      onClose={onClose}
    >
      <div className={cn(
        "modal-box bg-base-100 text-base-content border border-base-300 p-0 overflow-hidden flex flex-col max-h-[90vh] w-full shadow-2xl", 
        className
      )}>
        {title && (
          <div className="px-6 py-4 border-b border-base-200 flex justify-between items-center bg-base-100 sticky top-0 z-10 shrink-0">
            <h3 className="text-xl font-extrabold !text-base-content tracking-tight">{title}</h3>
            <button 
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost !text-base-content"
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop bg-black/60">
        <button type="button" onClick={onClose} className="cursor-default">close</button>
      </form>
    </dialog>
  );
};
