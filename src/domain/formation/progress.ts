/**
 * Progresso de trilha — regra única de cálculo e exibição.
 *
 * O bug que isto resolve: quatro lugares calculavam `concluídas ÷ aulas abertas`.
 * Como o aluno só ganha registro de progresso ao interagir com a aula, o
 * denominador crescia junto com o numerador — quem abriu 3 de 40 aulas e concluiu
 * as 3 via **100% com a barra cheia**.
 *
 * Regra: sem o total real do currículo, NÃO existe percentual. Mostra-se a
 * contagem absoluta. Um número ausente é honesto; um número inflado não.
 */

export interface TrackProgress {
  completed: number;
  /** Total de aulas do currículo. `null` quando não foi possível resolver. */
  total: number | null;
  /** 0–100. `null` quando não há total — nunca inventar. */
  percent: number | null;
}

export function buildTrackProgress(completed: number, total: number | null | undefined): TrackProgress {
  const totalValido = typeof total === 'number' && total > 0 ? total : null;
  return {
    completed,
    total: totalValido,
    // Trava em 100: progresso legado pode ter aula concluída que saiu do currículo.
    percent: totalValido ? Math.min(100, Math.round((completed / totalValido) * 100)) : null,
  };
}

/** "12 de 40" ou "12 aulas concluídas" quando o total é desconhecido. */
export function formatProgressCount(progress: TrackProgress): string {
  if (progress.total !== null) return `${progress.completed} de ${progress.total}`;
  return `${progress.completed} aula${progress.completed === 1 ? '' : 's'} concluída${progress.completed === 1 ? '' : 's'}`;
}

/** "45%" ou "—". Nunca devolve percentual estimado. */
export function formatProgressPercent(progress: TrackProgress): string {
  return progress.percent === null ? '—' : `${progress.percent}%`;
}

/**
 * Classe de badge por faixa de conclusão. Literais completos — Tailwind não
 * enxerga classe montada em runtime.
 */
export function progressBadgeClass(progress: TrackProgress): string {
  if (progress.percent === null) return 'badge-ghost';
  if (progress.percent >= 100) return 'badge-success';
  if (progress.percent >= 50) return 'badge-info';
  return 'badge-ghost';
}
