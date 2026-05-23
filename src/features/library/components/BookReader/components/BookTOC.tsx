'use client';

import Image from 'next/image';
import { Bookmark, BookOpen, Highlighter, MessageSquare, Navigation, Tag } from 'lucide-react';
import type { Book, BookBlock, BookChapter, BookComment, BookHighlight, BookTag } from '@/domain/library/types';
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
  lastBookmarkAt: string | null;
  highlights: BookHighlight[];
  comments: BookComment[];
  tags: BookTag[];
  onJump: (order: number) => void;
  onJumpToHeading: (chapterOrder: number, blockId: string) => void;
  onJumpToQuickRef: (ref: string) => void;
}

export function BookTOC({
  book, chapters, activeChapter, visibleUntil, readPercent,
  lastChapterOrder, lastRef, lastBookmarkAt, highlights, comments, tags,
  onJump, onJumpToHeading, onJumpToQuickRef,
}: BookTOCProps) {
  const menuItems = buildMenuItems({
    chapters,
    activeChapter,
    lastChapterOrder,
    lastRef,
    lastBookmarkAt,
    highlights,
    comments,
    tags,
    onJump,
    onJumpToHeading,
    onJumpToQuickRef,
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
  lastBookmarkAt: string | null;
  highlights: BookHighlight[];
  comments: BookComment[];
  tags: BookTag[];
  onJump: (order: number) => void;
  onJumpToHeading: (chapterOrder: number, blockId: string) => void;
  onJumpToQuickRef: (ref: string) => void;
}

interface HeadingNode {
  block: BookBlock;
  blockIndex: number;
  endIndex: number;
  children: HeadingNode[];
}

interface QuickMark {
  ref?: string;
  chapterOrder: number;
  blockIndex: number | null;
  label: string;
  detail?: string;
  icon: 'history' | 'bookmark' | 'highlight' | 'comment' | 'tag';
  className?: string;
}

function buildMenuItems({
  chapters,
  activeChapter,
  lastChapterOrder,
  lastRef,
  lastBookmarkAt,
  highlights,
  comments,
  tags,
  onJump,
  onJumpToHeading,
  onJumpToQuickRef,
}: BuildMenuItemsOptions): AccordionMenuItem[] {
  const items: AccordionMenuItem[] = [];

  items.push({
    type: 'parent',
    label: <span className="text-xs font-bold uppercase text-base-content">Capítulos</span>,
    icon: <BookOpen className="h-4 w-4 shrink-0 opacity-70" />,
    defaultOpen: false,
    children: chapters.length > 0
      ? chapters.map(ch => buildChapterItem({
        chapter: ch,
        activeChapter,
        lastChapterOrder,
        quickMarks: buildQuickMarksForChapter(ch, {
          lastRef,
          lastBookmarkAt,
          highlights,
          comments,
          tags,
        }),
        onJump,
        onJumpToHeading,
        onJumpToQuickRef,
      }))
      : [{ label: <span className="text-xs text-base-content/50">Sem capítulos.</span>, disabled: true }],
  });

  return items;
}

function buildChapterItem({
  chapter,
  activeChapter,
  lastChapterOrder,
  quickMarks,
  onJump,
  onJumpToHeading,
  onJumpToQuickRef,
}: {
  chapter: BookChapter;
  activeChapter: number | null;
  lastChapterOrder: number | null;
  quickMarks: QuickMark[];
  onJump: (order: number) => void;
  onJumpToHeading: (chapterOrder: number, blockId: string) => void;
  onJumpToQuickRef: (ref: string) => void;
}): AccordionMenuItem {
  const isLast = lastChapterOrder === chapter.order;
  const headingTree = buildHeadingTree(chapter.blocks);
  const chapterQuickMarks = quickMarks.filter(mark => mark.blockIndex === null || !isInsideAnyHeading(mark, headingTree));
  const quickMarkCount = quickMarks.length;
  const chapterLabel = (
    <span className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 text-[10px] text-base-content/50">{chapter.order}.</span>
        <MarkdownLabel markdown={chapter.title} className="min-w-0 flex-1 truncate" />
      {isLast && activeChapter !== chapter.order && (
        <Bookmark className="h-3 w-3 shrink-0 text-info" aria-label="Última posição salva" />
      )}
      {quickMarkCount > 0 && (
        <span className="shrink-0 rounded-full bg-info px-1 text-[9px] text-info-content">
          {quickMarkCount}
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
        ...chapterQuickMarks.map(mark => buildQuickMarkItem(mark, onJumpToQuickRef)),
        ...headingTree.map(node => buildHeadingItem(chapter.order, node, quickMarks, onJumpToHeading, onJumpToQuickRef)),
      ],
    };
  }

  if (quickMarks.length > 0) {
    return {
      type: 'parent',
      label: chapterLabel,
      defaultOpen: false,
      className: activeChapter === chapter.order ? 'menu-active' : undefined,
      children: [
        { label: <span className="text-xs text-base-content/70">Início do capítulo</span>, onClick: () => onJump(chapter.order) },
        ...quickMarks.map(mark => buildQuickMarkItem(mark, onJumpToQuickRef)),
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
  quickMarks: QuickMark[],
  onJumpToHeading: (chapterOrder: number, blockId: string) => void,
  onJumpToQuickRef: (ref: string) => void,
): AccordionMenuItem {
  const { block } = node;
  const level = Math.min(6, Math.max(1, block.heading_level ?? 2));
  const nodeQuickMarks = quickMarks.filter(mark => isInsideHeading(mark, node) && !node.children.some(child => isInsideHeading(mark, child)));
  const quickMarkCount = quickMarks.filter(mark => isInsideHeading(mark, node)).length;
  const label = (
    <span className="flex min-w-0 items-center gap-1 text-xs" style={{ paddingLeft: `${Math.max(0, level - 1) * 8}px` }}>
      <MarkdownLabel markdown={block.content} className="min-w-0 flex-1 truncate" />
      {quickMarkCount > 0 && (
        <span className="shrink-0 rounded-full bg-info px-1 text-[9px] text-info-content">
          {quickMarkCount}
        </span>
      )}
    </span>
  );

  if (node.children.length > 0 || nodeQuickMarks.length > 0) {
    return {
      type: 'parent',
      label,
      defaultOpen: false,
      children: [
        {
          label: <span className="text-xs text-base-content/70">Ir para este tópico</span>,
          onClick: () => onJumpToHeading(chapterOrder, block.id),
        },
        ...nodeQuickMarks.map(mark => buildQuickMarkItem(mark, onJumpToQuickRef)),
        ...node.children.map(child => buildHeadingItem(chapterOrder, child, quickMarks, onJumpToHeading, onJumpToQuickRef)),
      ],
    };
  }

  return {
    label,
    onClick: () => onJumpToHeading(chapterOrder, block.id),
  };
}

function buildQuickMarkItem(mark: QuickMark, onJumpToQuickRef: (ref: string) => void): AccordionMenuItem {
  return {
    label: (
      <span className="block min-w-0">
        <span className="block truncate text-xs font-medium">{mark.label}</span>
        {mark.detail && <span className="block truncate text-[10px] text-base-content/60">{mark.detail}</span>}
      </span>
    ),
    icon: quickMarkIcon(mark.icon),
    disabled: !mark.ref,
    onClick: mark.ref ? () => onJumpToQuickRef(mark.ref as string) : undefined,
    className: mark.className,
  };
}

function quickMarkIcon(icon: QuickMark['icon']) {
  const className = 'h-3.5 w-3.5 shrink-0';
  switch (icon) {
    case 'history': return <Navigation className={`${className} text-info`} />;
    case 'bookmark': return <Bookmark className={`${className} text-warning`} />;
    case 'highlight': return <Highlighter className={`${className} text-accent`} />;
    case 'comment': return <MessageSquare className={`${className} text-primary`} />;
    case 'tag': return <Tag className={`${className} text-secondary`} />;
  }
}

function buildHeadingTree(blocks: BookBlock[]): HeadingNode[] {
  const roots: HeadingNode[] = [];
  const stack: Array<{ level: number; node: HeadingNode }> = [];

  blocks.forEach((block, blockIndex) => {
    if (block.kind !== 'heading' || block.content.trim().length === 0) return;
    const level = Math.min(6, Math.max(1, block.heading_level ?? 2));
    const node: HeadingNode = { block, blockIndex, endIndex: blocks.length, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      const closed = stack.pop();
      if (closed) closed.node.endIndex = blockIndex;
    }

    const parent = stack[stack.length - 1]?.node;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }

    stack.push({ level, node });
  });

  return roots;
}

function buildQuickMarksForChapter(
  chapter: BookChapter,
  sources: {
    lastRef: string | null;
    lastBookmarkAt: string | null;
    highlights: BookHighlight[];
    comments: BookComment[];
    tags: BookTag[];
  },
): QuickMark[] {
  const refToBlockIndex = new Map<string, number>();
  chapter.blocks.forEach((block, index) => {
    if (block.ref) refToBlockIndex.set(block.ref, index);
  });

  const marks: QuickMark[] = [];

  if (sources.lastRef && refBelongsToChapter(sources.lastRef, chapter.order)) {
    marks.push({
      ref: sources.lastRef,
      chapterOrder: chapter.order,
      blockIndex: refToBlockIndex.get(sources.lastRef) ?? null,
      label: 'Última leitura',
      detail: `ref. ${sources.lastRef}`,
      icon: 'history',
      className: 'bg-info/10 hover:bg-info/20',
    });
    if (sources.lastBookmarkAt) {
      marks.push({
        ref: sources.lastRef,
        chapterOrder: chapter.order,
        blockIndex: refToBlockIndex.get(sources.lastRef) ?? null,
        label: 'Marcador salvo',
        detail: `ref. ${sources.lastRef}`,
        icon: 'bookmark',
        className: 'bg-warning/10 hover:bg-warning/20',
      });
    }
  }

  const highlightsByRef = groupByRef(sources.highlights.filter(h => refBelongsToChapter(h.ref, chapter.order)));
  for (const [ref, items] of highlightsByRef) {
    marks.push({
      ref,
      chapterOrder: chapter.order,
      blockIndex: refToBlockIndex.get(ref) ?? null,
      label: items.length === 1 ? 'Destaque' : `${items.length} destaques`,
      detail: firstSelectedText(items),
      icon: 'highlight',
    });
  }

  const commentsByRef = groupByRef(sources.comments.filter(c => refBelongsToChapter(c.ref, chapter.order)));
  for (const [ref, items] of commentsByRef) {
    marks.push({
      ref,
      chapterOrder: chapter.order,
      blockIndex: refToBlockIndex.get(ref) ?? null,
      label: items.length === 1 ? 'Nota' : `${items.length} notas`,
      detail: items[0]?.text,
      icon: 'comment',
    });
  }

  for (const tag of sources.tags.filter(t => t.chapter_order === chapter.order)) {
    marks.push({
      ref: tag.ref,
      chapterOrder: chapter.order,
      blockIndex: tag.ref ? (refToBlockIndex.get(tag.ref) ?? null) : null,
      label: tag.text,
      detail: tag.ref ? `Marcador em ${tag.ref}` : 'Marcador do capítulo',
      icon: 'tag',
    });
  }

  return marks.sort((a, b) => (a.blockIndex ?? -1) - (b.blockIndex ?? -1));
}

function groupByRef<T extends { ref: string }>(items: T[]): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    map.set(item.ref, [...(map.get(item.ref) ?? []), item]);
  }
  return map;
}

function firstSelectedText(items: BookHighlight[]): string | undefined {
  return items.find(item => item.selected_text)?.selected_text;
}

function refBelongsToChapter(ref: string, chapterOrder: number): boolean {
  return Number(ref.split(':')[0]) === chapterOrder;
}

function isInsideHeading(mark: QuickMark, node: HeadingNode): boolean {
  return mark.blockIndex !== null && mark.blockIndex > node.blockIndex && mark.blockIndex < node.endIndex;
}

function isInsideAnyHeading(mark: QuickMark, nodes: HeadingNode[]): boolean {
  return nodes.some(node => isInsideHeading(mark, node) || isInsideAnyHeading(mark, node.children));
}

function MarkdownLabel({ markdown, className = '' }: { markdown: string; className?: string }) {
  return (
    <span className={`block min-w-0 ${className}`}>
      <InlineMarkdown markdown={markdown} />
    </span>
  );
}
