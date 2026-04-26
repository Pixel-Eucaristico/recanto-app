'use client';

import Image from 'next/image';
import { ChevronRight, Bookmark, Navigation } from 'lucide-react';
import type { Book, BookChapter, BookTag } from '@/domain/library/types';
import { tagBadgeConfig } from '../utils/constants';

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

      {(lastRef || lastChapterOrder) && (
        <button
          type="button"
          onClick={onJumpToRef}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-info/15 border border-info/30 hover:bg-info/25 transition-colors text-left"
        >
          <Navigation className="w-4 h-4 text-info shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-info">Continuar leitura</p>
            <p className="text-[10px] text-base-content/60 truncate">
              {lastRef ? `ref. ${lastRef}` : lastChapterOrder ? `Cap. ${lastChapterOrder}` : ''}
            </p>
          </div>
        </button>
      )}

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

      <nav className="space-y-0.5">
        <p className="text-[10px] uppercase tracking-wide text-base-content/50 px-2 mb-1">Capítulos</p>
        {chapters.length === 0 && <p className="text-xs text-base-content/40 px-2">Sem capítulos.</p>}
        {chapters.map(ch => {
          const isActive = activeChapter === ch.order;
          const isLast = lastChapterOrder === ch.order;
          const chTags = tagsForChapter(ch.order);
          return (
            <div key={ch.id}>
              <button
                type="button"
                onClick={() => onJump(ch.order)}
                className={`w-full text-left px-2 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${
                  isActive ? 'bg-primary/15 text-primary font-semibold' : 'text-base-content hover:bg-base-200'
                }`}
              >
                <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />
                <span className="flex-1 truncate">
                  <span className="text-[10px] text-base-content/50 mr-1">{ch.order}.</span>
                  {ch.title}
                </span>
                {isLast && !isActive && (
                  <Bookmark className="w-3 h-3 text-info shrink-0" title="Última posição salva" />
                )}
                {chTags.length > 0 && (
                  <span className="text-[9px] bg-secondary text-secondary-content rounded-full px-1 shrink-0">
                    {chTags.length}
                  </span>
                )}
              </button>
              {chTags.length > 0 && (
                <div className="pl-6 pb-1 flex flex-wrap gap-1">
                  {chTags.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => { if (t.ref) onJump(ch.order); }}
                      className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${tagBadgeConfig[t.color]}`}
                      title={t.ref ? `ref. ${t.ref}` : `Cap. ${ch.order}`}
                    >
                      {t.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
