'use client';

import { ArrowLeft, Menu, Type } from 'lucide-react';
import type { Book } from '@/domain/library/types';
import { Tooltip } from '@/shared/components/Tooltip';
import { BookExportButtons } from '@/features/library/components/BookExportButtons';

interface BookReaderHeaderProps {
  book: Book;
  fontLevel: number;
  fontPx: number;
  readPercent: number;
  truncated: boolean;
  visibleUntil: string | null;
  changeFontLevel: (v: number) => void;
  onBack: () => void;
  onOpenDrawer: () => void;
}

export function BookReaderHeader({
  book, fontLevel, fontPx, readPercent, truncated, visibleUntil, changeFontLevel, onBack, onOpenDrawer,
}: BookReaderHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-base-100/95 backdrop-blur border-b border-base-300">
      <div className="h-0.5 bg-primary transition-all duration-500" style={{ width: `${readPercent}%` }} />
      <div className="flex items-center gap-2 px-3 md:px-6 py-2 min-w-0">
        <Tooltip tip="Voltar à biblioteca" position="bottom">
          <button type="button" className="btn btn-ghost btn-sm btn-circle shrink-0" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Tooltip>
        <Tooltip tip="Índice do livro" position="bottom">
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-circle shrink-0"
            onClick={onOpenDrawer}
            aria-label="Abrir índice"
          >
            <Menu className="w-4 h-4" />
          </button>
        </Tooltip>
        <div className="flex-1 min-w-0 overflow-hidden">
          <h1 className="text-sm md:text-base font-semibold text-base-content truncate">{book.title}</h1>
          {book.author && <p className="text-[11px] text-base-content/60 truncate">{book.author}</p>}
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <Tooltip tip="Fonte menor" position="bottom">
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle min-h-0 h-7 w-7 disabled:opacity-30"
              onClick={() => changeFontLevel(fontLevel - 1)}
              disabled={fontLevel === 0}
              aria-label="Fonte menor"
            >
              <Type className="w-3 h-3" />
            </button>
          </Tooltip>
          <Tooltip tip={`Fonte: ${fontPx}px`} position="bottom">
            <input
              type="range"
              min={0}
              max={35}
              step={1}
              value={fontLevel}
              onChange={e => changeFontLevel(Number(e.target.value))}
              className="range range-xs range-primary w-16 md:w-24"
              aria-label="Tamanho da fonte"
            />
          </Tooltip>
          <Tooltip tip="Fonte maior" position="bottom">
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle min-h-0 h-7 w-7 disabled:opacity-30"
              onClick={() => changeFontLevel(fontLevel + 1)}
              disabled={fontLevel === 35}
              aria-label="Fonte maior"
            >
              <Type className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>

        <div className="hidden md:flex shrink-0">
          <BookExportButtons
            bookId={book.id}
            bookTitle={book.title}
            truncated={truncated}
            visibleUntil={visibleUntil}
          />
        </div>

        {readPercent > 0 && (
          <span className="text-[10px] text-base-content/50 hidden md:inline whitespace-nowrap shrink-0">
            {readPercent}%
          </span>
        )}
      </div>
    </header>
  );
}
