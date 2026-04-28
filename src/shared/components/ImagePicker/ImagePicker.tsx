'use client';

import { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { MediaPickerModal } from '@/shared/components/MediaPickerModal';

interface ImagePickerProps {
  label?: string;
  /** URL atual da imagem. */
  value?: string;
  onChange: (url: string) => void;
  /** Pasta R2 padrão pra upload. */
  folder?: string;
}

/**
 * Picker de imagem com preview + galeria + upload.
 * Usa `MediaPickerModal` (busca em arquivos já subidos no R2 — evita duplicar).
 */
export function ImagePicker({ label, value, onChange, folder = 'library/inline' }: ImagePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="label-text text-xs font-medium">{label}</span>}

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt=""
            className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg border border-base-300"
          />
          <div className="absolute top-1 right-1 flex gap-1">
            <button
              type="button"
              className="btn btn-circle btn-xs bg-base-100/90 border-base-300"
              onClick={() => setOpen(true)}
              title="Trocar imagem"
            >
              <ImagePlus className="w-3 h-3" />
            </button>
            <button
              type="button"
              className="btn btn-circle btn-xs bg-base-100/90 border-base-300 text-error"
              onClick={() => onChange('')}
              title="Remover"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-outline btn-sm gap-1 self-start"
          onClick={() => setOpen(true)}
        >
          <ImagePlus className="w-4 h-4" />
          Adicionar imagem
        </button>
      )}

      {open && (
        <MediaPickerModal
          mode={value ? 'edit' : 'insert'}
          initialUrl={value ?? ''}
          accept="image"
          folder={folder}
          onConfirm={({ url }) => {
            onChange(url);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
