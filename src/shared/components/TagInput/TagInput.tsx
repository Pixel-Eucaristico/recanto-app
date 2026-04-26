'use client';

import { useState } from 'react';
import { Tag, Check, X } from 'lucide-react';
import { TagColor } from '@/domain/library/types';

interface TagInputProps {
  onSave: (text: string, color: TagColor) => void;
  onClose: () => void;
  initialText?: string;
  initialColor?: TagColor;
}

// Borda colorida — fundo sempre sólido (base-100)
const tagColorConfig: Record<TagColor, { border: string; accent: string; label: string }> = {
  yellow: { border: 'border-warning',  accent: 'text-warning',  label: 'Amarelo' },
  green:  { border: 'border-success',  accent: 'text-success',  label: 'Verde'   },
  blue:   { border: 'border-info',     accent: 'text-info',     label: 'Azul'    },
  pink:   { border: 'border-error',    accent: 'text-error',    label: 'Rosa'    },
};

const TAG_COLORS: TagColor[] = ['yellow', 'green', 'blue', 'pink'];

export function TagInput({ onSave, onClose, initialText = '', initialColor = 'yellow' }: TagInputProps) {
  const [text, setText] = useState(initialText);
  const [color, setColor] = useState<TagColor>(initialColor);

  function handleSave() {
    if (!text.trim()) return;
    onSave(text.trim(), color);
  }

  return (
    <div
      className={`w-56 rounded-lg border-2 shadow-xl p-3 space-y-2 bg-base-100 ${tagColorConfig[color].border}`}
      onMouseDown={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold flex items-center gap-1 ${tagColorConfig[color].accent}`}>
          <Tag className="w-3 h-3" /> Marcador
        </span>
        <button type="button" onClick={onClose} className="btn btn-ghost btn-xs btn-circle p-0">
          <X className="w-3 h-3" />
        </button>
      </div>

      <input
        className="input input-sm input-bordered w-full text-sm bg-base-100"
        placeholder="Texto do marcador..."
        value={text}
        onChange={e => setText(e.target.value)}
        maxLength={80}
        autoFocus
        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onClose(); }}
      />

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {TAG_COLORS.map(c => (
            <button
              key={c}
              type="button"
              title={tagColorConfig[c].label}
              onClick={() => setColor(c)}
              className={`w-4 h-4 rounded-full border-2 ${c === 'yellow' ? 'bg-warning' : c === 'green' ? 'bg-success' : c === 'blue' ? 'bg-info' : 'bg-error'} ${color === c ? 'border-base-content scale-110' : 'border-transparent'} transition-transform`}
            />
          ))}
        </div>
        <button
          type="button"
          className="btn btn-xs btn-primary gap-1"
          onClick={handleSave}
          disabled={!text.trim()}
        >
          <Check className="w-3 h-3" /> OK
        </button>
      </div>
      <p className="text-[9px] text-base-content/40 text-right">{text.length}/80</p>
    </div>
  );
}
