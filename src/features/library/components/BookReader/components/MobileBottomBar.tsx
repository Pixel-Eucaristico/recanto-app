'use client';

import { Menu, Bookmark, Type } from 'lucide-react';
import type { BookChapter, BookReadingProgress } from '@/domain/library/types';
import { Tooltip } from '@/shared/components/Tooltip';

interface MobileBottomBarProps {
  fontLevel: number;
  readPercent: number;
  progress: BookReadingProgress | null;
  chapters: BookChapter[];
  changeFontLevel: (v: number) => void;
  onOpenDrawer: () => void;
  onContinue: () => void;
}

export function MobileBottomBar({
  fontLevel, readPercent, progress, chapters, changeFontLevel, onOpenDrawer, onContinue,
}: MobileBottomBarProps) {
  const showContinue = progress && progress.last_chapter_order > (chapters[0]?.order ?? 1);

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-base-100/95 backdrop-blur border-t border-base-300 px-3 py-2">
      <div className="flex items-center gap-3">
        <Tooltip tip="Índice dos capítulos" position="top">
          <button
            type="button"
            className="btn btn-ghost btn-xs gap-1 shrink-0"
            onClick={onOpenDrawer}
          >
            <Menu className="w-4 h-4" />
            <span className="text-[11px]">Sumário</span>
          </button>
        </Tooltip>

        {showContinue && (
          <Tooltip tip="Ir para o último marcador" position="top">
            <button
              type="button"
              className="btn btn-ghost btn-xs gap-1 shrink-0 text-info"
              onClick={onContinue}
            >
              <Bookmark className="w-4 h-4" />
              <span className="text-[11px]">Continuar</span>
            </button>
          </Tooltip>
        )}

        <div className="flex items-center gap-0.5 flex-1 min-w-0">
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-circle min-h-0 h-6 w-6 shrink-0 disabled:opacity-30"
            onClick={() => changeFontLevel(fontLevel - 1)}
            disabled={fontLevel === 0}
          >
            <Type className="w-3 h-3" />
          </button>
          <input
            type="range"
            min={0}
            max={35}
            step={1}
            value={fontLevel}
            onChange={e => changeFontLevel(Number(e.target.value))}
            className="range range-xs range-primary flex-1 min-w-0"
            aria-label="Tamanho da fonte"
          />
          <button
            type="button"
            className="btn btn-ghost btn-xs btn-circle min-h-0 h-6 w-6 shrink-0 disabled:opacity-30"
            onClick={() => changeFontLevel(fontLevel + 1)}
            disabled={fontLevel === 35}
          >
            <Type className="w-4 h-4" />
          </button>
        </div>

        {readPercent > 0 && (
          <span className="text-[11px] font-semibold text-primary shrink-0">{readPercent}%</span>
        )}
      </div>
    </div>
  );
}
