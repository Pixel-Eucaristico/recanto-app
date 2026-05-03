'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  BookChapter, BookSectionKind, BookReference, BookGlossaryTerm,
  BookCredits, BookFootnote, CitationStyle,
} from '@/domain/library/types';
import { BookEntity } from '@/domain/library/entities/Book';
import { BlockMarkdownEntity } from '@/domain/library/entities/BlockMarkdown';

export interface SaveChapterPayload {
  /** ID do capítulo (preserva doc existente ao editar). */
  id?: string;
  book_id: string;
  order: number;
  title: string;
  subtitle?: string;
  kind?: BookSectionKind;
  blocks: BookChapter['blocks'];
  footnotes?: BookFootnote[];
  references?: BookReference[];
  citation_style?: CitationStyle;
  glossary_terms?: BookGlossaryTerm[];
  credits?: BookCredits;
}

interface UseChapterEditorOptions {
  bookId: string;
  chapter: BookChapter | null;
  defaultOrder: number;
  saving: boolean;
  onSave: (payload: SaveChapterPayload) => Promise<void>;
  onCancel: () => void;
  /** Outros capítulos do livro — usado pra auto-carregar singleton existente ao trocar kind. */
  existingChapters?: BookChapter[];
}

interface Baseline {
  title: string;
  subtitle: string;
  order: number;
  kind: BookSectionKind;
  markdown: string;
  footnotes: BookFootnote[];
  references: BookReference[];
  citationStyle: CitationStyle;
  glossaryTerms: BookGlossaryTerm[];
  credits: BookCredits;
}

function snapshotFromChapter(chapter: BookChapter | null, defaultOrder: number): Baseline {
  return {
    title: chapter?.title ?? '',
    subtitle: chapter?.subtitle ?? '',
    order: chapter?.order ?? defaultOrder,
    kind: chapter?.kind ?? 'chapter',
    markdown: chapter ? BlockMarkdownEntity.stringify(chapter.blocks) : '',
    footnotes: chapter?.footnotes ?? [],
    references: chapter?.references ?? [],
    citationStyle: chapter?.citation_style ?? 'abnt',
    glossaryTerms: chapter?.glossary_terms ?? [],
    credits: chapter?.credits ?? {},
  };
}

