'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type { ICommand } from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { type MediaKind, buildMediaMarkdown, EDITOR_LABELS } from './utils/markdownFieldUtils';
import { MediaInsertModal } from './components/MediaInsertModal';
import { useMarkdownField } from './hooks/useMarkdownField';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

/** Auto-detecta tela < 768px (mobile) — força preview "edit" pra evitar split horrível. */
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isMobile;
}

interface MarkdownFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
  preview?: 'edit' | 'preview' | 'live';
  uploadFolder?: string;
  /** Quando true, editor cresce com o conteúdo (sem scroll interno). Default: true. */
  autoGrow?: boolean;
}

export function MarkdownField({
  value, onChange, placeholder, height = 200,
  disabled = false, preview = 'edit', uploadFolder = 'markdown-media',
  autoGrow = true,
}: MarkdownFieldProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Mobile: força "edit" — split-view (live) quebra em telas estreitas
  const effectivePreview = isMobile ? 'edit' : preview;
  // Mobile: aumenta height pra ter espaço útil de digitação
  const effectiveHeight = isMobile ? Math.max(height, 200) : height;

  // Auto-grow: ajusta height do textarea ao conteúdo (sem scroll interno)
  useEffect(() => {
    if (!autoGrow) return;
    const root = containerRef.current;
    if (!root) return;
    const ta = root.querySelector('textarea') as HTMLTextAreaElement | null;
    if (!ta) return;
    const grow = () => {
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    };
    grow();
    ta.addEventListener('input', grow);
    // Watch external value changes (paste programático etc)
    const obs = new MutationObserver(grow);
    obs.observe(ta, { attributes: true, attributeFilter: ['value'] });
    return () => {
      ta.removeEventListener('input', grow);
      obs.disconnect();
    };
  }, [autoGrow, value]);

  const {
    colorMode, uploadOpen, setUploadOpen,
    pendingUrl, setPendingUrl,
    altText, setAltText,
    mediaKind, setMediaKind,
    gallery, gallerySearch, galleryLoading,
    valueRef,
    runSearch,
    handleGallerySelect,
    handleUploaded,
    closeModal,
  } = useMarkdownField(value, onChange, uploadFolder);

  const commandsFilter = (cmd: ICommand, _isExtra: boolean): false | ICommand => {
    if (!cmd) return cmd;
    const label = cmd.name ? EDITOR_LABELS[cmd.name] : undefined;
    let next: ICommand = cmd;
    if (label) next = { ...next, buttonProps: { ...(next.buttonProps ?? {}), 'aria-label': label, title: label } };
    if (cmd.name === 'image') next = { ...next, execute: () => setUploadOpen(true) };
    return next;
  };

  function insertMedia() {
    if (!pendingUrl.trim()) return;
    const md = buildMediaMarkdown(mediaKind, pendingUrl.trim(), altText.trim() || 'mídia');
    onChange((valueRef.current ?? '') + md);
    closeModal();
  }

  return (
    <div
      ref={containerRef}
      className={`markdown-field wmde-markdown-var rounded-lg overflow-hidden border border-base-300 max-w-full ${autoGrow ? 'markdown-field-autogrow' : ''}`}
      data-color-mode={colorMode}
    >
      <MDEditor
        value={value}
        onChange={v => onChange(v ?? '')}
        height={effectiveHeight}
        preview={effectivePreview}
        commandsFilter={commandsFilter}
        textareaProps={{ placeholder, disabled, style: { fontSize: '16px' } }}
        visibleDragbar={!autoGrow}
      />

      {uploadOpen && (
        <MediaInsertModal
          mediaKind={mediaKind}
          pendingUrl={pendingUrl}
          altText={altText}
          gallery={gallery}
          galleryLoading={galleryLoading}
          gallerySearch={gallerySearch}
          uploadFolder={uploadFolder}
          onKindChange={setMediaKind}
          onUrlChange={setPendingUrl}
          onAltChange={setAltText}
          onGallerySearch={runSearch}
          onGallerySelect={handleGallerySelect}
          onUploaded={handleUploaded}
          onInsert={insertMedia}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
