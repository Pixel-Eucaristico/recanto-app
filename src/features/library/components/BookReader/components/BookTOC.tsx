'use client';

import Image from 'next/image';
import { Bookmark, BookOpen, Navigation } from 'lucide-react';
import type { Book, BookBlock, BookChapter, BookTag } from '@/domain/library/types';
import { AccordionMenu, type AccordionMenuItem } from '@/shared/components/AccordionMenu';
import { InlineMarkdown } from '@/shared/components/InlineMarkdown';

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
  onJumpToHeading: (chapterOrder: number, blockId: string) => void;
  onJumpToRef: () => void;
}

export function BookTOC({
  book, chapters, activeChapter, visibleUntil, readPercent,
  lastChapterOrder, lastRef, tagsForChapter, onJump, onJumpToHeading, onJumpToRef,
}: BookTOCProps) {
  const menuItems = buildMenuItems({
    chapters,
    activeChapter,
    lastChapterOrder,
    lastRef,
    tagsForChapter,
    onJump,
    onJumpToHeading,
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
          accordion={false}
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
  onJumpToHeading: (chapterOrder: number, blockId: string) => void;
  onJumpToRef: () => void;
}

interface HeadingNode {
  block: BookBlock;
  children: HeadingNode[];
}

function buildMenuItems({
  chapters,
  activeChapter,
  lastChapterOrder,
  lastRef,
  tagsForChapter,
  onJump,
  onJumpToHeading,
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
    label: <span className="text-xs font-bold uppercase text-base-content">Capítulos</span>,
    icon: <BookOpen className="h-4 w-4 shrink-0 opacity-70" />,
    defaultOpen: false,
    children: chapters.length > 0
      ? chapters.map(ch => buildChapterItem(ch, activeChapter, lastChapterOrder, tagsForChapter, onJump, onJumpToHeading))
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
  onJumpToHeading: (chapterOrder: number, blockId: string) => void,
): AccordionMenuItem {
  const isLast = lastChapterOrder === chapter.order;
  const chapterTags = tagsForChapter(chapter.order);
  const headingTree = buildHeadingTree(getHeadingBlocks(chapter));
  const chapterLabel = (
    <span className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 text-[10px] text-base-content/50">{chapter.order}.</span>
        <MarkdownLabel markdown={chapter.title} className="min-w-0 flex-1 truncate" />
      {isLast && activeChapter !== chapter.order && (
        <Bookmark className="h-3 w-3 shrink-0 text-info" aria-label="Última posição salva" />
      )}
      {chapterTags.length > 0 && (
        <span className="shrink-0 rounded-full bg-secondary px-1 text-[9px] text-secondary-content">
          {chapterTags.length}
        </span>
      )}
    </span>
  );

  if (headingTree.length > 0) {
    return {
      type: 'parent',
      label: chapterLabel,
      defaultOpen: false,
      className: activeChapter === chapter.order ? 'menu-active' : undefined,
      children: [
        {
          label: <span className="text-xs text-base-content/70">Início do capítulo</span>,
          onClick: () => onJump(chapter.order),
        },
        ...headingTree.map(node => buildHeadingItem(chapter.order, node, onJumpToHeading)),
      ],
    };
  }

  return {
    label: chapterLabel,
    active: activeChapter === chapter.order,
    onClick: () => onJump(chapter.order),
  };
}

function buildHeadingItem(
  chapterOrder: number,
  node: HeadingNode,
  onJumpToHeading: (chapterOrder: number, blockId: string) => void,
): AccordionMenuItem {
  const { block } = node;
  const level = Math.min(6, Math.max(1, block.heading_level ?? 2));
  const label = (
    <span className="block min-w-0 text-xs" style={{ paddingLeft: `${Math.max(0, level - 1) * 8}px` }}>
      <MarkdownLabel markdown={block.content} className="truncate" />
    </span>
  );

  if (node.children.length > 0) {
    return {
      type: 'parent',
      label,
      defaultOpen: false,
      children: [
        {
          label: <span className="text-xs text-base-content/70">Ir para este tópico</span>,
          onClick: () => onJumpToHeading(chapterOrder, block.id),
        },
        ...node.children.map(child => buildHeadingItem(chapterOrder, child, onJumpToHeading)),
      ],
    };
  }

  return {
    label,
    onClick: () => onJumpToHeading(chapterOrder, block.id),
  };
}

function getHeadingBlocks(chapter: BookChapter): BookBlock[] {
  return chapter.blocks.filter(block => block.kind === 'heading' && block.content.trim().length > 0);
}

function buildHeadingTree(blocks: BookBlock[]): HeadingNode[] {
  const roots: HeadingNode[] = [];
  const stack: Array<{ level: number; node: HeadingNode }> = [];

  for (const block of blocks) {
    const level = Math.min(6, Math.max(1, block.heading_level ?? 2));
    const node: HeadingNode = { block, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    const parent = stack[stack.length - 1]?.node;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }

    stack.push({ level, node });
  }

  return roots;
}

function MarkdownLabel({ markdown, className = '' }: { markdown: string; className?: string }) {
  return (
    <span className={`block min-w-0 ${className}`}>
      <InlineMarkdown markdown={markdown} />
    </span>
  );
}
