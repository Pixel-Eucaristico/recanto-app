/**
 * Testes de useCurrentUser + useAccess.
 *
 * Bug original: `useCurrentUser` devolvia o array `features` cru do doc Firestore.
 * Um missionário tem `review:formation` pelo role e `features: []` no doc — a UI
 * lia o array vazio e escondia a área de formador. Só admin escapava, pelo fallback
 * `role === 'admin'`.
 */

import { renderHook } from '@testing-library/react';
import { hasFeature } from '@/lib/permissions';
import type { Role } from '@/features/auth/types/user';

const mockAuth = jest.fn();

jest.mock('@/features/dashboard/contexts/AuthContext', () => ({
  useAuth: () => mockAuth(),
}));

import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { useAccess } from '@/shared/hooks/useAccess';

interface AuthUser {
  id: string;
  name?: string;
  role: Role;
  features?: string[];
}

function setAuth(user: AuthUser | null, opts?: {
  dynamicPermissions?: Record<string, string[]>;
  loading?: boolean;
  permissionsLoaded?: boolean;
}) {
  const dynamicPermissions = opts?.dynamicPermissions ?? {};
  mockAuth.mockReturnValue({
    user,
    dynamicPermissions,
    loading: opts?.loading ?? false,
    permissionsLoaded: opts?.permissionsLoaded ?? true,
    can: (feature: string) => hasFeature(user, feature, dynamicPermissions),
  });
}

beforeEach(() => jest.clearAllMocks());

describe('useCurrentUser', () => {
  it('devolve null sem usuário', () => {
    setAuth(null);
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current).toBeNull();
  });

  it('resolve as features herdadas do role — a correção do bug', () => {
    setAuth({ id: 'u1', name: 'Formador', role: 'missionario', features: [] });

    const { result } = renderHook(() => useCurrentUser());

    expect(result.current?.features).toContain('review:formation');
    expect(result.current?.features).toContain('manage:formation');
  });

  it('representa admin como ["*"]', () => {
    setAuth({ id: 'u2', role: 'admin', features: [] });
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current?.features).toEqual(['*']);
  });

  it('mantém as features individuais além das do role', () => {
    setAuth({ id: 'u3', role: 'recantiano', features: ['review:formation'] });
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current?.features).toContain('review:formation');
    expect(result.current?.features).toContain('complete:formation');
  });

  it('aplica permissions_config do Firestore por cima dos defaults', () => {
    setAuth(
      { id: 'u4', role: 'recantiano', features: [] },
      { dynamicPermissions: { recantiano: ['apenas:isso'] } },
    );
    const { result } = renderHook(() => useCurrentUser());
    expect(result.current?.features).toEqual(['apenas:isso']);
  });

  it('mantém a identidade do objeto entre renders — evita loop de efeito', () => {
    setAuth({ id: 'u5', role: 'missionario', features: [] });
    const { result, rerender } = renderHook(() => useCurrentUser());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});

describe('useAccess', () => {
  it('formador enxerga a área de acompanhamento — o sintoma reportado', () => {
    setAuth({ id: 'u1', role: 'missionario', features: [] });

    const { result } = renderHook(() => useAccess());

    expect(result.current.isFormatorLike).toBe(true);
    expect(result.current.canReviewFormation).toBe(true);
    expect(result.current.canManageFormation).toBe(true);
    expect(result.current.isAdmin).toBe(false);
  });

  it('admin (fundador) enxerga tudo', () => {
    setAuth({ id: 'u2', role: 'admin', features: [] });

    const { result } = renderHook(() => useAccess());

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isFormatorLike).toBe(true);
    expect(result.current.can('qualquer:coisa')).toBe(true);
  });

  it('recantiano não vê a área de formador', () => {
    setAuth({ id: 'u3', role: 'recantiano', features: [] });

    const { result } = renderHook(() => useAccess());

    expect(result.current.isFormatorLike).toBe(false);
    expect(result.current.canReviewFormation).toBe(false);
    expect(result.current.can('complete:formation')).toBe(true);
  });

  it('segue carregando enquanto permissions_config não respondeu', () => {
    setAuth({ id: 'u4', role: 'missionario', features: [] }, { permissionsLoaded: false });

    const { result } = renderHook(() => useAccess());

    // Negar acesso nesse estado causaria flash de "Acesso restrito".
    expect(result.current.loading).toBe(true);
  });

  it('isFormatorOfTrack recorta por formator_ids', () => {
    setAuth({ id: 'u-formador', role: 'missionario', features: [] });

    const { result } = renderHook(() => useAccess());

    expect(result.current.isFormatorOfTrack({ formator_ids: ['u-formador'] })).toBe(true);
    expect(result.current.isFormatorOfTrack({ formator_ids: ['u-outro'] })).toBe(false);
    expect(result.current.isFormatorOfTrack(null)).toBe(false);
  });

  it('admin é formador de qualquer trilha', () => {
    setAuth({ id: 'u-admin', role: 'admin', features: [] });

    const { result } = renderHook(() => useAccess());

    expect(result.current.isFormatorOfTrack({ formator_ids: ['outro'] })).toBe(true);
  });

  it('sem usuário, nega tudo', () => {
    setAuth(null);

    const { result } = renderHook(() => useAccess());

    expect(result.current.user).toBeNull();
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isFormatorLike).toBe(false);
  });
});
