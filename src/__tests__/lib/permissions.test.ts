import {
  hasFeature,
  getAvailableFeatures,
  isAdminUser,
  canManageFormation,
  canReviewFormation,
  isFormatorOfTrack,
} from '@/lib/permissions';

/**
 * O bug que originou estes testes: features herdadas do role eram ignoradas, porque
 * o consumidor lia `user.features` cru em vez de resolver via `hasFeature`. Um
 * missionário (formador) tinha `review:formation` pelo role e mesmo assim não
 * enxergava a área de acompanhamento.
 */

const admin = { role: 'admin' as const, features: [] };
const missionario = { role: 'missionario' as const, features: [] };
const recantiano = { role: 'recantiano' as const, features: [] };
const benfeitor = { role: 'benfeitor' as const, features: [] };
const semRole = { role: null, features: [] };

describe('hasFeature', () => {
  it('nega quando não há usuário', () => {
    expect(hasFeature(null, 'review:formation')).toBe(false);
    expect(hasFeature(undefined, 'review:formation')).toBe(false);
  });

  it('libera tudo pra admin, mesmo sem features individuais', () => {
    expect(hasFeature(admin, 'review:formation')).toBe(true);
    expect(hasFeature(admin, 'feature:inexistente')).toBe(true);
  });

  it('libera tudo pra quem tem o wildcard individual', () => {
    const powerUser = { role: 'colaborador' as const, features: ['*'] };
    expect(hasFeature(powerUser, 'manage:formation')).toBe(true);
  });

  it('resolve features herdadas do role — o caso do bug', () => {
    expect(missionario.features).toHaveLength(0);
    expect(hasFeature(missionario, 'review:formation')).toBe(true);
    expect(hasFeature(missionario, 'manage:formation')).toBe(true);
    expect(hasFeature(missionario, 'complete:formation')).toBe(true);
  });

  it('respeita features individuais além das do role', () => {
    const comExtra = { role: 'recantiano' as const, features: ['review:formation'] };
    expect(hasFeature(comExtra, 'review:formation')).toBe(true);
  });

  it('nega feature que nem o role nem o usuário têm', () => {
    expect(hasFeature(recantiano, 'review:formation')).toBe(false);
    expect(hasFeature(recantiano, 'manage:formation')).toBe(false);
    expect(hasFeature(benfeitor, 'complete:formation')).toBe(false);
  });

  it('nega quando o usuário não tem role nem features', () => {
    expect(hasFeature(semRole, 'read:formation')).toBe(false);
  });

  it('permissions_config do Firestore sobrepõe os defaults do código', () => {
    const dynamic = { recantiano: ['review:formation'] };
    expect(hasFeature(recantiano, 'review:formation', dynamic)).toBe(true);
    // O dinâmico substitui a lista inteira do role, não faz merge.
    expect(hasFeature(recantiano, 'complete:formation', dynamic)).toBe(false);
  });

  it('wildcard vindo do permissions_config libera tudo', () => {
    const dynamic = { colaborador: ['*'] };
    expect(hasFeature({ role: 'colaborador', features: [] }, 'manage:formation', dynamic)).toBe(true);
  });
});

describe('getAvailableFeatures', () => {
  it('devolve lista vazia sem usuário', () => {
    expect(getAvailableFeatures(null)).toEqual([]);
  });

  it('colapsa admin em ["*"]', () => {
    expect(getAvailableFeatures(admin)).toEqual(['*']);
  });

  it('inclui as features do role mesmo sem features individuais', () => {
    const features = getAvailableFeatures(missionario);
    expect(features).toContain('review:formation');
    expect(features).toContain('manage:formation');
  });

  it('une role + individuais sem duplicar', () => {
    const user = { role: 'recantiano' as const, features: ['read:formation', 'review:formation'] };
    const features = getAvailableFeatures(user);
    expect(features.filter(f => f === 'read:formation')).toHaveLength(1);
    expect(features).toContain('review:formation');
  });

  it('usa permissions_config quando presente', () => {
    const features = getAvailableFeatures(recantiano, { recantiano: ['apenas:isso'] });
    expect(features).toEqual(['apenas:isso']);
  });
});

describe('isAdminUser', () => {
  it('reconhece admin por role', () => {
    expect(isAdminUser(admin)).toBe(true);
  });

  it('reconhece admin por wildcard nas features', () => {
    expect(isAdminUser({ role: 'missionario', features: ['*'] })).toBe(true);
  });

  it('nega missionário sem wildcard', () => {
    expect(isAdminUser(missionario)).toBe(false);
  });

  it('nega usuário ausente', () => {
    expect(isAdminUser(null)).toBe(false);
    expect(isAdminUser(undefined)).toBe(false);
  });
});

describe('canManageFormation / canReviewFormation', () => {
  it('missionário pode editar cursos e acompanhar alunos', () => {
    expect(canManageFormation(missionario)).toBe(true);
    expect(canReviewFormation(missionario)).toBe(true);
  });

  it('recantiano não pode nenhum dos dois', () => {
    expect(canManageFormation(recantiano)).toBe(false);
    expect(canReviewFormation(recantiano)).toBe(false);
  });

  it('admin pode ambos', () => {
    expect(canManageFormation(admin)).toBe(true);
    expect(canReviewFormation(admin)).toBe(true);
  });
});

describe('isFormatorOfTrack', () => {
  const track = { formator_ids: ['u-formador'] };

  it('aceita quem está em formator_ids', () => {
    expect(isFormatorOfTrack({ id: 'u-formador', ...missionario }, track)).toBe(true);
  });

  it('recusa formador de OUTRA trilha — é o recorte que fecha o vazamento', () => {
    expect(isFormatorOfTrack({ id: 'u-outro', ...missionario }, track)).toBe(false);
  });

  it('NÃO aceita apenas por ter manage:formation — escopo é por trilha', () => {
    const comManage = { id: 'u-outro', role: 'colaborador' as const, features: ['manage:formation'] };
    expect(isFormatorOfTrack(comManage, track)).toBe(false);
  });

  it('admin passa em qualquer trilha', () => {
    expect(isFormatorOfTrack({ id: 'u-admin', ...admin }, track)).toBe(true);
  });

  it('recusa quando a trilha não tem formadores', () => {
    expect(isFormatorOfTrack({ id: 'u-formador', ...missionario }, {})).toBe(false);
    expect(isFormatorOfTrack({ id: 'u-formador', ...missionario }, null)).toBe(false);
  });

  it('recusa usuário sem id', () => {
    expect(isFormatorOfTrack({ ...missionario }, track)).toBe(false);
  });

  it('recusa usuário ausente', () => {
    expect(isFormatorOfTrack(null, track)).toBe(false);
  });
});
