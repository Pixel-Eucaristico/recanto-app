'use client';

import dynamic from 'next/dynamic';
import type { ICommand } from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { type MediaKind, buildMediaMarkdown, EDITOR_LABELS } from './utils/markdownFieldUtils';
import { MediaInsertModal } from './components/MediaInsertModal';
import { useMarkdownField } from './hooks/useMarkdownField';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface MarkdownFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
  preview?: 'edit' | 'preview' | 'live';
  uploadFolder?: string;
}

export function MarkdownField({
  value, onChange, placeholder, height = 200,
  disabled = false, preview = 'edit', uploadFolder = 'markdown-media',
}: MarkdownFieldProps) {
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
    <div className="markdown-field wmde-markdown-var rounded-lg overflow-hidden border border-base-300" data-color-mode={colorMode}>
      <MDEditor
        value={value}
        onChange={v => onChange(v ?? '')}
        height={height}
        preview={preview}
        commandsFilter={commandsFilter}
        textareaProps={{ placeholder, disabled }}
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
