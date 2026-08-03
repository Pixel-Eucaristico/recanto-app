/**
 * Registro seletivo do ECharts.
 *
 * Importar `echarts` inteiro traz ~1MB e todos os tipos de gráfico. O build deste
 * projeto já estoura memória no Vercel (por isso `typescript.ignoreBuildErrors` e
 * `eslint.ignoreDuringBuilds` estão ligados no `next.config.ts`), então só entram os
 * componentes efetivamente usados.
 *
 * Ao adicionar um tipo de gráfico novo, registre-o AQUI — nunca importe de
 * 'echarts' direto num componente, senão o tree-shaking morre.
 */
import * as echarts from 'echarts/core';
import { BarChart, LineChart, HeatmapChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  MarkLineComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

let registered = false;

/** Idempotente — chamada a cada mount de gráfico. */
export function ensureEchartsRegistered(): void {
  if (registered) return;
  echarts.use([
    BarChart,
    LineChart,
    HeatmapChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    VisualMapComponent,
    MarkLineComponent,
    CanvasRenderer,
  ]);
  registered = true;
}

export { echarts };
export type EChartsOption = echarts.EChartsCoreOption;
