'use client';

import { useEffect, useRef, useState } from 'react';
import type { BookBlock, BookHighlight, BookTag, BookFootnote, HighlightColor, TagColor } from '@/domain/library/types';
import { RichContent } from '@/shared/components/RichContent';
import { TagInput } from '@/shared/components/TagInput';
import { SelectionToolbar } from './SelectionToolbar';
import { BlockControls } from './BlockControls';
import { TagBadges } from './TagBadges';
import { applyTextHighlights } from '../utils/applyTextHighlights';

/**
 * Substitui markers `[^N]` por <sup> clicável + popup com conteúdo.
 * Usa data-fn-id pra event delegation. Title atribute = popup nativo no Kindle/web.
 */
function applyFootnoteMarkers(content: string, footnotes: BookFootnote[]): string {
  return content.replace(/\[\^(\d+)\]/g, (_, n) => {
    const num = Number(n);
    const fn = footnotes?.find(f => f.number === num);
    // Marker órfão (sem footnote correspondente) — esconde do leitor
    if (!fn) return '';
    const preview = fn.content.slice(0, 200).replace(/[<>"']/g, c =>
      ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c] || c
    );
    // <sup> simples — rehype-raw aceita; clique tratado por event delegation no BookReader
    return `<sup id="fnref${num}" class="footnote-ref-marker" data-fn-id="${num}" title="${preview}" style="color:var(--color-primary,#1d4ed8);font-weight:600;cursor:pointer;padding:0 1px;">${num}</sup>`;
  });
}

interface BlockReaderProps {
  block: BookBlock;
  chapter: number;
  fontPx: number;
  isBookmarked: boolean;
  onBookmark: () => void;
  onVisible: () => void;
  blockHighlights: BookHighlight[];
  commentCount: number;
  blockTags: BookTag[];
  footnotes?: BookFootnote[];
  onAddHighlight: (color: HighlightColor, selectedText: string, occurrenceIndex?: number) => void;
  onRemoveHighlight: (id: string) => void;
  onAddTag: (text: string, color: TagColor) => void;
  onRemoveTag: (id: string) => void;
  onOpenComment: () => void;
}

