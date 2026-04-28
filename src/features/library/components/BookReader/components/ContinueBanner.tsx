'use client';

import { BookMarked } from 'lucide-react';
import type { BookReadingProgress } from '@/domain/library/types';

interface ContinueBannerProps {
  progress: BookReadingProgress;
  onDismiss: () => void;
  onContinue: () => void;
}

export function ContinueBanner({ progress, onDismiss, onContinue }: ContinueBannerProps) {
  return (
    <div className="sticky top-[49px] z-20 bg-info/15 border-b border-info/30 px-3 md:px-6 py-2 flex items-center justify-between gap-3 flex-wrap">
      <span className="text-sm text-base-content flex items-center gap-1.5">
        <BookMarked className="w-4 h-4 text-info shrink-0" />
        Última leitura: cap. {progress.last_chapter_order}
        {progress.last_ref && ` — ref. ${progress.last_ref}`}
      </span>
      <div className="flex gap-2">
        <button type="button" className="btn btn-xs btn-ghost" onClick={onDismiss}>Ignorar</button>
        <button type="button" className="btn btn-xs btn-info gap-1" onClick={onContinue}>
          <BookMarked className="w-3 h-3" /> Continuar
        </button>
      </div>
    </div>
  );
}
