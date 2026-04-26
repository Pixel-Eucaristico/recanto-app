'use client';

import type { MediaAsset } from '@/domain/media/types';
import { MediaUpload } from '@/shared/components/MediaUpload';
import { type MediaKind, buildMediaMarkdown } from '../utils/markdownFieldUtils';
import { MediaGalleryPicker } from './MediaGalleryPicker';

interface MediaInsertModalProps {
  mediaKind: MediaKind;
  pendingUrl: string;
  altText: string;
  gallery: MediaAsset[];
  galleryLoading: boolean;
  gallerySearch: string;
  uploadFolder: string;
  onKindChange: (k: MediaKind) => void;
  onUrlChange: (u: string) => void;
  onAltChange: (a: string) => void;
  onGallerySearch: (q: string) => void;
  onGallerySelect: (asset: MediaAsset) => void;
  onUploaded: (asset: MediaAsset) => void;
  onInsert: () => void;
  onClose: () => void;
}

export function MediaInsertModal({
  mediaKind, pendingUrl, altText, gallery, galleryLoading, gallerySearch, uploadFolder,
  onKindChange, onUrlChange, onAltChange, onGallerySearch, onGallerySelect, onUploaded, onInsert, onClose,
}: MediaInsertModalProps) {
  const acceptType = mediaKind === 'video' ? 'video' : mediaKind === 'audio' ? 'audio' : mediaKind.startsWith('image') ? 'image' : 'all';

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-lg mb-3">Inserir mídia</h3>
        <div className="space-y-3">
          <label className="form-control">
            <span className="label-text text-xs mb-1">Tipo de mídia</span>
            <select className="select select-bordered select-sm" value={mediaKind} onChange={e => onKindChange(e.target.value as MediaKind)}>
              <option value="image">Imagem centralizada</option>
              <option value="image-left">Imagem à esquerda (texto envolve)</option>
              <option value="image-right">Imagem à direita (texto envolve)</option>
              <option value="youtube">YouTube (embed)</option>
              <option value="video">Vídeo (mp4/webm)</option>
              <option value="audio">Áudio (mp3/ogg)</option>
            </select>
          </label>

          <MediaUpload accept={acceptType as 'image' | 'video' | 'audio' | 'all'} folder={uploadFolder} onUploaded={onUploaded} />

          {mediaKind === 'youtube' && (
            <label className="form-control">
              <span className="label-text text-xs mb-1">URL do YouTube</span>
              <input type="url" className="input input-bordered input-sm" value={pendingUrl} onChange={e => onUrlChange(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            </label>
          )}

          <label className="form-control">
            <span className="label-text text-xs mb-1">Texto alternativo / título</span>
            <input type="text" className="input input-bordered input-sm" value={altText} onChange={e => onAltChange(e.target.value)} placeholder="descreva o conteúdo" />
          </label>

          <MediaGalleryPicker
            gallery={gallery}
            loading={galleryLoading}
            search={gallerySearch}
            pendingUrl={pendingUrl}
            onSearch={onGallerySearch}
            onSelect={onGallerySelect}
          />

          {pendingUrl && (
            <div className="text-xs text-base-content/60">
              Será inserido:{' '}
              <code className="bg-base-200 px-1 rounded break-all block mt-1 whitespace-pre-wrap">
                {buildMediaMarkdown(mediaKind, pendingUrl, altText || 'mídia').trim()}
              </code>
            </div>
          )}
        </div>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onInsert} disabled={!pendingUrl.trim()}>Inserir</button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
