'use client';

import { X } from 'lucide-react';
import type { Book, BookChapter, BookTag, BookReadingProgress } from '@/domain/library/types';
import { BookTOC } from './BookTOC';

interface BookDrawerProps {
  open: boolean;
  onClose: () => void;
  book: Book;
  chapters: BookChapter[];
  activeChapter: number | null;
  visibleUntil: string | null;
  readPercent: number;
  progress: BookReadingProgress | null;
  tags: BookTag[];
  tagsForChapter: (chapterOrder: number) => BookTag[];
  onJump: (order: number) => void;
  onJumpToRef: () => void;
}

export function BookDrawer({
  open, onClose, book, chapters, activeChapter, visibleUntil,
  readPercent, progress, tags, tagsForChapter, onJump, onJumpToRef,
}: BookDrawerProps) {
  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-40 flex">
      <div className="bg-base-100 w-72 max-w-[85vw] h-full overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-3 py-2 border-b border-base-300 sticky top-0 bg-base-100 z-10">
          <span className="text-sm font-semibold">Sumário</span>
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-circle"
            onClick={onClose}
            aria-label="Fechar sumário"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
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
          onJump={onJump}
          onJumpToRef={onJumpToRef}
        />
      </div>
      <div className="flex-1 bg-black/40" onClick={onClose} />
    </div>
  );
}
