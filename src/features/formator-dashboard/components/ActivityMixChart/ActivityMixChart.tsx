'use client';

import { useCallback, useMemo } from 'react';
import { ChartCard, EChart, type ChartTheme, type EChartsOption } from '@/shared/components/charts';
import {
  ACTIVITY_KIND_LABELS,
  type ActivityCounts,
  type ActivityKind,
} from '@/domain/formation/activity';

interface ActivityMixChartProps {
  counts: ActivityCounts | null;
}

/**
 * Que tipo de atividade o aluno faz.
 *
 * Forma: barra horizontal, série única, ordenada por volume. Não é pizza — comparar
 * fatias próximas em ângulo é justamente o que pizza faz mal, e aqui há até 12
 * categorias de nome longo, que a barra deitada acomoda sem girar texto.
 *
 * Serve para ver desequilíbrio: aluno que só assiste vídeo e nunca escreve aparece
 * na hora.
 */
export function ActivityMixChart({ counts }: ActivityMixChartProps) {
  const dados = useMemo(() => {
    if (!counts) return [];
    return (Object.entries(counts.byKind) as Array<[ActivityKind, number]>)
      .filter(([, total]) => total > 0)
      .map(([kind, total]) => ({ kind, rotulo: ACTIVITY_KIND_LABELS[kind], total }))
      .sort((a, b) => b.total - a.total);
  }, [counts]);

  const pico = dados.length > 0 ? dados[0].total : 0;

  const buildOption = useCallback((theme: ChartTheme): EChartsOption => {
    // Eixo Y desenha de baixo para cima; inverte pra maior no topo.
    const ordenado = [...dados].reverse();

    return {
      grid: { left: 4, right: 32, top: 4, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'item',
        backgroundColor: theme.surface,
        borderColor: theme.grid,
        textStyle: { color: theme.ink, fontSize: 12 },
        formatter: (p: unknown) => {
          const item = p as { dataIndex: number };
          const d = ordenado[item.dataIndex];
          return `<strong>${d.total}</strong> registro(s)<br/>${d.rotulo}`;
        },
      },
      xAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { color: theme.inkMuted, fontSize: 10 },
        splitLine: { lineStyle: { color: theme.grid, width: 1, type: 'solid' } },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'category',
        data: ordenado.map(d => d.rotulo),
        axisLabel: { color: theme.inkMuted, fontSize: 11, width: 110, overflow: 'truncate' },
        axisLine: { lineStyle: { color: theme.grid } },
        axisTick: { show: false },
      },
      series: [{
        type: 'bar',
        barMaxWidth: 14,
        data: ordenado.map(d => ({
          value: d.total,
          itemStyle: {
            // Ênfase no tipo dominante.
            color: d.total === pico ? theme.palette[0] : theme.muted,
            borderRadius: [0, 4, 4, 0],
          },
        })),
        label: { show: true, position: 'right', color: theme.inkMuted, fontSize: 10 },
      }],
      animationDuration: 240,
    };
  }, [dados, pico]);

  return (
    <ChartCard
      title="Tipos de atividade"
      subtitle="Onde o aluno se dedica — desequilíbrio aparece na hora."
      columns={[
        { key: 'tipo', label: 'Tipo' },
        { key: 'total', label: 'Registros', numeric: true },
      ]}
      rows={dados.map(d => ({ tipo: d.rotulo, total: d.total }))}
      emptyLabel="Nenhuma atividade registrada."
    >
      <EChart
        buildOption={buildOption}
        height={Math.max(120, dados.length * 28 + 24)}
        ariaLabel="Distribuição de atividades por tipo"
      />
    </ChartCard>
  );
}
