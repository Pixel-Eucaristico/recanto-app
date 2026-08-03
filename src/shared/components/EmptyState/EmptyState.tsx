'use client';

import type { ReactNode } from 'react';

export interface EmptyStateProps {
  /** Frase principal — o que não existe. */
  title: string;
  /** O que fazer a respeito. Opcional, mas quase sempre vale. */
  description?: string;
  /** Ícone lucide. */
  icon?: ReactNode;
  /** Botão/link de ação. */
  action?: ReactNode;
  /** `sm` para blocos internos, `md` para tela cheia. */
  size?: 'sm' | 'md';
}

/**
 * Estado vazio padrão. Substitui 8 cópias do mesmo card tracejado.
 *
 * Um vazio não é um erro: a borda é tracejada e o tom é neutro, nunca `alert-error`.
 */
export function EmptyState({ title, description, icon, action, size = 'md' }: EmptyStateProps) {
  const padding = size === 'sm' ? 'p-4' : 'p-6';

  return (
    <div className="card bg-base-100 border border-dashed border-base-300">
      <div className={`card-body ${padding} items-center text-center gap-2`}>
        {icon && <div className="text-base-content/30">{icon}</div>}
        <p className="text-sm font-medium text-base-content">{title}</p>
        {description && (
          <p className="text-xs text-base-content/60 max-w-sm">{description}</p>
        )}
        {action && <div className="mt-1">{action}</div>}
      </div>
    </div>
  );
}
