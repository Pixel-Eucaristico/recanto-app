'use client';

import { useEffect, useMemo, useState } from 'react';
import type { BookChapter } from '@/domain/library/types';
import { BookEntity } from '@/domain/library/entities/Book';
import { BlockMarkdownEntity } from '@/domain/library/entities/BlockMarkdown';

interface UseChapterEditorOptions {
  bookId: string;
  chapter: BookChapter | null;
  defaultOrder: number;
  saving: boolean;
  onSave: (chapter: { book_id: string; order: number; title: string; subtitle?: string; blocks: BookChapter['blocks'] }) => Promise<void>;
  onCancel: () => void;
}

export function useChapterEditor({ bookId, chapter, defaultOrder, saving, onSave, onCancel }: UseChapterEditorOptions) {
  const [title, setTitle] = useState(chapter?.title ?? '');
  const [subtitle, setSubtitle] = useState(chapter?.subtitle ?? '');
  const [order, setOrder] = useState(chapter?.order ?? defaultOrder);
  const [markdown, setMarkdown] = useState(chapter ? BlockMarkdownEntity.stringify(chapter.blocks) : '');
  const [baseline, setBaseline] = useState({ title: chapter?.title ?? '', subtitle: chapter?.subtitle ?? '', order: chapter?.order ?? defaultOrder, markdown: chapter ? BlockMarkdownEntity.stringify(chapter.blocks) : '' });
  const [mode, setMode] = useState<'view' | 'edit'>(chapter ? 'view' : 'edit');
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    const t = chapter?.title ?? '';
    const s = chapter?.subtitle ?? '';
    const o = chapter?.order ?? defaultOrder;
    const m = chapter ? BlockMarkdownEntity.stringify(chapter.blocks) : '';
    setTitle(t); setSubtitle(s); setOrder(o); setMarkdown(m);
    setBaseline({ title: t, subtitle: s, order: o, markdown: m });
    setMode(chapter ? 'view' : 'edit');
  }, [chapter, defaultOrder]);

  const isDirty = title !== baseline.title || (subtitle ?? '') !== (baseline.subtitle ?? '') || order !== baseline.order || markdown !== baseline.markdown;

  const previewBlocks = useMemo(() => {
    const blocks = BlockMarkdownEntity.parse(markdown);
    return BookEntity.numberChapter({ id: '', book_id: bookId, order, title, blocks, created_at: '' }).blocks;
  }, [markdown, bookId, order, title]);

  async function handleSave() {
    setError(null);
    const blocks = BlockMarkdownEntity.parse(markdown);
    if (blocks.length === 0) { setError('Capítulo vazio. Adicione pelo menos um parágrafo.'); return; }
    try {
      await onSave({ book_id: bookId, order, title, subtitle: subtitle || undefined, blocks });
      setBaseline({ title, subtitle, order, markdown });
      setMode('view');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function handleBack() {
    if (isDirty) { setConfirmDiscard(true); return; }
    onCancel();
  }

  async function handleSaveAndClose() {
    setConfirmDiscard(false);
    await handleSave();
    if (!error) onCancel();
  }

  return {
    title, setTitle,
    subtitle, setSubtitle,
    order, setOrder,
    markdown, setMarkdown,
    mode, setMode,
    isDirty,
    error,
    confirmDiscard, setConfirmDiscard,
    previewBlocks,
    handleSave,
    handleBack,
    handleSaveAndClose,
  };
}
