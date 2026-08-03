import {
  buildTrackProgress,
  formatProgressCount,
  formatProgressPercent,
  progressBadgeClass,
} from '@/domain/formation/progress';

/**
 * O bug original: `percent = concluídas ÷ aulas que o aluno abriu`. Como o registro
 * de progresso só nasce quando o aluno interage com a aula, numerador e denominador
 * cresciam juntos — quem abriu 3 de 40 aulas e concluiu as 3 via 100%.
 */

describe('buildTrackProgress', () => {
  it('calcula sobre o currículo inteiro — o caso do bug', () => {
    const p = buildTrackProgress(3, 40);
    expect(p.percent).toBe(8);
    expect(p.total).toBe(40);
  });

  it('não inventa percentual quando o total é desconhecido', () => {
    for (const total of [null, undefined, 0]) {
      const p = buildTrackProgress(3, total);
      expect(p.percent).toBeNull();
      expect(p.total).toBeNull();
      expect(p.completed).toBe(3);
    }
  });

  it('trava em 100 quando o progresso legado excede o currículo atual', () => {
    // Aula concluída que depois saiu da trilha não pode gerar 120%.
    expect(buildTrackProgress(12, 10).percent).toBe(100);
  });

  it('zero concluídas é 0%, não null', () => {
    expect(buildTrackProgress(0, 40).percent).toBe(0);
  });

  it('conclusão total é 100%', () => {
    expect(buildTrackProgress(40, 40).percent).toBe(100);
  });

  it('arredonda para inteiro', () => {
    expect(buildTrackProgress(1, 3).percent).toBe(33);
    expect(buildTrackProgress(2, 3).percent).toBe(67);
  });

  it('ignora total negativo', () => {
    expect(buildTrackProgress(3, -5).percent).toBeNull();
  });
});

describe('formatProgressCount', () => {
  it('mostra "N de M" com total conhecido', () => {
    expect(formatProgressCount(buildTrackProgress(3, 40))).toBe('3 de 40');
  });

  it('cai para contagem absoluta sem total', () => {
    expect(formatProgressCount(buildTrackProgress(3, null))).toBe('3 aulas concluídas');
  });

  it('concorda no singular', () => {
    expect(formatProgressCount(buildTrackProgress(1, null))).toBe('1 aula concluída');
  });

  it('plural correto no zero', () => {
    expect(formatProgressCount(buildTrackProgress(0, null))).toBe('0 aulas concluídas');
  });
});

describe('formatProgressPercent', () => {
  it('formata com sinal de porcentagem', () => {
    expect(formatProgressPercent(buildTrackProgress(3, 40))).toBe('8%');
  });

  it('usa travessão em vez de 0% quando não há total', () => {
    // Mostrar "0%" seria tão mentiroso quanto "100%".
    expect(formatProgressPercent(buildTrackProgress(3, null))).toBe('—');
  });
});

describe('progressBadgeClass', () => {
  it('usa classes literais completas — Tailwind não resolve em runtime', () => {
    expect(progressBadgeClass(buildTrackProgress(40, 40))).toBe('badge-success');
    expect(progressBadgeClass(buildTrackProgress(20, 40))).toBe('badge-info');
    expect(progressBadgeClass(buildTrackProgress(2, 40))).toBe('badge-ghost');
  });

  it('é neutro sem total', () => {
    expect(progressBadgeClass(buildTrackProgress(3, null))).toBe('badge-ghost');
  });
});
