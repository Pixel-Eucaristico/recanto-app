'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Search } from 'lucide-react';
import type { ICommand } from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { MediaUpload } from '@/shared/components/MediaUpload';
import { mediaService } from '@/application/media/MediaService';
import { MediaAsset } from '@/domain/media/types';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface MarkdownFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
  preview?: 'edit' | 'preview' | 'live';
  /** Pasta onde o upload R2 vai salvar. Default 'markdown-media'. */
  uploadFolder?: string;
}

const DARK_THEMES = new Set([
  'dark', 'synthwave', 'halloween', 'forest', 'black', 'luxury', 'dracula',
  'business', 'night', 'coffee', 'dim', 'sunset', 'abyss',
]);

function detectColorMode(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme && DARK_THEMES.has(theme)) return 'dark';
  if (theme) return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

type MediaKind = 'image' | 'image-left' | 'image-right' | 'youtube' | 'video' | 'audio';

function isYouTube(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

function buildMediaMarkdown(kind: MediaKind, url: string, alt = 'mídia'): string {
  const u = url.trim();
  if (!u) return '';
  if (kind === 'image') return `\n\n![${alt}](${u})\n\n`;
  if (kind === 'image-left') {
    return `\n\n<img src="${u}" alt="${alt}" style="float:left;max-width:40%;margin:0 1rem 0.5rem 0;border-radius:0.5rem" />\n\nEscreva aqui o texto que vai fluir ao redor da imagem. Você pode colocar vários parágrafos; o texto envolverá a imagem à medida que for longo o suficiente.\n\n<div style="clear:both"></div>\n\n`;
  }
  if (kind === 'image-right') {
    return `\n\n<img src="${u}" alt="${alt}" style="float:right;max-width:40%;margin:0 0 0.5rem 1rem;border-radius:0.5rem" />\n\nEscreva aqui o texto que vai fluir ao redor da imagem. Você pode colocar vários parágrafos; o texto envolverá a imagem à medida que for longo o suficiente.\n\n<div style="clear:both"></div>\n\n`;
  }
  if (kind === 'youtube' || isYouTube(u)) return `\n\n[${alt}](${u})\n\n`;
  if (kind === 'video') return `\n\n<video controls src="${u}" title="${alt}"></video>\n\n`;
  if (kind === 'audio') return `\n\n<audio controls src="${u}" title="${alt}"></audio>\n\n`;
  return `\n\n[${alt}](${u})\n\n`;
}

function detectKind(url: string): MediaKind {
  if (isYouTube(url)) return 'youtube';
  if (/\.(mp4|webm|ogv|mov)(\?|$)/i.test(url)) return 'video';
  if (/\.(mp3|ogg|wav|m4a|aac)(\?|$)/i.test(url)) return 'audio';
  return 'image';
}

export function MarkdownField({
  value,
  onChange,
  placeholder,
  height = 200,
  disabled = false,
  preview = 'edit',
  uploadFolder = 'markdown-media',
}: MarkdownFieldProps) {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [mediaKind, setMediaKind] = useState<MediaKind>('image');
  const [gallery, setGallery] = useState<MediaAsset[]>([]);
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryLoading, setGalleryLoading] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    const update = () => {
      const mode = detectColorMode();
      setColorMode(mode);
      document.documentElement.setAttribute('data-color-mode', mode);
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!uploadOpen) return;
    setGalleryLoading(true);
    mediaService.listRecent(24).then(list => {
      setGallery(list);
    }).catch(() => {}).finally(() => setGalleryLoading(false));
  }, [uploadOpen]);

  async function runSearch(query: string) {
    setGallerySearch(query);
    setGalleryLoading(true);
    try {
      const list = query.trim() ? await mediaService.search(query) : await mediaService.listRecent(24);
      setGallery(list);
    } finally {
      setGalleryLoading(false);
    }
  }

  function insertMedia() {
    if (!pendingUrl.trim()) return;
    const md = buildMediaMarkdown(mediaKind, pendingUrl.trim(), altText.trim() || 'mídia');
    onChange((valueRef.current ?? '') + md);
    setPendingUrl('');
    setAltText('');
    setMediaKind('image');
    setUploadOpen(false);
  }

  // Mantém todos os comandos padrão do MDEditor; apenas:
  // 1) traduz tooltips PT-BR
  // 2) substitui execute do `image` pra abrir nosso modal de mídia
  const LABELS: Record<string, string> = {
    bold: 'Negrito',
    italic: 'Itálico',
    strikethrough: 'Riscado',
    hr: 'Linha horizontal',
    title: 'Título',
    title1: 'Título 1',
    title2: 'Título 2',
    title3: 'Título 3',
    title4: 'Título 4',
    title5: 'Título 5',
    title6: 'Título 6',
    link: 'Link',
    quote: 'Citação',
    code: 'Código inline',
    codeBlock: 'Bloco de código',
    comment: 'Comentário',
    image: 'Inserir mídia',
    unordered: 'Lista',
    'unordered-list': 'Lista',
    ordered: 'Lista numerada',
    'ordered-list': 'Lista numerada',
    checked: 'Checklist',
    'checked-list': 'Checklist',
    edit: 'Editar',
    live: 'Editor + preview',
    preview: 'Preview',
    fullscreen: 'Tela cheia',
    help: 'Ajuda',
  };

  const commandsFilter = (cmd: ICommand, isExtra: boolean): false | ICommand => {
    if (!cmd) return cmd;
    const name = cmd.name;
    const label = name ? LABELS[name] : undefined;
    let next: ICommand = cmd;
    if (label) {
      next = { ...next, buttonProps: { ...(next.buttonProps ?? {}), 'aria-label': label, title: label } };
    }
    if (name === 'image') {
      next = { ...next, execute: () => setUploadOpen(true) };
    }
    return next;
  };

  return (
    <div
      className="markdown-field wmde-markdown-var rounded-lg overflow-hidden border border-base-300"
      data-color-mode={colorMode}
    >
      <MDEditor
        value={value}
        onChange={v => onChange(v ?? '')}
        height={height}
        preview={preview}
        commandsFilter={commandsFilter}
        textareaProps={{ placeholder, disabled }}
      />

      {uploadOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-3">Inserir mídia</h3>

            <div className="space-y-3">
              <label className="form-control">
                <span className="label-text text-xs mb-1">Tipo de mídia</span>
                <select
                  className="select select-bordered select-sm"
                  value={mediaKind}
                  onChange={e => setMediaKind(e.target.value as MediaKind)}
                >
                  <option value="image">Imagem centralizada</option>
                  <option value="image-left">Imagem à esquerda (texto envolve)</option>
                  <option value="image-right">Imagem à direita (texto envolve)</option>
                  <option value="youtube">YouTube (embed)</option>
                  <option value="video">Vídeo (mp4/webm)</option>
                  <option value="audio">Áudio (mp3/ogg)</option>
                </select>
              </label>

              <>
                  {/* Upload R2 com dedupe por hash */}
                  <MediaUpload
                    accept={
                      mediaKind === 'video' ? 'video' :
                      mediaKind === 'audio' ? 'audio' :
                      mediaKind === 'image' || mediaKind === 'image-left' || mediaKind === 'image-right' ? 'image' :
                      'all'
                    }
                    folder={uploadFolder}
                    onUploaded={asset => {
                      setPendingUrl(asset.url);
                      if (asset.name && !altText) setAltText(asset.name.replace(/\.[^.]+$/, ''));
                    }}
                  />

                  {/* URL direta (YouTube entre outros) */}
                  {mediaKind === 'youtube' && (
                    <label className="form-control">
                      <span className="label-text text-xs mb-1">URL do YouTube</span>
                      <input
                        type="url"
                        className="input input-bordered input-sm"
                        value={pendingUrl}
                        onChange={e => setPendingUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </label>
                  )}

                  <label className="form-control">
                    <span className="label-text text-xs mb-1">Texto alternativo / título</span>
                    <input
                      type="text"
                      className="input input-bordered input-sm"
                      value={altText}
                      onChange={e => setAltText(e.target.value)}
                      placeholder="descreva o conteúdo"
                    />
                  </label>

                  {/* Galeria R2 — reutilizar arquivos existentes */}
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
                        value={gallerySearch}
                        onChange={e => runSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-auto border border-base-300 rounded-lg p-2">
                    {galleryLoading && <div className="text-xs text-base-content/60 p-2">Carregando...</div>}
                    {!galleryLoading && gallery.length === 0 && (
                      <div className="text-xs text-base-content/60 p-2">Nenhum arquivo ainda.</div>
                    )}
                    <div className="grid grid-cols-4 gap-2">
                      {gallery.map(asset => (
                        <button
                          key={asset.id}
                          type="button"
                          onClick={() => {
                            setPendingUrl(asset.url);
                            if (asset.name && !altText) setAltText(asset.name.replace(/\.[^.]+$/, ''));
                            if (asset.kind === 'video') setMediaKind('video');
                            else if (asset.kind === 'audio') setMediaKind('audio');
                          }}
                          className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                            pendingUrl === asset.url ? 'border-primary' : 'border-base-300 hover:border-primary/50'
                          }`}
                          title={asset.name || asset.url}
                        >
                          {asset.kind === 'image' ? (
                            <img src={asset.url} alt="" className="w-full h-full object-cover" />
                          ) : asset.kind === 'video' ? (
                            <div className="w-full h-full bg-base-300 flex items-center justify-center">
                              <span className="badge badge-xs">vídeo</span>
                            </div>
                          ) : (
                            <div className="w-full h-full bg-base-300 flex items-center justify-center">
                              <span className="badge badge-xs">áudio</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
              </>

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
              <button className="btn btn-ghost" onClick={() => { setUploadOpen(false); setPendingUrl(''); setAltText(''); }}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={insertMedia} disabled={!pendingUrl.trim()}>
                Inserir
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setUploadOpen(false)} />
        </div>
      )}
    </div>
  );
}
