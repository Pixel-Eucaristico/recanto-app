import {
  formatDayKey,
  daysSince,
  formatRelative,
  formatShortDate,
  formatRelativeDateTime,
  formatDateTime,
  formatDuration,
  lastDayKeys,
  computeStreak,
} from '@/shared/utils/datetime';

/**
 * O ponto destes testes é o FUSO. O código antigo usava `toISOString()` para montar
 * a chave do dia — no Brasil (UTC-3) isso empurra tudo que acontece das 21h à
 * meia-noite para o dia seguinte, quebrando streak e agrupamento por dia.
 */

/** Data no fuso local, sem depender de UTC. */
function local(y: number, m: number, d: number, h = 12, min = 0): Date {
  return new Date(y, m - 1, d, h, min, 0, 0);
}

describe('formatDayKey', () => {
  it('usa o fuso local, não UTC', () => {
    // 22h de 10/mar local. Em UTC-3 isso é 01h de 11/mar UTC.
    const noite = local(2026, 3, 10, 22);
    expect(formatDayKey(noite)).toBe('2026-03-10');
  });

  it('não escorrega no início do dia', () => {
    expect(formatDayKey(local(2026, 3, 10, 0, 0))).toBe('2026-03-10');
  });

  it('zero-padda mês e dia', () => {
    expect(formatDayKey(local(2026, 1, 5))).toBe('2026-01-05');
  });

  it('devolve vazio para data inválida', () => {
    expect(formatDayKey('não é data')).toBe('');
  });
});

describe('daysSince', () => {
  const agora = local(2026, 3, 10, 9);

  it('conta dias de calendário, não múltiplos de 24h', () => {
    // 23h de ontem para 9h de hoje é menos de 24h, mas é 1 dia de calendário.
    expect(daysSince(local(2026, 3, 9, 23), agora)).toBe(1);
  });

  it('mesmo dia é zero mesmo com horas de diferença', () => {
    expect(daysSince(local(2026, 3, 10, 1), agora)).toBe(0);
    expect(daysSince(local(2026, 3, 10, 23), agora)).toBe(0);
  });

  it('futuro é negativo', () => {
    expect(daysSince(local(2026, 3, 12), agora)).toBe(-2);
  });
});

describe('formatRelative', () => {
  it('trata vazio sem quebrar', () => {
    expect(formatRelative(undefined)).toBe('');
    expect(formatRelative(null)).toBe('');
    expect(formatRelative('')).toBe('');
  });

  it('diz hoje e ontem', () => {
    const hoje = new Date();
    expect(formatRelative(hoje)).toBe('hoje');
    expect(formatRelative(new Date(hoje.getTime() - 86400000))).toBe('ontem');
  });

  it('usa "N dias atrás" dentro da semana', () => {
    const hoje = new Date();
    expect(formatRelative(new Date(hoje.getTime() - 3 * 86400000))).toBe('3 dias atrás');
  });

  it('vira data a partir de 7 dias', () => {
    const hoje = new Date();
    const resultado = formatRelative(new Date(hoje.getTime() - 10 * 86400000));
    expect(resultado).not.toMatch(/dias atrás/);
    expect(resultado).toMatch(/\d{2}/);
  });
});

describe('formatShortDate', () => {
  it('omite o ano quando é o corrente', () => {
    const esteAno = new Date().getFullYear();
    expect(formatShortDate(local(esteAno, 3, 12))).not.toContain(String(esteAno));
  });

  it('inclui o ano quando difere do atual', () => {
    expect(formatShortDate(local(2020, 3, 12))).toContain('2020');
  });
});

describe('formatRelativeDateTime', () => {
  it('junta dia relativo e hora', () => {
    const hoje = new Date();
    hoje.setHours(14, 32, 0, 0);
    expect(formatRelativeDateTime(hoje)).toMatch(/^hoje, \d{2}:\d{2}$/);
  });

  it('vazio para entrada ausente', () => {
    expect(formatRelativeDateTime(null)).toBe('');
  });
});

describe('formatDateTime', () => {
  it('traz data e hora completas', () => {
    const resultado = formatDateTime(local(2026, 3, 12, 14, 32));
    expect(resultado).toContain('2026');
    expect(resultado).toMatch(/\d{2}:\d{2}/);
  });
});

describe('formatDuration', () => {
  it('mostra segundos abaixo de um minuto', () => {
    // Arredondar antes de comparar faria 30s virar "1 min" — o bug que já corrigi antes.
    expect(formatDuration(30)).toBe('30s');
    expect(formatDuration(59)).toBe('59s');
  });

  it('vira minutos a partir de 60s', () => {
    expect(formatDuration(60)).toBe('1 min');
    expect(formatDuration(600)).toBe('10 min');
  });

  it('vira horas a partir de 60 min', () => {
    expect(formatDuration(3600)).toBe('1h');
    expect(formatDuration(4800)).toBe('1h 20min');
  });

  it('vazio para zero, negativo ou ausente', () => {
    expect(formatDuration(0)).toBe('');
    expect(formatDuration(-5)).toBe('');
    expect(formatDuration(undefined)).toBe('');
  });
});

describe('lastDayKeys', () => {
  it('devolve N dias do mais antigo ao mais recente', () => {
    const chaves = lastDayKeys(3, local(2026, 3, 10));
    expect(chaves).toEqual(['2026-03-08', '2026-03-09', '2026-03-10']);
  });

  it('atravessa virada de mês', () => {
    expect(lastDayKeys(3, local(2026, 3, 1))).toEqual(['2026-02-27', '2026-02-28', '2026-03-01']);
  });

  it('atravessa ano bissexto', () => {
    expect(lastDayKeys(2, local(2028, 3, 1))).toEqual(['2028-02-29', '2028-03-01']);
  });
});

describe('computeStreak', () => {
  const hoje = local(2026, 3, 10);

  it('zero sem registro', () => {
    expect(computeStreak([], hoje)).toBe(0);
  });

  it('conta dias consecutivos terminando hoje', () => {
    expect(computeStreak(['2026-03-10', '2026-03-09', '2026-03-08'], hoje)).toBe(3);
  });

  it('não quebra quando hoje ainda não tem registro', () => {
    // O dia corrente pode não ter atividade ainda sem zerar a sequência.
    expect(computeStreak(['2026-03-09', '2026-03-08'], hoje)).toBe(2);
  });

  it('para no primeiro buraco', () => {
    expect(computeStreak(['2026-03-10', '2026-03-09', '2026-03-07'], hoje)).toBe(2);
  });

  it('zera quando o último registro é anterior a ontem', () => {
    expect(computeStreak(['2026-03-05'], hoje)).toBe(0);
  });

  it('aceita Set além de array', () => {
    expect(computeStreak(new Set(['2026-03-10', '2026-03-09']), hoje)).toBe(2);
  });

  it('ignora duplicatas do mesmo dia', () => {
    expect(computeStreak(['2026-03-10', '2026-03-10', '2026-03-09'], hoje)).toBe(2);
  });
});
