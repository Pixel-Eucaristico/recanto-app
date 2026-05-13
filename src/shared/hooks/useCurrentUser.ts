'use client';

import { useMemo } from 'react';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';
import { CurrentUser } from '@/shared/types/role';

export function useCurrentUser(): CurrentUser | null {
  const { user } = useAuth();
  const id = user?.id;
  const name = user?.name;
  const role = user?.role ?? null;
  const featuresKey = (user?.features ?? []).join(',');
  const birthdate = user?.birthdate;

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
