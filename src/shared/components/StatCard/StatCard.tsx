'use client';

import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import type { ReactNode } from 'react';
import { Sparkline } from '@/shared/components/charts';

export interface StatCardDelta {
  /** Variação em pontos percentuais ou unidades. Sinal define a direção. */
  value: number;
  /** Contra o que se compara. Ex: "vs. semana anterior". */
  label: string;
  /**
   * Se subir é bom. Default `true`.
   * Em "Parados há mais de 14 dias", subir é ruim — daí o parâmetro.
   */
  upIsGood?: boolean;
}

export interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  /** Classe semântica DaisyUI, ex: `text-primary`, `text-warning`. */
  color: string;
  /** Quando presente, o card vira filtro clicável. */
  onClick?: () => void;
  active?: boolean;
  /** Variação vs. período anterior. */
  delta?: StatCardDelta;
  /** Nota curta abaixo do valor. */
  hint?: string;
  /** Série curta de tendência — tipicamente 12 pontos. */
  trend?: number[];
}

/**
 * Cartão de métrica. A forma certa quando o dado é UM número — nunca um gráfico de
 * barra de uma barra só.
 */
export function StatCard({
  label, value, icon, color, onClick, active, delta, hint, trend,
}: StatCardProps) {
  const content = (
    <div className={`card bg-base-100 border ${active ? 'border-primary' : 'border-base-300'} h-full`}>
      <div className="card-body p-3 gap-1">
        <div className={`flex items-center gap-1 ${color}`}>
          {icon}
          <span className="text-[11px] text-base-content/60 truncate">{label}</span>
        </div>

        <div className="flex items-end justify-between gap-2">
          {/* Figuras proporcionais: tabular-nums deixa números grandes frouxos. */}
          <span className="text-lg font-bold leading-none">{value}</span>
          {trend && trend.length > 1 && (
            <span className={`${color} opacity-70 shrink-0`}>
              <Sparkline values={trend} ariaLabel={`Tendência de ${label}`} />
            </span>
          )}
        </div>

        {delta && <DeltaBadge {...delta} />}
        {hint && <p className="text-[10px] text-base-content/50 truncate">{hint}</p>}
      </div>
    </div>
  );

  if (!onClick) return content;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="text-left hover:opacity-80 transition-opacity"
    >
      {content}
    </button>
  );
}

function DeltaBadge({ value, label, upIsGood = true }: StatCardDelta) {
  const parado = value === 0;
  const subiu = value > 0;
  const bom = parado ? null : subiu === upIsGood;

  // Classes literais — Tailwind não enxerga classe montada em runtime.
  const tone = bom === null
    ? 'text-base-content/50'
    : bom ? 'text-success' : 'text-error';

  const Icon = parado ? Minus : subiu ? ArrowUp : ArrowDown;

  return (
    <div className={`flex items-center gap-1 text-[10px] ${tone}`}>
      <Icon className="w-3 h-3 shrink-0" />
      <span className="tabular-nums">{parado ? '0' : `${subiu ? '+' : ''}${value}`}</span>
      <span className="text-base-content/50 truncate">{label}</span>
    </div>
  );
}
