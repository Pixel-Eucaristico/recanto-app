'use client';

import { useMemo } from 'react';
import type { BookChapter, BookHighlight, BookComment, BookTag, HighlightColor, TagColor } from '@/domain/library/types';
import { BlockReader } from './BlockReader';

interface ChapterSectionProps {
  chapter: BookChapter;
  fontPx: number;
  bookmarkedRef: string | null;
  totalChapters: number;
  onBookmark: (ref: string | null) => void;
  onActiveRef: (ref: string) => void;
  registerRef: (el: HTMLElement | null) => void;
  highlightsForRef: (ref: string) => BookHighlight[];
  commentsForRef: (ref: string) => BookComment[];
  tagsForRef: (ref: string) => BookTag[];
  onAddHighlight: (ref: string, color: HighlightColor, selectedText: string) => Promise<void>;
  onRemoveHighlight: (id: string) => Promise<void>;
  onAddTag: (chapterOrder: number, text: string, color: TagColor, ref?: string) => Promise<void>;
  onRemoveTag: (id: string) => Promise<void>;
  onOpenComment: (ref: string) => void;
}

export function ChapterSection({
  chapter, fontPx, bookmarkedRef, onBookmark, onActiveRef, registerRef,
  highlightsForRef, commentsForRef, tagsForRef,
  onAddHighlight, onRemoveHighlight, onAddTag, onRemoveTag, onOpenComment,
}: ChapterSectionProps) {
  const blocks = useMemo(() => chapter.blocks, [chapter.blocks]);

  return (
    <section
      ref={registerRef}
      data-chapter-order={chapter.order}
      id={`chapter-${chapter.order}`}
      className="scroll-mt-24"
    >
      <header className="mb-4 pb-3 border-b border-base-300">
        <p className="text-xs uppercase tracking-wide text-base-content/50">Capítulo {chapter.order}</p>
        <h2 className="text-2xl md:text-3xl font-bold text-base-content mt-1">{chapter.title}</h2>
        {chapter.subtitle && (
          <p className="text-sm md:text-base text-base-content/70 italic mt-1">{chapter.subtitle}</p>
        )}
      </header>
      <div className="space-y-3">
        {blocks.map(b => (
          <BlockReader
            key={b.id}
            block={b}
            chapter={chapter.order}
            fontPx={fontPx}
            isBookmarked={b.ref != null && b.ref === bookmarkedRef}
            onBookmark={() => onBookmark(b.ref === bookmarkedRef ? null : (b.ref ?? null))}
            onVisible={() => { if (b.ref) onActiveRef(b.ref); }}
            blockHighlights={b.ref ? highlightsForRef(b.ref) : []}
            commentCount={b.ref ? commentsForRef(b.ref).length : 0}
            blockTags={b.ref ? tagsForRef(b.ref) : []}
            onAddHighlight={(color, text) => { if (b.ref) onAddHighlight(b.ref, color, text); }}
            onRemoveHighlight={onRemoveHighlight}
            onAddTag={(text, color) => onAddTag(chapter.order, text, color, b.ref ?? undefined)}
            onRemoveTag={onRemoveTag}
            onOpenComment={() => { if (b.ref) onOpenComment(b.ref); }}
          />
        ))}
      </div>
    </section>
  );
}
