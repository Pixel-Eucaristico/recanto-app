'use client';

import { Check } from 'lucide-react';
import { HighlightColor } from '@/domain/library/types';

interface HighlightColorPickerProps {
  value: HighlightColor | null;
  onChange: (color: HighlightColor) => void;
}

// Classes hardcoded — Tailwind purge safety (não usar dinâmico)
const colorConfig: Record<HighlightColor, { btn: string; label: string }> = {
  yellow: { btn: 'btn-warning',  label: 'Amarelo' },
  green:  { btn: 'btn-success',  label: 'Verde'   },
  blue:   { btn: 'btn-info',     label: 'Azul'    },
  pink:   { btn: 'btn-error',    label: 'Rosa'    },
};

const COLORS: HighlightColor[] = ['yellow', 'green', 'blue', 'pink'];

export function HighlightColorPicker({ value, onChange }: HighlightColorPickerProps) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Escolher cor do destaque">
      {COLORS.map(color => {
        const { btn, label } = colorConfig[color];
        const active = value === color;
        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            title={label}
            aria-label={label}
            aria-pressed={active}
            className={`btn btn-circle btn-sm ${btn} ${active ? 'ring-2 ring-offset-2 ring-current' : 'opacity-70 hover:opacity-100'} transition-all`}
          >
            {active && <Check className="w-3.5 h-3.5" />}
          </button>
        );
      })}
    </div>
  );
}
