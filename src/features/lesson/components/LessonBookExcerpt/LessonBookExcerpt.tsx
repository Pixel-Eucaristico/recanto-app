'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ExternalLink, Quote } from 'lucide-react';
import type { LessonBookCitation } from '@/domain/formation/types';
import type { Book, BookBlock } from '@/domain/library/types';
import { libraryService } from '@/application/library/LibraryService';
import { BookEntity } from '@/domain/library/entities/Book';
import { RichContent } from '@/shared/components/RichContent';

interface LessonBookExcerptProps {
  citation: LessonBookCitation;
}

interface LoadedExcerpt {
  book: Book;
  blocks: Array<BookBlock & { chapter_order: number }>;
}

export function LessonBookExcerpt({ citation }: LessonBookExcerptProps) {
  const [data, setData] = useState<LoadedExcerpt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const blocks = BookEntity.sliceByRange(chapters, citation.start_ref, citation.end_ref);
        setData({ book, blocks });
      })
      .catch(e => !cancelled && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [citation.book_id, citation.start_ref, citation.end_ref]);

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

  const { book, blocks } = data;
  const startRef = citation.start_ref ?? '';
  const endRef = citation.end_ref ?? '';
  const rangeLabel = (startRef || endRef)
    ? `${startRef || 'início'} → ${endRef || 'fim'}`
    : 'completo';

  // Open the book reader at the start_ref
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

        {/* Optional formator note */}
        {citation.note && (
          <div className="alert alert-info text-sm py-2 gap-2">
            <Quote className="w-4 h-4" />
            <span className="italic">{citation.note}</span>
          </div>
        )}

        {/* Excerpt content */}
        {blocks.length === 0 ? (
          <p className="text-sm text-base-content/60 italic">Trecho vazio.</p>
        ) : (
          <div className="prose prose-sm max-w-none space-y-2 [&_*]:text-inherit">
            {blocks.map(b => (
              <ExcerptBlock key={b.id} block={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExcerptBlock({ block }: { block: BookBlock }) {
  const refBadge = block.ref ? (
    <span className="text-[10px] text-base-content/40 mr-1">[{block.ref}]</span>
  ) : null;

  switch (block.kind) {
    case 'paragraph':
      return (
        <p className="text-sm leading-relaxed">
          {refBadge}
          <RichContent markdown={block.content} className="inline" />
        </p>
      );
    case 'quote':
      return (
        <blockquote className="border-l-4 border-primary/30 pl-3 italic text-sm">
          {refBadge}
          <RichContent markdown={block.content} className="inline" />
        </blockquote>
      );
    case 'heading': {
      const lvl = Math.min(6, Math.max(2, block.heading_level ?? 2));
      const Tag = `h${lvl}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return <Tag className="font-semibold mt-3">{block.content}</Tag>;
    }
    case 'list':
      return (
        <div className="text-sm">
          <RichContent markdown={block.content} />
        </div>
      );
    case 'code':
      return (
        <pre className="bg-base-200 p-2 rounded text-xs overflow-x-auto">
          <code>{block.content}</code>
        </pre>
      );
    case 'image_ref': {
      const [url, ...captionParts] = (block.content ?? '').split('|');
      const caption = captionParts.join('|');
      if (!url) return null;
      return (
        <figure className="my-2">
          <img src={url} alt={caption} className="max-w-full rounded" />
          {caption && <figcaption className="text-xs text-base-content/60 mt-1 text-center">{caption}</figcaption>}
        </figure>
      );
    }
    default:
      return <p className="text-sm">{block.content}</p>;
  }
}
