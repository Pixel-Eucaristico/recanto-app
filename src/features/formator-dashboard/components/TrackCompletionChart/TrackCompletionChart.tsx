'use client';

import { useCallback, useMemo } from 'react';
import { ChartCard, EChart, type ChartTheme, type EChartsOption } from '@/shared/components/charts';
import type { FormatorStats } from '@/application/formation/FormatorService';

interface TrackCompletionChartProps {
  byTrack: FormatorStats['byTrack'];
  /** Filtra a lista de alunos ao clicar numa barra. */
  onSelectTrack?: (trackId: string) => void;
  /** Trilha em foco — recebe destaque; as outras ficam recessivas. */
  selectedTrackId?: string;
}

/** Barras além disso viram "Outras" — 50 trilhas numa coluna é ilegível. */
const MAX_BARS = 8;

/**
 * Conclusão por trilha.
 *
 * Forma: barra horizontal, série única. É comparação de magnitude entre categorias
 * de nome longo — barra deitada acomoda o rótulo sem girar texto. Série única não
 * leva legenda: o título já diz o que está plotado.
 *
 * Cor: uma só (`--chart-1`), com ênfase quando há trilha selecionada. Colorir cada
 * barra de um hue diferente gastaria o canal de cor repetindo o que o comprimento
 * já diz.
 *
 * Substitui a lista estática que existia aqui — que mostrava os mesmos números sem
 * permitir clicar, enquanto o filtro de trilha ficava dois cards abaixo.
 */
export function TrackCompletionChart({
  byTrack, onSelectTrack, selectedTrackId,
}: TrackCompletionChartProps) {
  /** Só trilhas com total de currículo conhecido têm taxa comparável. */
  const dados = useMemo(() => {
    const comTaxa = byTrack
      .filter(b => b.rate !== null)
      .sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0));

    const visiveis = comTaxa.slice(0, MAX_BARS);
    const resto = comTaxa.slice(MAX_BARS);

    const linhas = visiveis.map(b => ({
      id: b.track.id,
      nome: b.track.title,
      taxa: b.rate ?? 0,
      alunos: b.studentCount,
      concluidas: b.completedLessons,
    }));

    // Nunca gerar hue novo para a cauda: agrega em "Outras".
    if (resto.length > 0) {
      const media = Math.round(resto.reduce((s, b) => s + (b.rate ?? 0), 0) / resto.length);
      linhas.push({
        id: '__outras__',
        nome: `Outras (${resto.length})`,
        taxa: media,
        alunos: resto.reduce((s, b) => s + b.studentCount, 0),
        concluidas: resto.reduce((s, b) => s + b.completedLessons, 0),
      });
    }

    return linhas;
  }, [byTrack]);

  const semTaxa = byTrack.length - dados.filter(d => d.id !== '__outras__').length;

  const buildOption = useCallback((theme: ChartTheme): EChartsOption => {
    // ECharts desenha o eixo Y de baixo para cima; inverte pra maior taxa no topo.
    const ordenado = [...dados].reverse();

    return {
      grid: { left: 4, right: 44, top: 4, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'item',
        backgroundColor: theme.surface,
        borderColor: theme.grid,
        textStyle: { color: theme.ink, fontSize: 12 },
        formatter: (p: unknown) => {
          const item = p as { dataIndex: number };
          const d = ordenado[item.dataIndex];
          // Valor primeiro, rótulo depois — quem passa o mouse já sabe a categoria.
          return `<strong>${d.taxa}%</strong> concluído<br/>${d.alunos} aluno(s) · ${d.concluidas} aulas`;
        },
      },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: { color: theme.inkMuted, fontSize: 10, formatter: '{value}%' },
        splitLine: { lineStyle: { color: theme.grid, width: 1, type: 'solid' } },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'category',
        data: ordenado.map(d => d.nome),
        axisLabel: { color: theme.inkMuted, fontSize: 11, width: 130, overflow: 'truncate' },
        axisLine: { lineStyle: { color: theme.grid } },
        axisTick: { show: false },
      },
      series: [{
        type: 'bar',
        // Teto de espessura: barra cheia no slot fica pesada.
        barMaxWidth: 18,
        data: ordenado.map(d => ({
          value: d.taxa,
          itemStyle: {
            // Ênfase: a trilha em foco mantém a cor; as outras recuam.
            color: !selectedTrackId || selectedTrackId === d.id ? theme.palette[0] : theme.muted,
            // Ponta arredondada só no fim da barra; base fica reta.
            borderRadius: [0, 4, 4, 0],
          },
        })),
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          color: theme.inkMuted,
          fontSize: 10,
        },
      }],
      animationDuration: 240,
    };
  }, [dados, selectedTrackId]);

  const handleClick = useCallback((nome: string) => {
    const achado = dados.find(d => d.nome === nome);
    if (achado && achado.id !== '__outras__') onSelectTrack?.(achado.id);
  }, [dados, onSelectTrack]);

  return (
    <ChartCard
      title="Conclusão por trilha"
      subtitle={
        semTaxa > 0
          ? `Clique numa barra para filtrar. ${semTaxa} trilha(s) sem currículo resolvido ficaram de fora.`
          : 'Clique numa barra para filtrar a lista de alunos.'
      }
      columns={[
        { key: 'nome', label: 'Trilha' },
        { key: 'alunos', label: 'Alunos', numeric: true },
        { key: 'concluidas', label: 'Aulas concluídas', numeric: true },
        { key: 'taxa', label: 'Conclusão', numeric: true },
      ]}
      rows={dados.map(d => ({
        nome: d.nome,
        alunos: d.alunos,
        concluidas: d.concluidas,
        taxa: `${d.taxa}%`,
      }))}
      emptyLabel="Nenhuma trilha com currículo resolvido ainda."
    >
      <EChart
        buildOption={buildOption}
        height={Math.max(120, dados.length * 34 + 24)}
        ariaLabel="Taxa de conclusão por trilha"
        onMarkClick={handleClick}
      />
    </ChartCard>
  );
}
