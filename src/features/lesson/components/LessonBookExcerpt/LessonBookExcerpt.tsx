'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ExternalLink, Quote, Check, X } from 'lucide-react';
import type { LessonBookCitation } from '@/domain/formation/types';
import type { Book, BookBlock, BookChapter, BookFootnote, BookReadingProgress } from '@/domain/library/types';
import { libraryService } from '@/application/library/LibraryService';
import { BookEntity } from '@/domain/library/entities/Book';
import { CanonicalRefEntity } from '@/domain/library/entities/CanonicalRef';
import { RichContent } from '@/shared/components/RichContent';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { bookReadingProgressRepository } from '@/infrastructure/library/BookReadingProgressRepository';
import { useBookAnnotations } from '@/features/library/hooks/useBookAnnotations';
import { useBookTags } from '@/features/library/hooks/useBookTags';
import { BlockReader } from '@/features/library/components/BookReader/components/BlockReader';
import { CommentModal } from '@/shared/components/CommentModal';

interface LessonBookExcerptProps {
  citation: LessonBookCitation;
}

function chapterKindLabel(kind: string | undefined, order: number): string {
  switch (kind) {
    case 'credits': return 'Folha de Rosto';
    case 'preface': return 'Prefácio';
    case 'introduction': return 'Introdução';
    case 'bibliography': return 'Bibliografia';
    case 'glossary': return 'Glossário';
    case 'appendix': return 'Apêndice';
    case 'notes': return 'Notas';
    case 'about': return 'Sobre';
    case 'chapter':
    default:
      return `Capítulo ${order}`;
  }
}

interface LoadedExcerpt {
  book: Book;
  /** Chapters dentro do range, com blocks já filtrados pelo slice. */
  chaptersInRange: Array<{
    chapter: BookChapter;
    blocks: BookBlock[];
  }>;
  totalChapters: number;
}

