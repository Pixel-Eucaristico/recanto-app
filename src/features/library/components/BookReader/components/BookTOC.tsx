'use client';

import Image from 'next/image';
import { Bookmark, BookOpen, Navigation } from 'lucide-react';
import type { Book, BookChapter, BookTag } from '@/domain/library/types';
import { AccordionMenu, type AccordionMenuItem } from '@/shared/components/AccordionMenu';

interface BookTOCProps {
  book: Book;
  chapters: BookChapter[];
  activeChapter: number | null;
  visibleUntil: string | null;
  readPercent: number;
  lastChapterOrder: number | null;
  lastRef: string | null;
  tags: BookTag[];
  tagsForChapter: (chapterOrder: number) => BookTag[];
  onJump: (order: number) => void;
  onJumpToRef: () => void;
}

export function BookTOC({
  book, chapters, activeChapter, visibleUntil, readPercent,
  lastChapterOrder, lastRef, tagsForChapter, onJump, onJumpToRef,
}: BookTOCProps) {
  const menuItems = buildMenuItems({
    chapters,
    activeChapter,
    lastChapterOrder,
    lastRef,
    tagsForChapter,
    onJump,
    onJumpToRef,
  });

  return (
    <div className="p-3 space-y-3">
      {book.cover_url && (
        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-base-200 relative">
          <Image src={book.cover_url} alt={book.title} fill className="object-cover" sizes="288px" />
        </div>
      )}
      <div>
        <h2 className="text-sm font-bold text-base-content leading-snug">{book.title}</h2>
        {book.subtitle && <p className="text-xs text-base-content/60 mt-0.5">{book.subtitle}</p>}
        {book.author && <p className="text-xs text-base-content/60 mt-1">{book.author}</p>}
      </div>

      {readPercent > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-base-content/50">
            <span>Progresso</span><span>{readPercent}%</span>
          </div>
          <div className="h-1.5 bg-base-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${readPercent}%` }} />
          </div>
        </div>
      )}

      {visibleUntil && (
        <div className="alert alert-warning text-xs py-2 px-3">
          <span>Disponível até {visibleUntil}</span>
        </div>
      )}

      <nav aria-label="Sumário do livro">
        <AccordionMenu
          items={menuItems}
          size="sm"
          width="w-full"
          background="bg-base-200"
          className="max-w-none"
        />
      </nav>
    </div>
  );
}

interface BuildMenuItemsOptions {
  chapters: BookChapter[];
  activeChapter: number | null;
  lastChapterOrder: number | null;
  lastRef: string | null;
  tagsForChapter: (chapterOrder: number) => BookTag[];
  onJump: (order: number) => void;
  onJumpToRef: () => void;
}

function buildMenuItems({
  chapters,
  activeChapter,
  lastChapterOrder,
  lastRef,
  tagsForChapter,
  onJump,
  onJumpToRef,
}: BuildMenuItemsOptions): AccordionMenuItem[] {
  const items: AccordionMenuItem[] = [];

  if (lastRef || lastChapterOrder) {
    items.push({
      label: (
        <span className="block min-w-0">
          <span className="block text-xs font-semibold text-info">Continuar leitura</span>
          <span className="block truncate text-[10px] text-base-content/60">
            {lastRef ? `ref. ${lastRef}` : `Cap. ${lastChapterOrder}`}
          </span>
        </span>
      ),
      icon: <Navigation className="h-4 w-4 shrink-0 text-info" />,
      onClick: onJumpToRef,
      className: 'bg-info/15 hover:bg-info/25',
    });
  }

  items.push({
    type: 'parent',
    label: <span className="text-xs font-semibold uppercase text-base-content/70">Capítulos</span>,
    icon: <BookOpen className="h-4 w-4 shrink-0 opacity-70" />,
    defaultOpen: true,
    children: chapters.length > 0
      ? chapters.map(ch => buildChapterItem(ch, activeChapter, lastChapterOrder, tagsForChapter, onJump))
      : [{ label: <span className="text-xs text-base-content/50">Sem capítulos.</span>, disabled: true }],
  });

  return items;
}

function buildChapterItem(
  chapter: BookChapter,
  activeChapter: number | null,
  lastChapterOrder: number | null,
  tagsForChapter: (chapterOrder: number) => BookTag[],
  onJump: (order: number) => void,
): AccordionMenuItem {
  const isLast = lastChapterOrder === chapter.order;
  const chapterTags = tagsForChapter(chapter.order);

  return {
    label: (
      <span className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-[10px] text-base-content/50">{chapter.order}.</span>
        <span className="min-w-0 flex-1 truncate">{chapter.title}</span>
        {isLast && activeChapter !== chapter.order && (
          <Bookmark className="h-3 w-3 shrink-0 text-info" aria-label="Última posição salva" />
        )}
        {chapterTags.length > 0 && (
          <span className="shrink-0 rounded-full bg-secondary px-1 text-[9px] text-secondary-content">
            {chapterTags.length}
          </span>
        )}
      </span>
    ),
    active: activeChapter === chapter.order,
    onClick: () => onJump(chapter.order),
  };
}
