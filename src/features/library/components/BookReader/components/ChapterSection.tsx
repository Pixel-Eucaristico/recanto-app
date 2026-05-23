'use client';

import { useMemo } from 'react';
import type { BookChapter, BookHighlight, BookComment, BookTag, HighlightColor, TagColor } from '@/domain/library/types';
import { BlockReader } from './BlockReader';
import { RichContent } from '@/shared/components/RichContent';
import { InlineMarkdown } from '@/shared/components/InlineMarkdown';

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
  onAddHighlight: (ref: string, color: HighlightColor, selectedText: string, occurrenceIndex?: number) => Promise<void>;
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
        <p className="text-xs uppercase tracking-wide text-base-content/50">{chapterKindLabel(chapter.kind, chapter.order)}</p>
        <h2 className="text-2xl md:text-3xl font-bold text-base-content mt-1">
          <InlineMarkdown markdown={chapter.title} />
        </h2>
        {chapter.subtitle && (
          <p className="text-sm md:text-base text-base-content/70 italic mt-1">
            <InlineMarkdown markdown={chapter.subtitle} />
          </p>
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
            footnotes={chapter.footnotes ?? []}
            onAddHighlight={(color, text, occ) => { if (b.ref) onAddHighlight(b.ref, color, text, occ); }}
            onRemoveHighlight={onRemoveHighlight}
            onAddTag={(text, color) => onAddTag(chapter.order, text, color, b.ref ?? undefined)}
            onRemoveTag={onRemoveTag}
            onOpenComment={() => { if (b.ref) onOpenComment(b.ref); }}
          />
        ))}
      </div>

      {/* Footnotes section — fim do capítulo */}
      {chapter.footnotes && chapter.footnotes.length > 0 && (
        <aside className="mt-8 pt-4 border-t border-base-300" aria-label="Notas de rodapé">
          <h3 className="text-sm font-semibold text-base-content/70 mb-3">Notas</h3>
          <ol className="space-y-2 text-sm">
            {[...chapter.footnotes].sort((a, b) => a.number - b.number).map(f => (
              <li
                key={f.id}
                id={`fn${f.number}`}
                className="scroll-mt-24 flex gap-2 items-start"
              >
                <sup className="text-primary font-semibold shrink-0 mt-0.5">{f.number}.</sup>
                <div className="flex-1 min-w-0">
                  <RichContent
                    markdown={f.content}
                    className="[&>div]:p-0 [&_p]:my-0 text-sm"
                  />
                </div>
              </li>
            ))}
          </ol>
        </aside>
      )}
    </section>
  );
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
