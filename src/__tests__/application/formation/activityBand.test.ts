jest.mock('@/infrastructure/formation/TrackRepository', () => ({ trackRepository: {} }));
jest.mock('@/infrastructure/formation/ProgressRepository', () => ({ progressRepository: {} }));
jest.mock('@/infrastructure/formation/LessonRepository', () => ({ lessonRepository: {} }));
jest.mock('@/infrastructure/enrollment/TrackEnrollmentRepository', () => ({ trackEnrollmentRepository: {} }));
jest.mock('@/application/formation/FormationService', () => ({ formationService: {} }));
jest.mock('@/services/firebase', () => ({ userService: {} }));

import { activityBand, ACTIVITY_BAND_LABELS } from '@/application/formation/FormatorService';

/**
 * A versão anterior classificava só `<=7d` e `>14d`. Aluno parado entre 7 e 14 dias
 * não entrava em nenhum contador nem em nenhuma aba — desaparecia do painel sem
 * aviso. Estes testes travam a exaustividade das faixas.
 */

function diasAtras(dias: number): string {
  return new Date(Date.now() - dias * 86_400_000).toISOString();
}

describe('activityBand', () => {
  it('sem atividade é "never"', () => {
    expect(activityBand(null)).toBe('never');
    expect(activityBand(undefined)).toBe('never');
    expect(activityBand('')).toBe('never');
  });

  it('até 7 dias é "active"', () => {
    expect(activityBand(diasAtras(0))).toBe('active');
    expect(activityBand(diasAtras(3))).toBe('active');
    expect(activityBand(diasAtras(6.9))).toBe('active');
  });

  it('entre 7 e 14 dias é "attention" — a faixa que sumia', () => {
    expect(activityBand(diasAtras(7.5))).toBe('attention');
    expect(activityBand(diasAtras(10))).toBe('attention');
    expect(activityBand(diasAtras(13.9))).toBe('attention');
  });

  it('acima de 14 dias é "stale"', () => {
    expect(activityBand(diasAtras(15))).toBe('stale');
    expect(activityBand(diasAtras(90))).toBe('stale');
  });

  it('as faixas são exaustivas — nenhum aluno fica sem classificação', () => {
    const faixas = new Set<string>();
    for (let dias = 0; dias <= 40; dias += 0.5) {
      faixas.add(activityBand(diasAtras(dias)));
    }
    faixas.add(activityBand(null));

    expect(faixas).toEqual(new Set(['active', 'attention', 'stale', 'never']));
  });

  it('toda faixa tem rótulo em pt-BR', () => {
    for (const banda of ['active', 'attention', 'stale', 'never'] as const) {
      expect(ACTIVITY_BAND_LABELS[banda]).toBeTruthy();
      expect(typeof ACTIVITY_BAND_LABELS[banda]).toBe('string');
    }
  });

  it('data futura conta como ativo, não quebra', () => {
    // Relógio de cliente adiantado não pode jogar o aluno para "parado".
    expect(activityBand(diasAtras(-1))).toBe('active');
  });
});
