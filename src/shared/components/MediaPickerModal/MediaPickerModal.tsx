'use client';

import { useEffect, useState } from 'react';
import { ImagePlus, Library, Link2, X, Search, Save } from 'lucide-react';
import { mediaService } from '@/application/media/MediaService';
import { MediaAsset } from '@/domain/media/types';
import { MediaUpload } from '@/shared/components/MediaUpload';

interface MediaPickerModalProps {
  /** 'insert' ou 'edit' — ajusta título e label do botão de ação. */
  mode: 'insert' | 'edit';
  initialUrl?: string;
  initialAlt?: string;
  /** Pasta R2 alvo do upload. */
  folder?: string;
  /** Aceita só imagens, áudios, vídeos ou todos. */
  accept?: 'image' | 'video' | 'audio' | 'all';
  onConfirm: (payload: { url: string; alt: string }) => void;
  onClose: () => void;
}

type Tab = 'gallery' | 'upload' | 'url';

export function MediaPickerModal({
  mode,
  initialUrl = '',
  initialAlt = '',
  folder = 'library/inline',
  accept = 'image',
  onConfirm,
  onClose,
}: MediaPickerModalProps) {
  const [tab, setTab] = useState<Tab>('gallery');
  const [url, setUrl] = useState(initialUrl);
  const [alt, setAlt] = useState(initialAlt);
  const [gallery, setGallery] = useState<MediaAsset[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (tab !== 'gallery') return;
    setGalleryLoading(true);
    mediaService.listRecent(60)
      .then(list => setGallery(list.filter(a => accept === 'all' || a.kind === accept)))
      .catch(() => {})
      .finally(() => setGalleryLoading(false));
  }, [tab, accept]);

  async function runSearch(q: string) {
    setSearch(q);
    setGalleryLoading(true);
    try {
      const list = q.trim() ? await mediaService.search(q) : await mediaService.listRecent(60);
      setGallery(list.filter(a => accept === 'all' || a.kind === accept));
    } finally {
      setGalleryLoading(false);
    }
  }

  function pick(asset: MediaAsset) {
    setUrl(asset.url);
    if (asset.name && !alt) setAlt(asset.name.replace(/\.[^.]+$/, ''));
  }

  function refreshGallery() {
    mediaService.listRecent(60)
      .then(list => setGallery(list.filter(a => accept === 'all' || a.kind === accept)))
      .catch(() => {});
  }

  const title = mode === 'insert' ? 'Inserir imagem' : 'Editar imagem';
  const actionLabel = mode === 'insert' ? 'Inserir' : 'Salvar';

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl p-0 overflow-hidden flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h3 className="font-bold text-lg">{title}</h3>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose} aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TABS */}
        <div role="tablist" className="tabs tabs-bordered px-4 pt-2 flex-shrink-0">
          <button
            role="tab"
            type="button"
            className={`tab gap-1 ${tab === 'gallery' ? 'tab-active' : ''}`}
            onClick={() => setTab('gallery')}
          >
            <Library className="w-3.5 h-3.5" /> Galeria
          </button>
          <button
            role="tab"
            type="button"
            className={`tab gap-1 ${tab === 'upload' ? 'tab-active' : ''}`}
            onClick={() => setTab('upload')}
          >
            <ImagePlus className="w-3.5 h-3.5" /> Upload
          </button>
          <button
            role="tab"
            type="button"
            className={`tab gap-1 ${tab === 'url' ? 'tab-active' : ''}`}
            onClick={() => setTab('url')}
          >
            <Link2 className="w-3.5 h-3.5" /> URL
          </button>
        </div>

        {/* SPLIT BODY: conteúdo + sidebar de preview */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_280px] overflow-hidden">
          {/* CONTEÚDO DA TAB */}
          <div className="overflow-y-auto p-4 border-b sm:border-b-0 sm:border-r border-base-300">
            {tab === 'gallery' && (
              <div className="space-y-3">
                <div className="join w-full sticky top-0 bg-base-100 z-10">
                  <span className="join-item bg-base-200 flex items-center px-3">
                    <Search className="w-4 h-4 opacity-60" />
                  </span>
                  <input
                    type="text"
                    className="input input-bordered input-sm join-item flex-1 w-full"
                    placeholder="Buscar por nome..."
                    value={search}
                    onChange={e => runSearch(e.target.value)}
                  />
                </div>

                {galleryLoading && <div className="text-xs text-base-content/60 p-2">Carregando galeria...</div>}
                {!galleryLoading && gallery.length === 0 && (
                  <div className="text-center py-8 text-sm text-base-content/60">
                    Nenhuma imagem ainda. Use a aba Upload pra enviar a primeira.
                  </div>
                )}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {gallery.map(asset => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => pick(asset)}
                      className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                        url === asset.url ? 'border-primary ring-2 ring-primary' : 'border-base-300 hover:border-primary/50'
                      }`}
                      title={asset.name || asset.url}
                    >
                      <img src={asset.url} alt={asset.name ?? ''} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'upload' && (
              <div className="space-y-3">
                <p className="text-xs text-base-content/60">
                  Arraste a imagem ou clique pra selecionar. Dedupe SHA-256 — arquivo idêntico não é duplicado.
                </p>
                <MediaUpload
                  accept={accept}
                  folder={folder}
                  onUploaded={asset => {
                    pick(asset);
                    refreshGallery();
                  }}
                />
              </div>
            )}

            {tab === 'url' && (
              <div className="space-y-3">
                <label className="form-control">
                  <span className="label-text text-xs mb-1">URL externa</span>
                  <input
                    type="url"
                    className="input input-bordered input-sm"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://..."
                    autoFocus
                  />
                </label>
                <p className="text-[10px] text-base-content/50">
                  Cole link de uma imagem hospedada externamente. Não passa pelo dedupe — verifique se a fonte é confiável.
                </p>
              </div>
            )}
          </div>

          {/* SIDEBAR DE PREVIEW + ALT */}
          <aside className="overflow-y-auto p-4 bg-base-200/50">
            <span className="label-text text-xs mb-2 block">Pré-visualização</span>
            {url ? (
              <div className="rounded-lg overflow-hidden border border-base-300 bg-base-100 mb-3">
                <img src={url} alt={alt} className="w-full h-auto object-contain max-h-48" />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-base-300 bg-base-100 mb-3 aspect-[4/3] flex items-center justify-center text-xs text-base-content/40 text-center px-3">
                Selecione na galeria, faça upload ou cole a URL
              </div>
            )}

            <label className="form-control">
              <span className="label-text text-xs mb-1">Texto alternativo / legenda</span>
              <input
                type="text"
                className="input input-bordered input-sm"
                value={alt}
                onChange={e => setAlt(e.target.value)}
                placeholder="descreva a imagem"
              />
            </label>

            {url && (
              <button
                type="button"
                className="btn btn-ghost btn-xs mt-2 w-full"
                onClick={() => { setUrl(''); setAlt(''); }}
              >
                Limpar seleção
              </button>
            )}
          </aside>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 p-4 border-t border-base-300 bg-base-100">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
          <button
            type="button"
            className="btn btn-primary btn-sm gap-1"
            disabled={!url.trim()}
            onClick={() => onConfirm({ url: url.trim(), alt: alt.trim() })}
          >
            <Save className="w-4 h-4" />
            {actionLabel}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
