'use client';

import { useCallback, useMemo } from 'react';
import { ChartCard, EChart, type ChartTheme, type EChartsOption } from '@/shared/components/charts';
import { formatDayKey } from '@/shared/utils/datetime';
import type { StudentActivityEvent } from '@/domain/formation/activity';

interface ActivityWeeksChartProps {
  events: StudentActivityEvent[];
  /** Quantas semanas mostrar. */
  weeks?: number;
}

const DEFAULT_WEEKS = 12;
const MS_PER_DAY = 86_400_000;

/**
 * Atividade por semana.
 *
 * Forma: coluna, série única — é volume ao longo do tempo, e a pergunta é "está
 * esfriando?". Uma cor só; colorir por tipo de atividade aqui gastaria o canal de
 * cor sem responder essa pergunta (o mix por tipo tem gráfico próprio).
 *
 * Semanas sem atividade aparecem como zero, não são omitidas — o vazio é o dado.
 */
export function ActivityWeeksChart({ events, weeks = DEFAULT_WEEKS }: ActivityWeeksChartProps) {
  const dados = useMemo(() => {
    // Segunda-feira da semana corrente, no fuso local.
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const diaSemana = (hoje.getDay() + 6) % 7; // 0 = segunda
    const inicioSemanaAtual = hoje.getTime() - diaSemana * MS_PER_DAY;

    const baldes = Array.from({ length: weeks }, (_, i) => {
      const inicio = new Date(inicioSemanaAtual - (weeks - 1 - i) * 7 * MS_PER_DAY);
      const fim = new Date(inicio.getTime() + 6 * MS_PER_DAY);
      return {
        inicioKey: formatDayKey(inicio),
        fimKey: formatDayKey(fim),
        rotulo: inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        total: 0,
      };
    });

    for (const e of events) {
      const chave = formatDayKey(e.at);
      // Busca linear em 12 baldes é mais barata que montar índice.
      const balde = baldes.find(b => chave >= b.inicioKey && chave <= b.fimKey);
      if (balde) balde.total += 1;
    }

    return baldes;
  }, [events, weeks]);

  const temAlgum = dados.some(d => d.total > 0);
  const pico = Math.max(...dados.map(d => d.total));

  const buildOption = useCallback((theme: ChartTheme): EChartsOption => ({
    grid: { left: 4, right: 8, top: 16, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: theme.surface,
      borderColor: theme.grid,
      textStyle: { color: theme.ink, fontSize: 12 },
      formatter: (params: unknown) => {
        const lista = params as Array<{ dataIndex: number }>;
        const d = dados[lista[0].dataIndex];
        return `<strong>${d.total}</strong> atividade(s)<br/>semana de ${d.rotulo}`;
      },
    },
    xAxis: {
      type: 'category',
      data: dados.map(d => d.rotulo),
      axisLabel: { color: theme.inkMuted, fontSize: 10, interval: Math.floor(weeks / 6) },
      axisLine: { lineStyle: { color: theme.grid } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: theme.inkMuted, fontSize: 10 },
      splitLine: { lineStyle: { color: theme.grid, width: 1, type: 'solid' } },
    },
    series: [{
      type: 'bar',
      barMaxWidth: 20,
      data: dados.map(d => ({
        value: d.total,
        itemStyle: {
          // Ênfase na semana de pico — o resto fica recessivo.
          color: d.total === pico && pico > 0 ? theme.palette[0] : theme.muted,
          borderRadius: [4, 4, 0, 0],
        },
      })),
      // Rótulo só no pico: número em toda coluna vira ruído.
      label: {
        show: true,
        position: 'top',
        color: theme.inkMuted,
        fontSize: 10,
        formatter: (p: { value: number }) => (p.value === pico && pico > 0 ? String(p.value) : ''),
      },
    }],
    animationDuration: 240,
  }), [dados, pico, weeks]);

  return (
    <ChartCard
      title={`Atividade nas últimas ${weeks} semanas`}
      subtitle="Registros por semana — responde se o aluno está esfriando."
      columns={[
        { key: 'semana', label: 'Semana de' },
        { key: 'total', label: 'Atividades', numeric: true },
      ]}
      rows={temAlgum ? dados.map(d => ({ semana: d.rotulo, total: d.total })) : []}
      emptyLabel="Nenhuma atividade registrada no período."
    >
      <EChart buildOption={buildOption} height={180} ariaLabel="Atividades por semana" />
    </ChartCard>
  );
}
