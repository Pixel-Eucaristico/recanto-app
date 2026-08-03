'use client';

import { useEffect, useRef, useState } from 'react';
import { ensureEchartsRegistered, echarts, type EChartsOption } from './echartsSetup';
import { useChartTheme, type ChartTheme } from './useChartTheme';

export interface EChartCanvasProps {
  /**
   * Monta a opção do ECharts a partir dos tokens do tema.
   *
   * Recebe o tema em vez de uma opção pronta para que a troca de tema reconstrua as
   * cores sem o chamador precisar saber disso.
   */
  buildOption: (theme: ChartTheme) => EChartsOption;
  /** Altura em px. Obrigatória — o container do dashboard é flex e colapsaria. */
  height?: number;
  /** Rótulo para leitores de tela. O gráfico em si é `aria-hidden`. */
  ariaLabel: string;
  className?: string;
  /** Clique numa marca. `name` é a categoria do eixo. */
  onMarkClick?: (name: string, dataIndex: number) => void;
}

/**
 * Gráfico ECharts. **Não importar direto** — use `EChart`, que faz o carregamento
 * dinâmico e evita o pacote entrar no bundle inicial.
 */
export function EChartCanvas({
  buildOption,
  height = 240,
  ariaLabel,
  className,
  onMarkClick,
}: EChartCanvasProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  // Estado, não ref: o hook de tema precisa reagir quando o nó existe.
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const theme = useChartTheme(host);

  // Guardado em ref pra não recriar o listener a cada render do pai.
  const clickRef = useRef(onMarkClick);
  clickRef.current = onMarkClick;

  useEffect(() => {
    if (!hostRef.current) return;
    ensureEchartsRegistered();

    const instance = echarts.init(hostRef.current, undefined, { renderer: 'canvas' });
    chartRef.current = instance;
    setHost(hostRef.current);

    instance.on('click', params => {
      if (typeof params.name === 'string') {
        clickRef.current?.(params.name, params.dataIndex ?? 0);
      }
    });

    // `window.resize` NÃO cobre este caso: o drawer lateral do dashboard colapsa de
    // w-64 para w-14 em CSS puro, sem disparar evento de janela.
    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(hostRef.current);

    return () => {
      observer.disconnect();
      instance.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = chartRef.current;
    if (!instance) return;
    // `true` substitui a opção inteira — sem isso, séries removidas sobrariam.
    instance.setOption(buildOption(theme), true);
  }, [buildOption, theme]);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label={ariaLabel}
      className={className}
      style={{ height, width: '100%' }}
    />
  );
}
