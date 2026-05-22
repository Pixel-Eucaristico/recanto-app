'use client';

import { useEffect, useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import type { Book, BookChapter, BookFootnote } from '@/domain/library/types';
import { RichContent } from '@/shared/components/RichContent';
import { BookSpoilerVeil } from '@/features/library/components/BookSpoilerVeil';
import { CommentModal } from '@/shared/components/CommentModal';
import { BookReaderHeader } from './components/BookReaderHeader';
import { ContinueBanner } from './components/ContinueBanner';
import { BookTOC } from './components/BookTOC';
import { BookDrawer } from './components/BookDrawer';
import { ChapterSection } from './components/ChapterSection';
import { LazyChapter } from './components/LazyChapter';
import { CompletionBlock } from './components/CompletionBlock';
import { MobileBottomBar } from './components/MobileBottomBar';
import { ContinueModal } from './components/ContinueModal';
import { ExitGuardModal } from './components/ExitGuardModal';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { useBookReader } from './hooks/useBookReader';

interface BookReaderProps {
  book: Book;
  chapters: BookChapter[];
  visibleUntil: string | null;
  truncated: boolean;
  initialRef?: string | null;
  userId?: string;
}

export function BookReader({ book, chapters, visibleUntil, truncated, initialRef, userId }: BookReaderProps) {
  const {
    drawerOpen, setDrawerOpen,
    activeChapter,
    fontLevel, fontPx, changeFontLevel,
    showContinueBanner, setShowContinueBanner,
    showContinueModal, setShowContinueModal,
    showExitGuard, setShowExitGuard,
    currentRef, currentChapter,
    commentTarget, setCommentTarget,
    completing,
    readPercent,
    progress, bookmarkError, saveBookmark, completeReading,
    commentsForRef, highlightsForRef, tagsForRef,
    addHighlight, removeHighlight, addComment, updateComment, removeComment,
    tags, tagsForChapter, addTag, removeTag,
    annotationError,
    jumpToChapter,
    continueSaved,
    isChapterMountRequested,
    handleBack,
    handleComplete,
    handleExit,
    handleSaveAndExit,
    registerChapterRef,
    setActiveRef,
  } = useBookReader({ userId, bookId: book.id, chapters, initialRef });

  // Modal de footnote — clica no marcador <sup> abre popup
  const [footnoteModal, setFootnoteModal] = useState<{ footnote: BookFootnote; refId: string } | null>(null);

  // Event delegation: captura clicks em qualquer botão `[data-fn-id]`.
  // Procura o footnote do MESMO capítulo via DOM ancestor (`section[data-chapter-order]`).
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest('[data-fn-id]') as HTMLElement | null;
      if (!target) return;
      e.preventDefault();
      const num = Number(target.getAttribute('data-fn-id'));
      const section = target.closest('[data-chapter-order]') as HTMLElement | null;
      const order = section ? Number(section.getAttribute('data-chapter-order')) : null;
      // 1) Procura no capítulo correto (mesmo do marker)
      if (order !== null) {
        const ch = chapters.find(c => c.order === order);
        const fn = ch?.footnotes?.find(f => f.number === num);
        if (fn) { setFootnoteModal({ footnote: fn, refId: target.id }); return; }
      }
      // 2) Fallback: procura em todos
      for (const ch of chapters) {
        const fn = ch.footnotes?.find(f => f.number === num);
        if (fn) { setFootnoteModal({ footnote: fn, refId: target.id }); return; }
      }
    }
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [chapters]);

  return (
    // pt-[52px] compensa altura do header fixed pra conteúdo não ficar atrás
    <div className="bg-base-200 pt-[52px]">
      <BookReaderHeader
        book={book}
        fontLevel={fontLevel}
        fontPx={fontPx}
        readPercent={readPercent}
        truncated={truncated}
        visibleUntil={visibleUntil}
        changeFontLevel={changeFontLevel}
        onBack={handleBack}
        onOpenDrawer={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setDrawerOpen(true); }}
      />

      {showContinueBanner && progress && (
        <ContinueBanner
          progress={progress}
          onDismiss={() => setShowContinueBanner(false)}
          onContinue={continueSaved}
        />
      )}

      <div className="flex">
        <aside className="hidden lg:block w-72 shrink-0 border-r border-base-300 bg-base-100 sticky top-[52px] self-start">
          <BookTOC
            book={book}
            chapters={chapters}
            activeChapter={activeChapter}
            visibleUntil={visibleUntil}
            readPercent={readPercent}
            lastChapterOrder={progress?.last_chapter_order ?? null}
            lastRef={progress?.last_ref ?? null}
            tags={tags}
            tagsForChapter={tagsForChapter}
            onJump={jumpToChapter}
            onJumpToRef={continueSaved}
          />
        </aside>

        <BookDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          book={book}
          chapters={chapters}
          activeChapter={activeChapter}
          visibleUntil={visibleUntil}
          truncated={truncated}
          readPercent={readPercent}
          progress={progress}
          tags={tags}
          tagsForChapter={tagsForChapter}
          onJump={jumpToChapter}
          onJumpToRef={continueSaved}
        />

        <main className="flex-1 min-w-0 px-4 md:px-8 py-6 md:py-10 pb-20 lg:pb-10">
          <div className="max-w-prose mx-auto space-y-10">
            {chapters.length === 0 ? (
              <div className="card bg-base-100 border border-base-300">
                <div className="card-body p-6 text-center">
                  <BookOpen className="w-10 h-10 mx-auto text-base-content/40 mb-2" />
                  <p className="text-sm text-base-content/60">Este livro ainda não tem capítulos.</p>
                </div>
              </div>
            ) : (
              chapters.map(ch => {
                // Mount imediato: chapter do deep-link (initialRef) ou do bookmark salvo.
                const initialChapterOrder = initialRef
                  ? Number(initialRef.split(':')[0])
                  : (progress?.last_chapter_order ?? null);
                const forceMount =
                  (initialChapterOrder != null && ch.order === initialChapterOrder) ||
                  isChapterMountRequested(ch.order);
                return (
                <LazyChapter key={ch.id} chapterId={ch.id} forceMount={forceMount} estimatedHeight={Math.max(400, ch.blocks.length * 60)}>
                  <ChapterSection
                    chapter={ch}
                    fontPx={fontPx}
                    bookmarkedRef={progress?.last_ref ?? null}
                    totalChapters={chapters.length}
                    onBookmark={ref => saveBookmark(ref, ch.order, chapters.length)}
                    onActiveRef={ref => setActiveRef(ch.order, ref)}
                    registerRef={el => registerChapterRef(ch.order, el)}
                    highlightsForRef={highlightsForRef}
                    commentsForRef={commentsForRef}
                    tagsForRef={tagsForRef}
                    onAddHighlight={addHighlight}
                    onRemoveHighlight={removeHighlight}
                    onAddTag={(chapterOrder, text, color, ref) => addTag(chapterOrder, text, color, ref)}
                    onRemoveTag={removeTag}
                    onOpenComment={setCommentTarget}
                  />
                </LazyChapter>
                );
              })
            )}

            {truncated && visibleUntil && <BookSpoilerVeil visibleUntil={visibleUntil} />}

            {!truncated && chapters.length > 0 && (
              <CompletionBlock
                readPercent={readPercent}
                progress={progress}
                chapters={chapters}
                completing={completing}
                onComplete={handleComplete}
                onReread={() => completeReading(chapters[chapters.length - 1]?.order ?? 1)}
              />
            )}
          </div>
        </main>
      </div>

      <MobileBottomBar
        fontLevel={fontLevel}
        readPercent={readPercent}
        progress={progress}
        chapters={chapters}
        changeFontLevel={changeFontLevel}
        onOpenDrawer={() => setDrawerOpen(true)}
        onContinue={continueSaved}
      />

      {commentTarget && (
        <CommentModal
          refLabel={commentTarget}
          comments={commentsForRef(commentTarget)}
          onAdd={text => addComment(commentTarget, text)}
          onUpdate={updateComment}
          onDelete={removeComment}
          onClose={() => setCommentTarget(null)}
        />
      )}

      {(bookmarkError || annotationError) && (
        <div className="fixed bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 z-50 alert alert-error shadow-lg max-w-sm text-sm py-2 px-4">
          <X className="w-4 h-4 shrink-0" />
          <span>{bookmarkError ?? annotationError}</span>
        </div>
      )}

      {showContinueModal && progress && (
        <ContinueModal
          progress={progress}
          chapters={chapters}
          onClose={() => setShowContinueModal(false)}
          onClearPosition={async () => {
            await saveBookmark(null, progress.last_chapter_order, chapters.length);
            setShowContinueModal(false);
          }}
          onContinue={() => { setShowContinueModal(false); continueSaved(); }}
        />
      )}

      {showExitGuard && (
        <ExitGuardModal
          readPercent={readPercent}
          chapterTitle={currentChapter?.title}
          chapterOrder={currentChapter?.order}
          currentRef={currentRef}
          lastBookmarkAt={progress?.last_bookmark_at}
          onClose={() => setShowExitGuard(false)}
          onExit={handleExit}
          onSaveAndExit={handleSaveAndExit}
        />
      )}

      {/* Footnote popup modal — clique no marcador <sup> exibe nota */}
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
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <RichContent
              markdown={footnoteModal.footnote.content}
              className="[&>div]:p-0 [&_p]:my-0 text-sm"
            />
            <div className="modal-action mt-4">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  // Vai para a nota no rodapé do capítulo (mantém o modal fechado)
                  setFootnoteModal(null);
                  setTimeout(() => {
                    const target = document.getElementById(`fn${footnoteModal.footnote.number}`);
                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 100);
                }}
              >
                Ver no rodapé do capítulo
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setFootnoteModal(null)}
              >
                Continuar lendo
              </button>
            </div>
          </div>
        </div>
      )}

      <ScrollToTopButton />
    </div>
  );
}
