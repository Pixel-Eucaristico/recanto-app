'use client';

export interface LoadingCardProps {
  /** Texto abaixo do spinner. Diga o que carrega, não só "Carregando...". */
  label?: string;
  size?: 'sm' | 'md';
}

/** Card de carregamento padrão. Substitui 6 cópias idênticas. */
export function LoadingCard({ label = 'Carregando...', size = 'md' }: LoadingCardProps) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className={`card-body ${size === 'sm' ? 'p-3' : 'p-4'} items-center text-center gap-2`}>
        <span className={`loading loading-spinner ${size === 'sm' ? 'loading-sm' : 'loading-md'} text-primary`} />
        <p className="text-sm text-base-content/60">{label}</p>
      </div>
    </div>
  );
}

export interface RefreshOverlayProps {
  /** Quando true, esmaece o conteúdo em vez de trocá-lo por um esqueleto. */
  refreshing: boolean;
  children: React.ReactNode;
}

/**
 * Recarga sem pulo de layout.
 *
 * Trocar conteúdo por esqueleto a cada refetch causa flash e salto — o conteúdo
 * anterior fica visível, só atenuado, até o novo chegar.
 */
export function RefreshOverlay({ refreshing, children }: RefreshOverlayProps) {
  return (
    <div
      className={refreshing ? 'opacity-50 transition-opacity pointer-events-none' : 'transition-opacity'}
      aria-busy={refreshing}
    >
      {children}
    </div>
  );
}
