'use client';

import { X, ImagePlus } from 'lucide-react';
import { MediaUpload } from '@/shared/components/MediaUpload';

interface CoverUploaderProps {
  label: string;
  url: string;
  folder: string;
  onUploaded: (url: string) => void;
  onClear: () => void;
}

export function CoverUploader({ label, url, folder, onUploaded, onClear }: CoverUploaderProps) {
  return (
    <div className="form-control">
      <span className="label-text text-xs mb-1">{label}</span>
      {url ? (
        <div className="relative aspect-[2/3] max-w-[140px] rounded-lg overflow-hidden border border-base-300">
          <img src={url} alt={label} className="w-full h-full object-cover" />
          <button
            type="button"
            className="btn btn-circle btn-xs btn-error absolute top-1 right-1"
            onClick={onClear}
            aria-label="Remover"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-base-300 p-3">
          <div className="flex items-center gap-2 mb-2 text-xs text-base-content/60">
            <ImagePlus className="w-4 h-4" />
            Sem imagem
          </div>
          <MediaUpload accept="image" folder={folder} onUploaded={asset => onUploaded(asset.url)} />
        </div>
      )}
    </div>
  );
}
