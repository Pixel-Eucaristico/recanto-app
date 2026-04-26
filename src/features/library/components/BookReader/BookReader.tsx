'use client';

import { BookOpen, X } from 'lucide-react';
import type { Book, BookChapter } from '@/domain/library/types';
import { BookSpoilerVeil } from '@/features/library/components/BookSpoilerVeil';
import { CommentModal } from '@/shared/components/CommentModal';
import { BookReaderHeader } from './components/BookReaderHeader';
import { ContinueBanner } from './components/ContinueBanner';
import { BookTOC } from './components/BookTOC';
import { BookDrawer } from './components/BookDrawer';
import { ChapterSection } from './components/ChapterSection';
import { CompletionBlock } from './components/CompletionBlock';
import { MobileBottomBar } from './components/MobileBottomBar';
import { ContinueModal } from './components/ContinueModal';
import { ExitGuardModal } from './components/ExitGuardModal';
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
    handleBack,
    handleComplete,
    handleExit,
    handleSaveAndExit,
    registerChapterRef,
    setActiveRef,
  } = useBookReader({ userId, bookId: book.id, chapters, initialRef });

  return (
    <div className="min-h-screen bg-base-200">
      <BookReaderHeader
        book={book}
        fontLevel={fontLevel}
        fontPx={fontPx}
        readPercent={readPercent}
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
        <aside className="hidden lg:block w-72 shrink-0 border-r border-base-300 bg-base-100 sticky top-[49px] self-start">
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
              chapters.map(ch => (
                <ChapterSection
                  key={ch.id}
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
              ))
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
          onClose={() => setShowExitGuard(false)}
          onExit={handleExit}
          onSaveAndExit={handleSaveAndExit}
        />
      )}
    </div>
  );
}
