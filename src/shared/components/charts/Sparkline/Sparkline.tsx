'use client';

export interface SparklineProps {
  /** Série curta — tipicamente 12 pontos. */
  values: number[];
  width?: number;
  height?: number;
  /** Rótulo acessível. O valor exato vive no StatCard ao lado, não aqui. */
  ariaLabel: string;
}

/**
 * Tendência mínima dentro de um cartão de métrica.
 *
 * SVG à mão de propósito: carregar o ECharts para 12 pontos sem eixo, sem grade e
 * sem tooltip não se paga. Usa `currentColor`, então herda a cor do contexto e
 * acompanha o tema sem ler token nenhum.
 */
export function Sparkline({ values, width = 64, height = 20, ariaLabel }: SparklineProps) {
  if (values.length < 2) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const stepX = width / (values.length - 1);

  // Margem de 1px em cima e embaixo pra espessura do traço não ser cortada.
  const y = (v: number) => height - 1 - ((v - min) / span) * (height - 2);

  const path = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ');

  const ultimo = values[values.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      className="overflow-visible"
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ponto final ancora a leitura no valor atual. */}
      <circle cx={width} cy={y(ultimo)} r={2.5} fill="currentColor" />
    </svg>
  );
}
