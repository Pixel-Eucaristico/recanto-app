'use client';

import { useAuth } from '@/features/dashboard/contexts/AuthContext';
import { CurrentUser } from '@/shared/types/role';

export function useCurrentUser(): CurrentUser | null {
  const { user } = useAuth();
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    role: user.role ?? null,
    features: user.features ?? [],
  };
}
