'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ICommand } from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { type MediaKind, buildMediaMarkdown, EDITOR_LABELS } from './utils/markdownFieldUtils';
import { MediaInsertModal } from './components/MediaInsertModal';
import { useMarkdownField } from './hooks/useMarkdownField';
import {
  alignLeftCommand,
  alignCenterCommand,
  alignRightCommand,
} from './utils/customCommands';
import { commands as mdCommands } from '@uiw/react-md-editor';
import { detectActiveCommands, detectMaxHeadingLevel } from './utils/detectActiveCommands';

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

  // Toolbar active-state feedback: marca botões cujo formato bate com cursor/seleção
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const ta = root.querySelector('textarea') as HTMLTextAreaElement | null;
    if (!ta) return;

    const update = () => {
      const cursor = ta.selectionStart ?? 0;
      const active = detectActiveCommands(ta.value, cursor);
      // Botões do MDEditor têm data-name="<command>"
      const buttons = root.querySelectorAll<HTMLElement>('[data-name]');
      buttons.forEach(btn => {
        const name = btn.getAttribute('data-name') ?? '';
        if (active.has(name)) btn.setAttribute('data-active', 'true');
        else btn.removeAttribute('data-active');
      });
    };

    update();
    ta.addEventListener('keyup', update);
    ta.addEventListener('mouseup', update);
    ta.addEventListener('input', update);
    document.addEventListener('selectionchange', update);
    return () => {
      ta.removeEventListener('keyup', update);
      ta.removeEventListener('mouseup', update);
      ta.removeEventListener('input', update);
      document.removeEventListener('selectionchange', update);
    };
  }, [value]);

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

  // Headings progressivos: H1-H3 sempre, H4-H6 aparecem 1 por vez conforme nível anterior é usado
  const maxHeadingLevel = useMemo(() => detectMaxHeadingLevel(value), [value]);

  const commands = useMemo<ICommand[]>(() => {
    const titleCommands: ICommand[] = [mdCommands.title1, mdCommands.title2, mdCommands.title3];
    if (maxHeadingLevel >= 3) titleCommands.push(mdCommands.title4);
    if (maxHeadingLevel >= 4) titleCommands.push(mdCommands.title5);
    if (maxHeadingLevel >= 5) titleCommands.push(mdCommands.title6);
    return [
      mdCommands.bold,
      mdCommands.italic,
      mdCommands.strikethrough,
      mdCommands.hr,
      mdCommands.divider,
      ...titleCommands,
      mdCommands.divider,
      mdCommands.link,
      mdCommands.quote,
      mdCommands.code,
      mdCommands.codeBlock,
      mdCommands.comment,
      mdCommands.image,
      mdCommands.table,
      mdCommands.divider,
      mdCommands.unorderedListCommand,
      mdCommands.orderedListCommand,
      mdCommands.checkedListCommand,
      mdCommands.divider,
      mdCommands.help,
    ];
  }, [maxHeadingLevel]);

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
        commands={commands}
        commandsFilter={commandsFilter}
        extraCommands={[
          alignLeftCommand,
          alignCenterCommand,
          alignRightCommand,
          mdCommands.divider,
          mdCommands.codeEdit,
          mdCommands.codeLive,
          mdCommands.codePreview,
          mdCommands.divider,
          mdCommands.fullscreen,
        ]}
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