export function useChapterEditor({ bookId, chapter, defaultOrder, saving, onSave, onCancel, existingChapters = [] }: UseChapterEditorOptions) {
  const initial = snapshotFromChapter(chapter, defaultOrder);
  // Quando user troca kind pra singleton existente, este state guarda o ID
  // pra preservar no save (evita criar duplicado)
  const [loadedExistingId, setLoadedExistingId] = useState<string | null>(null);

  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [order, setOrder] = useState(initial.order);
  const [kind, setKind] = useState<BookSectionKind>(initial.kind);
  const [markdown, setMarkdown] = useState(initial.markdown);
  const [footnotes, setFootnotes] = useState<BookFootnote[]>(initial.footnotes);
  const [references, setReferences] = useState<BookReference[]>(initial.references);
  const [citationStyle, setCitationStyle] = useState<CitationStyle>(initial.citationStyle);
  const [glossaryTerms, setGlossaryTerms] = useState<BookGlossaryTerm[]>(initial.glossaryTerms);
  const [credits, setCredits] = useState<BookCredits>(initial.credits);

  const [baseline, setBaseline] = useState<Baseline>(initial);
  const [mode, setMode] = useState<'view' | 'edit'>(chapter ? 'view' : 'edit');
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // Depende de chapter?.id (ID estável) — evita reset de form quando pai re-renderiza
  useEffect(() => {
    const snap = snapshotFromChapter(chapter, defaultOrder);
    setTitle(snap.title);
    setSubtitle(snap.subtitle);
    setOrder(snap.order);
    setKind(snap.kind);
    setMarkdown(snap.markdown);
    setFootnotes(snap.footnotes);
    setReferences(snap.references);
    setCitationStyle(snap.citationStyle);
    setGlossaryTerms(snap.glossaryTerms);
    setCredits(snap.credits);
    setBaseline(snap);
    setMode(chapter ? 'view' : 'edit');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter?.id, defaultOrder]);

  /**
   * Troca kind. Se for singleton (não permite múltiplos) e já existe um capítulo
   * com esse kind no livro, AUTO-CARREGA os dados do existente — evita criar duplicado.
   */
  function handleKindChange(newKind: BookSectionKind) {
    setKind(newKind);
    // Só auto-carrega se está criando (chapter === null) e o kind é singleton
    if (chapter || BookEntity.allowsMultiple(newKind)) {
      setLoadedExistingId(null);
      return;
    }
    const existing = existingChapters.find(c => BookEntity.kindOf(c) === newKind);
    if (!existing) {
      setLoadedExistingId(null);
      return;
    }
    // Carrega dados do singleton existente no editor atual
    const snap = snapshotFromChapter(existing, defaultOrder);
    setTitle(snap.title);
    setSubtitle(snap.subtitle);
    setOrder(snap.order);
    setMarkdown(snap.markdown);
    setFootnotes(snap.footnotes);
    setReferences(snap.references);
    setCitationStyle(snap.citationStyle);
    setGlossaryTerms(snap.glossaryTerms);
    setCredits(snap.credits);
    setBaseline({ ...snap, kind: newKind });
    setLoadedExistingId(existing.id);
  }

  const isDirty =
    title !== baseline.title ||
    (subtitle ?? '') !== (baseline.subtitle ?? '') ||
    order !== baseline.order ||
    kind !== baseline.kind ||
    markdown !== baseline.markdown ||
    JSON.stringify(footnotes) !== JSON.stringify(baseline.footnotes) ||
    JSON.stringify(references) !== JSON.stringify(baseline.references) ||
    citationStyle !== baseline.citationStyle ||
    JSON.stringify(glossaryTerms) !== JSON.stringify(baseline.glossaryTerms) ||
    JSON.stringify(credits) !== JSON.stringify(baseline.credits);

  const previewBlocks = useMemo(() => {
    const blocks = BlockMarkdownEntity.parse(markdown);
    return BookEntity.numberChapter({ id: '', book_id: bookId, order, title, blocks, created_at: '' }).blocks;
  }, [markdown, bookId, order, title]);

  /** Fallback insert at end of markdown (used by FootnotePanel when toolbar isn't available) */
  function insertFootnoteMarker(marker: string) {
    setMarkdown(prev => prev.endsWith(' ') || prev.length === 0 ? prev + marker : prev + ' ' + marker);
  }

  /**
   * Called by RichTextEditor toolbar's footnote button.
   * Reserves the next number, creates an empty entry in the panel, returns the number.
   * The toolbar then inserts [^N] at the cursor position itself.
   */
  function reserveFootnoteNumber(): number {
    const next = footnotes.length > 0
      ? Math.max(...footnotes.map(f => f.number)) + 1
      : 1;
    const newNote: BookFootnote = {
      id: `fn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      number: next,
      anchor_block_id: '',
      content: '',
    };
    setFootnotes(prev => [...prev, newNote]);
    return next;
  }

  async function handleSave() {
    setError(null);

    // Validation by section kind
    if (kind === 'bibliography') {
      if (references.length === 0) { setError('Bibliografia precisa de pelo menos uma referência.'); return; }
    } else if (kind === 'glossary') {
      if (glossaryTerms.length === 0) { setError('Glossário precisa de pelo menos um termo.'); return; }
    } else if (kind === 'credits') {
      if (!credits.title?.trim() && !credits.authors?.length) { setError('Créditos precisam de título ou autor.'); return; }
    } else {
      const blocks = BlockMarkdownEntity.parse(markdown);
      if (blocks.length === 0) { setError('Seção vazia. Adicione pelo menos um parágrafo.'); return; }
    }

    try {
      const blocks = (kind === 'bibliography' || kind === 'glossary' || kind === 'credits')
        ? []
        : BlockMarkdownEntity.parse(markdown);

      await onSave({
        // Passa id quando editando OU quando carregou singleton existente — evita duplicar
        id: chapter?.id ?? loadedExistingId ?? undefined,
        book_id: bookId, order, title,
        subtitle: subtitle || undefined,
        kind, blocks,
        footnotes: footnotes.length ? footnotes : undefined,
        references: kind === 'bibliography' ? references : undefined,
        citation_style: kind === 'bibliography' ? citationStyle : undefined,
        glossary_terms: kind === 'glossary' ? glossaryTerms : undefined,
        credits: kind === 'credits' ? credits : undefined,
      });
      const newBaseline: Baseline = { title, subtitle, order, kind, markdown, footnotes, references, citationStyle, glossaryTerms, credits };
      setBaseline(newBaseline);
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
    kind, setKind: handleKindChange,
    markdown, setMarkdown,
    footnotes, setFootnotes,
    references, setReferences,
    citationStyle, setCitationStyle,
    glossaryTerms, setGlossaryTerms,
    credits, setCredits,
    insertFootnoteMarker,
    reserveFootnoteNumber,
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