export function BlockReader({
  block, fontPx, isBookmarked, onBookmark, onVisible,
  blockHighlights, commentCount, blockTags, footnotes = [],
  onAddHighlight, onRemoveHighlight, onAddTag, onRemoveTag, onOpenComment,
}: BlockReaderProps) {
  const ref = block.ref;
  const anchorId = ref ? `ref-${ref.replace(':', '-')}` : undefined;
  const [copied, setCopied] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tagInputOpen, setTagInputOpen] = useState(false);
  const [selection, setSelection] = useState<{ text: string; x: number; y: number; occurrenceIndex: number } | null>(null);
  const elRef = useRef<HTMLElement | null>(null);
  const fontStyle = { fontSize: `${fontPx}px`, lineHeight: 1.7, wordBreak: 'break-word' as const, overflowWrap: 'anywhere' as const };

  useEffect(() => {
    if (!ref || !elRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onVisible(); },
      { threshold: 0.5 },
    );
    observer.observe(elRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  useEffect(() => {
    if (!selection) return;
    function handleMouseDown(e: MouseEvent) {
      const toolbar = document.querySelector('[data-selection-toolbar]');
      if (toolbar?.contains(e.target as Node)) return;
      setTimeout(() => setSelection(null), 200);
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [selection]);

  function computeOccurrenceIndex(range: Range, text: string): number {
    if (!elRef.current) return 1;
    try {
      const pre = document.createRange();
      pre.selectNodeContents(elRef.current);
      pre.setEnd(range.startContainer, range.startOffset);
      const before = pre.toString();
      const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = before.match(new RegExp(escaped, 'g'));
      return (matches?.length ?? 0) + 1;
    } catch {
      return 1;
    }
  }

  function handleMouseUp(e: React.MouseEvent) {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) return;
    const text = sel.toString().trim();
    if (!elRef.current?.contains(sel.anchorNode)) return;
    if ((e.target as HTMLElement).closest('[data-controls]')) return;
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const occurrenceIndex = computeOccurrenceIndex(range, text);
    setSelection({ text, x: rect.left + rect.width / 2, y: rect.top - 8, occurrenceIndex });
  }

  function handleTouchEnd() {
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) return;
      const text = sel.toString().trim();
      if (!elRef.current?.contains(sel.anchorNode)) return;
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const occurrenceIndex = computeOccurrenceIndex(range, text);
      setSelection({ text, x: rect.left + rect.width / 2, y: rect.top - 8, occurrenceIndex });
    }, 100);
  }

  function copyAnchor() {
    if (!ref) return;
    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?ref=${ref}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const highlighted = blockHighlights.length > 0
    ? applyTextHighlights(block.content, blockHighlights)
    : block.content;
  // Aplica markers de footnote APÓS highlights pra não interferir no regex de seleção
  const markedContent = applyFootnoteMarkers(highlighted, footnotes);

  const firstHighlight = blockHighlights[0];

  const selectionToolbar = selection && (
    <SelectionToolbar
      x={selection.x}
      y={selection.y}
      onSelectColor={color => {
        onAddHighlight(color, selection.text, selection.occurrenceIndex);
        setSelection(null);
        window.getSelection()?.removeAllRanges();
      }}
      onDismiss={() => setSelection(null)}
    />
  );

  const blockControlsPanel = ref && (
    <div className="relative">
      <BlockControls
        data-controls=""
        refLabel={ref}
        isBookmarked={isBookmarked}
        onBookmark={onBookmark}
        onCopy={copyAnchor}
        copied={copied}
        firstHighlight={firstHighlight}
        highlightCount={blockHighlights.length}
        pickerOpen={pickerOpen}
        onTogglePicker={() => setPickerOpen(p => !p)}
        tagCount={blockTags.length}
        onOpenTag={() => setTagInputOpen(p => !p)}
        commentCount={commentCount}
        onOpenComment={onOpenComment}
      />
      {tagInputOpen && (
        <div className="absolute left-8 top-0 z-40">
          <TagInput
            onSave={(text, color) => { onAddTag(text, color); setTagInputOpen(false); }}
            onClose={() => setTagInputOpen(false)}
          />
        </div>
      )}
    </div>
  );

  const richBody = (
    <div className="flex-1 min-w-0 space-y-1">
      <RichContent markdown={markedContent} className="[&>div]:p-0 [&_p]:my-0 [&_p]:leading-[inherit]" />
      {blockTags.length > 0 && <TagBadges tags={blockTags} onRemove={onRemoveTag} />}
    </div>
  );

  if (block.kind === 'heading') {
    const level = Math.min(6, Math.max(1, block.heading_level ?? 2));
    const sizes: Record<number, string> = {
      1: 'text-2xl md:text-3xl font-bold',
      2: 'text-xl md:text-2xl font-bold',
      3: 'text-lg md:text-xl font-semibold',
      4: 'text-base md:text-lg font-semibold',
      5: 'text-sm font-semibold',
      6: 'text-xs font-semibold uppercase tracking-wide',
    };
    return <p className={`${sizes[level]} text-base-content mt-6 mb-2`}>{block.content}</p>;
  }

  if (block.kind === 'paragraph') {
    return (
      <div
        id={anchorId}
        ref={el => { elRef.current = el; }}
        style={fontStyle}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleTouchEnd}
        className={`group relative text-base-content flex gap-1.5 scroll-mt-24 rounded transition-colors select-text ${
          isBookmarked ? 'bg-warning/10 -mx-2 px-2' : ''
        }`}
      >
        {selectionToolbar}
        {blockControlsPanel}
        {richBody}
      </div>
    );
  }

  if (block.kind === 'quote') {
    return (
      <blockquote
        id={anchorId}
        ref={el => { elRef.current = el as HTMLElement | null; }}
        style={fontStyle}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleTouchEnd}
        className={`group relative border-l-4 border-primary pl-3 italic text-base-content/80 flex gap-1.5 scroll-mt-24 rounded transition-colors select-text ${
          isBookmarked ? 'bg-warning/10 -mx-2 px-2' : ''
        }`}
      >
        {selectionToolbar}
        {blockControlsPanel}
        {richBody}
      </blockquote>
    );
  }

  if (block.kind === 'list') {
    return <div style={fontStyle}><RichContent markdown={block.content} /></div>;
  }

  if (block.kind === 'code') {
    return (
      <pre className="bg-base-200 p-3 rounded-lg text-sm overflow-x-auto">
        <code>{block.content}</code>
      </pre>
    );
  }

  if (block.kind === 'image_ref') {
    const [url, ...captionParts] = (block.content ?? '').split('|');
    const caption = captionParts.join('|');
    return (
      <figure className="my-4 flex flex-col items-center w-full">
        {url && <img src={url} alt={caption || 'imagem'} className="block rounded-lg max-w-full max-h-[60vh] object-contain" />}
        {caption && <figcaption className="block w-full text-xs text-base-content/60 mt-2 text-center italic">{caption}</figcaption>}
      </figure>
    );
  }

  return null;
}
