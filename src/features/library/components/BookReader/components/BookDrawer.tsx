'use client';

import { X } from 'lucide-react';
import type { Book, BookChapter, BookComment, BookHighlight, BookTag, BookReadingProgress } from '@/domain/library/types';
import { BookTOC } from './BookTOC';
import { BookExportButtons } from '@/features/library/components/BookExportButtons';

interface BookDrawerProps {
  open: boolean;
  onClose: () => void;
  book: Book;
  chapters: BookChapter[];
  activeChapter: number | null;
  visibleUntil: string | null;
  truncated: boolean;
  readPercent: number;
  progress: BookReadingProgress | null;
  highlights: BookHighlight[];
  comments: BookComment[];
  tags: BookTag[];
  tagsForChapter: (chapterOrder: number) => BookTag[];
  onJump: (order: number) => void;
  onJumpToHeading: (chapterOrder: number, blockId: string) => void;
  onJumpToRef: () => void;
  onJumpToQuickRef: (ref: string) => void;
}

export function BookDrawer({
  open, onClose, book, chapters, activeChapter, visibleUntil, truncated,
  readPercent, progress, highlights, comments, tags, tagsForChapter, onJump, onJumpToHeading, onJumpToRef, onJumpToQuickRef,
}: BookDrawerProps) {
  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-40 flex">
      <div className="bg-base-100 w-80 max-w-[88vw] h-dvh overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-3 py-2 border-b border-base-300 sticky top-0 bg-base-100 z-10">
          <span className="text-sm font-semibold">Sumário</span>
          <div className="flex items-center gap-1">
            <BookExportButtons
              bookId={book.id}
              bookTitle={book.title}
              truncated={truncated}
              visibleUntil={visibleUntil}
            />
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle"
              onClick={onClose}
              aria-label="Fechar sumário"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <BookTOC
          book={book}
          chapters={chapters}
          activeChapter={activeChapter}
          visibleUntil={visibleUntil}
          readPercent={readPercent}
          lastChapterOrder={progress?.last_chapter_order ?? null}
          lastRef={progress?.last_ref ?? null}
          lastBookmarkAt={progress?.last_bookmark_at ?? null}
          highlights={highlights}
          comments={comments}
          tags={tags}
          onJump={onJump}
          onJumpToHeading={onJumpToHeading}
          onJumpToQuickRef={onJumpToQuickRef}
        />
      </div>
      <div className="flex-1 bg-black/40" onClick={onClose} />
    </div>
  );
}
