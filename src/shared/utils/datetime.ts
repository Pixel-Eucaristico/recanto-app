/**
 * Formatação de data/hora — fonte única.
 *
 * Existiam 14 cópias de `formatRelative` espalhadas, com regras divergentes: umas
 * paravam em 7 dias, outras não; umas incluíam o ano, outras não. O mesmo evento
 * aparecia como "3 dias atrás" numa tela e "31 jan" em outra.
 *
 * Tudo aqui opera no fuso LOCAL. `toISOString()` é UTC — no Brasil (UTC-3) isso
 * joga atividade das 21h–00h no dia seguinte, o que inflava/quebrava o streak.
 */

const MS_PER_DAY = 86_400_000;

/** Início do dia no fuso local. */
function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDate(value: string | number | Date): Date | null {
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Chave de dia `YYYY-MM-DD` no fuso LOCAL.
 *
 * Use sempre esta função para agrupar por dia — nunca `toISOString().slice(0,10)`.
 */
export function formatDayKey(value: string | number | Date = new Date()): string {
  const d = toDate(value);
  if (!d) return '';
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** Diferença em dias de calendário (ignora hora). Negativo = futuro. */
export function daysSince(value: string | number | Date, now: Date = new Date()): number {
  const d = toDate(value);
  if (!d) return 0;
  return Math.round((startOfLocalDay(now).getTime() - startOfLocalDay(d).getTime()) / MS_PER_DAY);
}

/**
 * "hoje" · "ontem" · "3 dias atrás" · "12 de mar" · "12 de mar de 2025".
 * O ano só aparece quando não é o corrente — economiza espaço sem perder precisão.
 */
export function formatRelative(value: string | number | Date | undefined | null): string {
  if (!value) return '';
  const d = toDate(value);
  if (!d) return '';

  const dias = daysSince(d);
  if (dias === 0) return 'hoje';
  if (dias === 1) return 'ontem';
  if (dias > 1 && dias < 7) return `${dias} dias atrás`;
  if (dias < 0) return formatShortDate(d);
  return formatShortDate(d);
}

/** "12 de mar" ou "12 de mar de 2025" quando o ano difere do atual. */
export function formatShortDate(value: string | number | Date | undefined | null): string {
  if (!value) return '';
  const d = toDate(value);
  if (!d) return '';

  const mesmoAno = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    ...(mesmoAno ? {} : { year: 'numeric' }),
  });
}

/** "hoje, 14:32" · "ontem, 09:05" · "12 de mar, 14:32". Para linhas do tempo. */
export function formatRelativeDateTime(value: string | number | Date | undefined | null): string {
  if (!value) return '';
  const d = toDate(value);
  if (!d) return '';

  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dias = daysSince(d);
  if (dias === 0) return `hoje, ${hora}`;
  if (dias === 1) return `ontem, ${hora}`;
  if (dias > 1 && dias < 7) return `${dias} dias atrás, ${hora}`;
  return `${formatShortDate(d)}, ${hora}`;
}

/** Data e hora completas — para tooltips e detalhes, onde precisão importa. */
export function formatDateTime(value: string | number | Date | undefined | null): string {
  if (!value) return '';
  const d = toDate(value);
  if (!d) return '';
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** "45s" · "12 min" · "1h 20min". Para duração de vídeo/sessão. */
export function formatDuration(seconds: number | undefined | null): string {
  if (!seconds || seconds <= 0) return '';
  if (seconds < 60) return `${Math.round(seconds)}s`;

  const minutos = Math.round(seconds / 60);
  if (minutos < 60) return `${minutos} min`;

  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto === 0 ? `${horas}h` : `${horas}h ${resto}min`;
}

/**
 * Lista de chaves de dia cobrindo os últimos `days` dias, do mais antigo ao mais
 * recente. Base do heatmap de constância e das séries semanais.
 */
export function lastDayKeys(days: number, now: Date = new Date()): string[] {
  const base = startOfLocalDay(now).getTime();
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    keys.push(formatDayKey(new Date(base - i * MS_PER_DAY)));
  }
  return keys;
}

/**
 * Maior sequência de dias consecutivos terminando hoje (ou ontem — o dia corrente
 * ainda pode não ter registro sem quebrar a sequência).
 */
export function computeStreak(dayKeys: Iterable<string>, now: Date = new Date()): number {
  const dias = dayKeys instanceof Set ? dayKeys : new Set(dayKeys);
  if (dias.size === 0) return 0;

  const base = startOfLocalDay(now).getTime();
  let streak = 0;

  for (let i = 0; i < 366; i++) {
    const chave = formatDayKey(new Date(base - i * MS_PER_DAY));
    if (dias.has(chave)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  return streak;
}
