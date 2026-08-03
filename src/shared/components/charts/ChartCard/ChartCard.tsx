'use client';

import { useId, useState, type ReactNode } from 'react';
import { BarChart3, Table2 } from 'lucide-react';

export interface ChartTableColumn {
  key: string;
  label: string;
  /** Alinha à direita — use para números. */
  numeric?: boolean;
}

export interface ChartCardProps {
  title: string;
  /** Linha de apoio: o que o gráfico responde. */
  subtitle?: string;
  /** Ação no canto (link "ver todos", export). */
  action?: ReactNode;
  children: ReactNode;
  /** Colunas da tabela equivalente. */
  columns: ChartTableColumn[];
  /** Linhas da tabela. Mesmos dados do gráfico. */
  rows: Array<Record<string, string | number>>;
  /** Mostrado quando não há dados. */
  emptyLabel?: string;
}

/**
 * Moldura de gráfico com alternador gráfico/tabela.
 *
 * A tabela não é um extra: três dos hues da paleta ficam abaixo de 3:1 de contraste
 * na superfície clara, e a regra de alívio exige rótulo visível **ou** tabela. Ela
 * também é o caminho de leitura para quem não distingue as cores e para leitor de
 * tela — nenhum valor pode existir só dentro do canvas.
 */
export function ChartCard({
  title, subtitle, action, children, columns, rows, emptyLabel = 'Sem dados no período.',
}: ChartCardProps) {
  const [mode, setMode] = useState<'chart' | 'table'>('chart');
  const painelId = useId();
  const vazio = rows.length === 0;

  return (
    <section className="card bg-base-100 border border-base-300">
      <div className="card-body p-3 sm:p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{title}</h3>
            {subtitle && <p className="text-xs text-base-content/60 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {action}
            {!vazio && (
              <div role="tablist" aria-label="Formato de visualização" className="join">
                <button
                  role="tab"
                  aria-selected={mode === 'chart'}
                  aria-controls={painelId}
                  className={`btn btn-xs join-item ${mode === 'chart' ? 'btn-active' : 'btn-ghost'}`}
                  onClick={() => setMode('chart')}
                  title="Ver gráfico"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                </button>
                <button
                  role="tab"
                  aria-selected={mode === 'table'}
                  aria-controls={painelId}
                  className={`btn btn-xs join-item ${mode === 'table' ? 'btn-active' : 'btn-ghost'}`}
                  onClick={() => setMode('table')}
                  title="Ver tabela"
                >
                  <Table2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div id={painelId}>
          {vazio && <p className="text-sm text-base-content/60 py-6 text-center">{emptyLabel}</p>}

          {!vazio && mode === 'chart' && children}

          {!vazio && mode === 'table' && (
            /* Conteúdo largo rola dentro do próprio container — a página nunca. */
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="table table-xs table-pin-rows">
                <thead>
                  <tr>
                    {columns.map(c => (
                      <th key={c.key} className={c.numeric ? 'text-right' : undefined}>
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i}>
                      {columns.map(c => (
                        <td
                          key={c.key}
                          /* tabular-nums só em coluna: alinha o ponto decimal. */
                          className={c.numeric ? 'text-right tabular-nums' : undefined}
                        >
                          {row[c.key] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
