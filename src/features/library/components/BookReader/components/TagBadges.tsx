'use client';

import { Tag, X } from 'lucide-react';
import type { BookTag } from '@/domain/library/types';
import { tagBadgeConfig } from '../utils/constants';

interface TagBadgesProps {
  tags: BookTag[];
  onRemove: (id: string) => void;
}

export function TagBadges({ tags, onRemove }: TagBadgesProps) {
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {tags.map(t => (
        <span
          key={t.id}
          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${tagBadgeConfig[t.color]}`}
        >
          <Tag className="w-2.5 h-2.5 shrink-0" />
          {t.text}
          <button
            type="button"
            onClick={() => onRemove(t.id)}
            className="ml-0.5 opacity-60 hover:opacity-100"
            aria-label="Remover marcador"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
    </div>
  );
}