export function LessonBookExcerpt({ citation }: LessonBookExcerptProps) {
  const user = useCurrentUser();
  const [data, setData] = useState<LoadedExcerpt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<BookReadingProgress | null>(null);
  const [marking, setMarking] = useState(false);
  const [bookmarkedRef, setBookmarkedRef] = useState<string | null>(null);
  const [commentTarget, setCommentTarget] = useState<string | null>(null);
  const [footnoteModal, setFootnoteModal] = useState<{ footnote: BookFootnote } | null>(null);

  const annotations = useBookAnnotations(user?.id, citation.book_id);
  const tagsHook = useBookTags(user?.id, citation.book_id);

  // Load book + chapters + progress
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      libraryService.getBook(citation.book_id),
      libraryService.listChapters(citation.book_id),
    ])
      .then(([book, chapters]) => {
        if (cancelled) return;
        if (!book) {
          setError('Livro não encontrado.');
          return;
        }
        // Slice por range. Vazio = livro inteiro.
        const sliced = BookEntity.sliceByRange(chapters, citation.start_ref, citation.end_ref);
        const slicedIds = new Set(sliced.map(b => b.id));
        const hasExplicitRange = !!(citation.start_ref || citation.end_ref);
        const sortedChapters = BookEntity.sortChapters(chapters);
        const chaptersInRange = sortedChapters
          .map(ch => ({
            chapter: ch,
            blocks: (ch.blocks ?? []).filter(b => slicedIds.has(b.id)),
          }))
          .filter(c => {
            if (c.blocks.length === 0) return false;
            // Range canônico (capítulo:parágrafo) só faz sentido pra body matter.
            // Quando range explícito, descarta pré/pós-textuais (legacy data pode ter ref
            // salvo nesses kinds, e sliceByRange acaba incluindo via fallback chapter_order).
            if (hasExplicitRange) {
              const kind = c.chapter.kind ?? 'chapter';
              return kind === 'chapter';
            }
            return true;
          });
        setData({ book, chaptersInRange, totalChapters: chapters.length });
      })
      .catch(e => !cancelled && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [citation.book_id, citation.start_ref, citation.end_ref]);

  // Load reading progress (pra mostrar bookmark + status "lido")
  useEffect(() => {
    if (!user?.id) return;
    bookReadingProgressRepository.get(user.id, citation.book_id).then(p => {
      setProgress(p);
      setBookmarkedRef(p?.last_ref ?? null);
    });
  }, [user?.id, citation.book_id]);

  // Event delegation: clique em <sup data-fn-id> abre modal de footnote
  useEffect(() => {
    if (!data) return;
    function handler(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest('[data-fn-id]') as HTMLElement | null;
      if (!target) return;
      e.preventDefault();
      const num = Number(target.getAttribute('data-fn-id'));
      // Procura em todos os chapters carregados
      for (const { chapter } of data!.chaptersInRange) {
        const fn = chapter.footnotes?.find(f => f.number === num);
        if (fn) { setFootnoteModal({ footnote: fn }); return; }
      }
    }
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [data]);

  async function handleBookmark(ref: string | null) {
    if (!user?.id || !data) return;
    const now = new Date().toISOString();
    const parsed = ref ? CanonicalRefEntity.tryParse(ref) : null;
    const lastChapter = parsed?.chapter ?? progress?.last_chapter_order ?? 1;
    const percent = Math.min(100, Math.round((lastChapter / data.totalChapters) * 100));
    const saved = await bookReadingProgressRepository.upsert({
      user_id: user.id,
      book_id: citation.book_id,
      last_chapter_order: lastChapter,
      last_ref: ref ?? undefined,
      percent,
      updated_at: now,
      last_bookmark_at: now,
      book_title: data.book.title,
      book_cover_url: data.book.cover_url,
    });
    setProgress(saved);
    setBookmarkedRef(ref);
  }

  // Mark as read — atualiza progress.last_ref pro end do excerpt
  async function handleMarkAsRead() {
    if (!user?.id || !data) return;
    setMarking(true);
    try {
      const endRef = citation.end_ref ?? '';
      const parsedEnd = CanonicalRefEntity.tryParse(endRef);
      const lastChapter = parsedEnd?.chapter ?? data.totalChapters;
      const percent = Math.min(100, Math.round((lastChapter / data.totalChapters) * 100));
      const now = new Date().toISOString();
      const saved = await bookReadingProgressRepository.upsert({
        user_id: user.id,
        book_id: citation.book_id,
        last_chapter_order: lastChapter,
        last_ref: endRef || undefined,
        percent,
        updated_at: now,
        last_bookmark_at: now,
        book_title: data.book.title,
        book_cover_url: data.book.cover_url,
      });
      setProgress(saved);
    } finally {
      setMarking(false);
    }
  }

  const alreadyRead = useMemo(() => {
    if (!progress?.last_ref || !citation.end_ref) return false;
    const last = CanonicalRefEntity.tryParse(progress.last_ref);
    const end = CanonicalRefEntity.tryParse(citation.end_ref);
    if (!last || !end) return false;
    return CanonicalRefEntity.compare(last, end) >= 0;
  }, [progress?.last_ref, citation.end_ref]);

  if (loading) {
    return (
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 gap-2">
          <span className="loading loading-dots loading-sm" />
          <span className="text-xs text-base-content/60">Carregando trecho do livro...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="alert alert-warning text-sm">
        <span>Não foi possível carregar o trecho do livro. {error}</span>
      </div>
    );
  }

  const { book, chaptersInRange } = data;
  const startRef = citation.start_ref ?? '';
  const endRef = citation.end_ref ?? '';
  const rangeLabel = (startRef || endRef)
    ? `${startRef || 'início'} → ${endRef || 'fim'}`
    : 'completo';

  const readerHref = startRef
    ? `/app/dashboard/library/${book.id}?ref=${encodeURIComponent(startRef)}`
    : `/app/dashboard/library/${book.id}`;

  return (
    <div className="card bg-base-100 border border-primary/30">
      <div className="card-body p-4 gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 flex-wrap pb-2 border-b border-base-300">
          <div className="flex items-start gap-2 min-w-0">
            <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h4 className="font-semibold text-sm truncate">{book.title}</h4>
              {book.author && (
                <p className="text-xs text-base-content/60 truncate">{book.author}</p>
              )}
              <p className="text-[11px] text-base-content/50 mt-0.5">
                Trecho: <code className="bg-base-200 px-1 rounded">{rangeLabel}</code>
              </p>
            </div>
          </div>
          <Link
            href={readerHref}
            className="btn btn-ghost btn-xs gap-1 shrink-0"
            title="Abrir livro completo"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ler completo</span>
          </Link>
        </div>

        {citation.note && (
          <div className="alert alert-info text-sm py-2 gap-2">
            <Quote className="w-4 h-4" />
            <span className="italic">{citation.note}</span>
          </div>
        )}

        {/* Excerpt content — chapters com title/subtitle + BlockReader pra cada block */}
        {chaptersInRange.length === 0 ? (
          <p className="text-sm text-base-content/60 italic">Trecho vazio.</p>
        ) : (
          <div className="space-y-4">
            {chaptersInRange.map(({ chapter, blocks }) => (
              <section key={chapter.id} className="space-y-2">
                {/* Chapter title + subtitle. "Capítulo N" só pra kind=chapter (corpo); outros usam label do kind. */}
                <header className="border-b border-base-300/60 pb-1 mb-2">
                  <p className="text-[10px] uppercase tracking-wide text-base-content/40">
                    {chapterKindLabel(chapter.kind, chapter.order)}
                  </p>
                  <h5 className="font-bold text-base text-base-content">{chapter.title}</h5>
                  {chapter.subtitle && (
                    <p className="text-xs text-base-content/60 italic">{chapter.subtitle}</p>
                  )}
                </header>

                {blocks.map(b => (
                  <BlockReader
                    key={b.id}
                    block={b}
                    chapter={chapter.order}
                    fontPx={15}
                    isBookmarked={!!b.ref && b.ref === bookmarkedRef}
                    onBookmark={() => handleBookmark(b.ref === bookmarkedRef ? null : (b.ref ?? null))}
                    onVisible={() => { /* no-op no excerpt — não atualiza progress por scroll */ }}
                    blockHighlights={b.ref ? annotations.highlightsForRef(b.ref) : []}
                    commentCount={b.ref ? annotations.commentsForRef(b.ref).length : 0}
                    blockTags={b.ref ? tagsHook.tagsForRef(b.ref) : []}
                    footnotes={chapter.footnotes ?? []}
                    onAddHighlight={(color, text, occ) => { if (b.ref) annotations.addHighlight(b.ref, color, text, occ); }}
                    onRemoveHighlight={annotations.removeHighlight}
                    onAddTag={(text, color) => tagsHook.addTag(chapter.order, text, color, b.ref ?? undefined)}
                    onRemoveTag={tagsHook.removeTag}
                    onOpenComment={() => { if (b.ref) setCommentTarget(b.ref); }}
                  />
                ))}
              </section>
            ))}
          </div>
        )}

        {/* Mark as read */}
        {user?.id && (
          <div className="pt-2 border-t border-base-300 flex items-center justify-between gap-2 flex-wrap">
            <p className="text-[11px] text-base-content/60">
              {alreadyRead
                ? `Você já leu até ${progress?.last_ref ?? 'aqui'}.`
                : `Marcar como lido atualiza progresso${progress?.last_ref ? ` (atual: ${progress.last_ref})` : ''}.`}
            </p>
            <button
              type="button"
              className={`btn btn-xs gap-1 ${alreadyRead ? 'btn-ghost border border-success/40 text-success' : 'btn-primary'}`}
              onClick={handleMarkAsRead}
              disabled={marking}
            >
              {alreadyRead ? <Check className="w-3.5 h-3.5" /> : null}
              {marking ? 'Salvando...' : alreadyRead ? 'Lido' : 'Marcar como lido'}
            </button>
          </div>
        )}
      </div>

      {/* Comment modal */}
      {commentTarget && (
        <CommentModal
          refLabel={commentTarget}
          comments={annotations.commentsForRef(commentTarget)}
          onAdd={text => annotations.addComment(commentTarget, text)}
          onUpdate={annotations.updateComment}
          onDelete={annotations.removeComment}
          onClose={() => setCommentTarget(null)}
        />
      )}

      {/* Footnote popup */}
      {footnoteModal && (
        <div className="modal modal-open" onClick={() => setFootnoteModal(null)}>
          <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <sup className="text-primary font-bold text-lg">{footnoteModal.footnote.number}</sup>
                Nota de rodapé
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-circle"
                onClick={() => setFootnoteModal(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm">
              <RichContent markdown={footnoteModal.footnote.content} />
            </div>
            <div className="modal-action">
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setFootnoteModal(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
