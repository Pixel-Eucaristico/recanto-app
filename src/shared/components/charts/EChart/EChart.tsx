'use client';

import dynamic from 'next/dynamic';
import type { EChartCanvasProps } from './EChartCanvas';

/**
 * Ponto de entrada dos gráficos.
 *
 * Carregamento dinâmico com `ssr: false` porque o ECharts precisa de canvas e
 * mede o container — e para manter o pacote fora do bundle inicial das rotas.
 * Mesmo padrão dos outros pesos do projeto (MDEditor, Lottie).
 */
const EChartCanvas = dynamic(
  () => import('./EChartCanvas').then(m => m.EChartCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full min-h-[180px]">
        <span className="loading loading-spinner loading-sm text-primary" />
      </div>
    ),
  },
);

export function EChart(props: EChartCanvasProps) {
  // Reserva a altura antes do chunk chegar — evita salto de layout.
  return (
    <div style={{ height: props.height ?? 240 }}>
      <EChartCanvas {...props} />
    </div>
  );
}
