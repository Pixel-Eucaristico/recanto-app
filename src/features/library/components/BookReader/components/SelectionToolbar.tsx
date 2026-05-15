'use client';

import { X } from 'lucide-react';
import type { HighlightColor } from '@/domain/library/types';
import { selectionColorConfig } from '../utils/constants';

interface SelectionToolbarProps {
  x: number;
  y: number;
  onSelectColor: (color: HighlightColor) => void;
  onDismiss: () => void;
}

export function SelectionToolbar({ x, y, onSelectColor, onDismiss }: SelectionToolbarProps) {
  return (
    <div
      data-selection-toolbar=""
      className="fixed z-50 flex items-center gap-1 bg-base-100 border border-base-300 rounded-lg shadow-xl px-2 py-1.5 -translate-x-1/2 -translate-y-full"
      style={{ left: x, top: y }}
      onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
    >
      <span className="text-[10px] text-base-content/50 mr-1">Destacar:</span>
      {selectionColorConfig.map(({ color, cls, label }) => (
        <button
          key={color}
          type="button"
          title={label}
          aria-label={label}
          onClick={() => onSelectColor(color)}
          className={`w-5 h-5 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110 ${cls}`}
        />
      ))}
      <button
        type="button"
        onClick={onDismiss}
        className="ml-1 text-base-content/40 hover:text-base-content"
        title="Fechar"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
