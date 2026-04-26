import type { HighlightColor, TagColor } from '@/domain/library/types';

export const markBg: Record<HighlightColor, string> = {
  yellow: 'bg-warning/50 rounded-sm px-0.5',
  green:  'bg-success/50 rounded-sm px-0.5',
  blue:   'bg-info/50    rounded-sm px-0.5',
  pink:   'bg-error/50   rounded-sm px-0.5',
};

export const highlightBg: Record<HighlightColor, string> = {
  yellow: 'bg-warning/20 border-l-4 border-warning',
  green:  'bg-success/20 border-l-4 border-success',
  blue:   'bg-info/20    border-l-4 border-info',
  pink:   'bg-error/20   border-l-4 border-error',
};

export const highlightIcon: Record<HighlightColor, string> = {
  yellow: 'text-warning',
  green:  'text-success',
  blue:   'text-info',
  pink:   'text-error',
};

export const tagBadgeConfig: Record<TagColor, string> = {
  yellow: 'bg-warning  border-warning  text-warning-content',
  green:  'bg-success  border-success  text-success-content',
  blue:   'bg-info     border-info     text-info-content',
  pink:   'bg-error    border-error    text-error-content',
};

export const selectionColorConfig: Array<{ color: HighlightColor; cls: string; label: string }> = [
  { color: 'yellow', cls: 'bg-warning hover:bg-warning/80', label: 'Amarelo' },
  { color: 'green',  cls: 'bg-success hover:bg-success/80', label: 'Verde'   },
  { color: 'blue',   cls: 'bg-info    hover:bg-info/80',    label: 'Azul'    },
  { color: 'pink',   cls: 'bg-error   hover:bg-error/80',   label: 'Rosa'    },
];

export function sliderToPx(v: number): number {
  return 13 + v;
}
