'use client';

import { Search } from 'lucide-react';
import type { MediaAsset } from '@/domain/media/types';
import type { MediaKind } from '../utils/markdownFieldUtils';

interface MediaGalleryPickerProps {
  gallery: MediaAsset[];
  loading: boolean;
  search: string;
  pendingUrl: string;
  onSearch: (q: string) => void;
  onSelect: (asset: MediaAsset) => void;
}

export function MediaGalleryPicker({ gallery, loading, search, pendingUrl, onSearch, onSelect }: MediaGalleryPickerProps) {
  return (
    <>
      <div className="divider text-xs">ou escolha um já enviado</div>
      <div className="form-control">
        <div className="join">
          <span className="join-item bg-base-200 flex items-center px-3">
            <Search className="w-4 h-4 opacity-60" />
          </span>
          <input
            type="text"
            className="input input-bordered input-sm join-item flex-1"
            placeholder="Buscar por nome..."
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="max-h-48 overflow-auto border border-base-300 rounded-lg p-2">
        {loading && <div className="text-xs text-base-content/60 p-2">Carregando...</div>}
        {!loading && gallery.length === 0 && <div className="text-xs text-base-content/60 p-2">Nenhum arquivo ainda.</div>}
        <div className="grid grid-cols-4 gap-2">
          {gallery.map(asset => (
            <button
              key={asset.id}
              type="button"
              onClick={() => onSelect(asset)}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                pendingUrl === asset.url ? 'border-primary' : 'border-base-300 hover:border-primary/50'
              }`}
              title={asset.name || asset.url}
            >
              {asset.kind === 'image' ? (
                <img src={asset.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-base-300 flex items-center justify-center">
                  <span className="badge badge-xs">{asset.kind === 'video' ? 'vídeo' : 'áudio'}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
