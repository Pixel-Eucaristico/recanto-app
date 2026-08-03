'use client';

import { useMemo } from 'react';
import { useAuth } from '@/features/dashboard/contexts/AuthContext';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import {
  canManageFormation as canManageFormationFn,
  canReviewFormation as canReviewFormationFn,
  isAdminUser,
  isFormatorOfTrack as isFormatorOfTrackFn,
} from '@/lib/permissions';
import type { CurrentUser } from '@/shared/types/role';

export interface Access {
  user: CurrentUser | null;
  /** True enquanto auth ou `permissions_config` ainda carregam — não negue acesso nesse estado. */
  loading: boolean;
  /** Fundador/admin. */
  isAdmin: boolean;
  can: (feature: string) => boolean;
  /** Pode criar/editar trilhas, módulos e aulas. */
  canManageFormation: boolean;
  /** Pode ver progresso e escritos dos alunos. */
  canReviewFormation: boolean;
  /** Vê a área de formador (admin OU quem revisa alunos). */
  isFormatorLike: boolean;
  /** É formador desta trilha específica (via `formator_ids`). Admin sempre true. */
  isFormatorOfTrack: (track?: { formator_ids?: string[] } | null) => boolean;
}

/**
 * Ponto único de checagem de permissão nas páginas.
 *
 * Substitui o padrão espalhado `user.role === 'admin' || user.features.includes('x')`,
 * que ignorava as features herdadas do role.
 */
export function useAccess(): Access {
  const { loading, permissionsLoaded, dynamicPermissions, can } = useAuth();
  const user = useCurrentUser();

  const isAdmin = isAdminUser(user);
  const canManageFormation = canManageFormationFn(user, dynamicPermissions);
  const canReviewFormation = canReviewFormationFn(user, dynamicPermissions);

  return useMemo<Access>(() => ({
    user,
    loading: loading || !permissionsLoaded,
    isAdmin,
    can,
    canManageFormation,
    canReviewFormation,
    isFormatorLike: isAdmin || canReviewFormation,
    isFormatorOfTrack: (track) => isFormatorOfTrackFn(user, track),
  }), [user, loading, permissionsLoaded, isAdmin, canManageFormation, canReviewFormation, can]);
}
