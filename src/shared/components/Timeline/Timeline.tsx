'use client';

import type { ReactNode } from 'react';

export type TimelineTone = 'success' | 'error' | 'warning' | 'neutral' | 'primary';

export interface TimelineItemProps {
  /** Ícone lucide à esquerda do conteúdo. */
  icon?: ReactNode;
  /** Cor do marcador. Traduzida para classe literal — Tailwind não resolve runtime. */
  tone?: TimelineTone;
  children: ReactNode;
}

/**
 * Linha do tempo compartilhada.
 *
 * Substitui 3 implementações manuais que repetiam `border-l-2 ml-2 pl-4` mais um
 * marcador em `-left-[22px]` — um offset mágico acoplado ao padding da lista, que
 * desalinhava a cada ajuste de espaçamento. Aqui o marcador é posicionado a partir
 * da própria borda, então padding e marcador não podem divergir.
 */
export function Timeline({ children }: { children: ReactNode }) {
  return (
    <ol className="relative ml-1.5 border-l-2 border-base-300 pl-5 space-y-3">
      {children}
    </ol>
  );
}

export function TimelineItem({ icon, tone = 'neutral', children }: TimelineItemProps) {
  return (
    <li className="relative">
      <span
        aria-hidden
        className={`absolute top-1 -left-[calc(1.25rem+1px)] -translate-x-1/2 w-3 h-3 rounded-full bg-base-100 border-2 ${dotClass(tone)}`}
      />
      <div className="flex items-start gap-2">
        {icon}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </li>
  );
}

function dotClass(tone: TimelineTone): string {
  if (tone === 'success') return 'border-success';
  if (tone === 'error') return 'border-error';
  if (tone === 'warning') return 'border-warning';
  if (tone === 'primary') return 'border-primary';
  return 'border-base-300';
}
