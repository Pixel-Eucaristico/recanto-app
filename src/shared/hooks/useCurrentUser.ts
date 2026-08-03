'use client';

import { useMemo } from 'react';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';
import { getAvailableFeatures } from '@/lib/permissions';
import { CurrentUser } from '@/shared/types/role';

/**
 * Usuário logado com as features JÁ RESOLVIDAS (individuais + herdadas do role).
 *
 * O doc do Firestore guarda apenas as features individuais; as do grupo vêm de
 * `permissions_config` (ou de DEFAULT_ROLE_PERMISSIONS). Consumir `user.features`
 * cru esconderia permissões que o usuário tem por role — era a causa de o formador
 * não enxergar a área de acompanhamento.
 *
 * Admin é representado por `['*']` — sempre cheque `includes('*')` ou use `useAccess`.
 */
export function useCurrentUser(): CurrentUser | null {
  const { user, dynamicPermissions } = useAuth();
  const id = user?.id;
  const name = user?.name;
  const role = user?.role ?? null;
  const birthdate = user?.birthdate;
  const featuresKey = getAvailableFeatures(user, dynamicPermissions).join(',');

  return useMemo<CurrentUser | null>(() => {
    if (!id) return null;
    return {
      id,
      name: name ?? '',
      role,
      features: featuresKey ? featuresKey.split(',') : [],
      birthdate,
    };
  }, [id, name, role, featuresKey, birthdate]);
}
