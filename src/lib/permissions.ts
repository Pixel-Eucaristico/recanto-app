import { DEFAULT_ROLE_PERMISSIONS } from '@/config/permissions';
import { Role } from '@/features/auth/types/user';

interface PermissibleUser {
  role?: Role;
  features?: string[];
}

/**
 * Função central para verificar se um usuário possui uma permissão específica.
 * 
 * Regras de resolução:
 * 1. Se o usuário for Admin (role real) ou possuir a feature '*', tem acesso total.
 * 2. Se a feature solicitada estiver na lista de features individuais do usuário, tem acesso.
 * 3. Se a feature solicitada estiver na lista de features de grupo (Firestore ou Default), tem acesso.
 * 
 * @param user Usuário (vindo do AuthContext ou banco)
 * @param feature String da permissão (ex: 'manage:calendar')
 * @param dynamicPermissions Mapa de permissões de grupo carregado do Firestore (opcional)
 * @returns boolean
 */
const ACL_DEBUG = process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ACL_DEBUG === 'true';
const aclLog = (...args: unknown[]) => { if (ACL_DEBUG) console.log('[ACL Debug]', ...args); };

export function hasFeature(
  user: PermissibleUser | null | undefined,
  feature: string,
  dynamicPermissions?: Record<string, string[]>
): boolean {
  if (!user) return false;

  const userFeatures = user.features || [];
  const userRole = user.role;

  aclLog(`Checking feature '${feature}' for user role '${userRole}'`);

  // 1. Acesso total (Super Admin ou Power User)
  if (userRole === 'admin' || userFeatures.includes('*')) {
    aclLog(`-> Granted via Admin/*`);
    return true;
  }

  // 2. Verifica nas permissões individuais (Override)
  if (userFeatures.includes(feature)) {
    aclLog(`-> Granted via individual user feature`);
    return true;
  }

  // 3. Verifica nas permissões do grupo (Role)
  if (userRole) {
    // Tenta primeiro o dinâmico (Firestore), depois o padrão (Código)
    const rolePermissions = dynamicPermissions?.[userRole] || DEFAULT_ROLE_PERMISSIONS[userRole];

    aclLog(`Dynamic Permissions for '${userRole}':`, dynamicPermissions?.[userRole] ? 'YES' : 'NO (Default)');
    aclLog(`Final Role Permissions for '${userRole}':`, rolePermissions);

    if (rolePermissions) {
      // O grupo tem acesso total?
      if (rolePermissions.includes('*')) {
        aclLog(`-> Granted via group wildcard *`);
        return true;
      }

      // O grupo tem essa permissão específica?
      if (rolePermissions.includes(feature)) {
        aclLog(`-> Granted via group feature match`);
        return true;
      }
    }
  }

  aclLog(`-> Denied`);
  return false;
}

// ─── Helpers semânticos ────────────────────────────────────────────────────
// Use estes em vez de repetir `user.role === 'admin' || user.features.includes(...)`
// pelas páginas. Aceitam tanto features cruas (com `dynamicPermissions`) quanto já
// resolvidas por `getAvailableFeatures` / `useCurrentUser`.

/** Fundador/admin — acesso total. */
export function isAdminUser(user: PermissibleUser | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'admin' || (user.features ?? []).includes('*');
}

/** Pode criar/editar trilhas, módulos e aulas. */
export function canManageFormation(
  user: PermissibleUser | null | undefined,
  dynamicPermissions?: Record<string, string[]>,
): boolean {
  return hasFeature(user, 'manage:formation', dynamicPermissions);
}

/** Pode ver progresso e escritos dos alunos. */
export function canReviewFormation(
  user: PermissibleUser | null | undefined,
  dynamicPermissions?: Record<string, string[]>,
): boolean {
  return hasFeature(user, 'review:formation', dynamicPermissions);
}

/**
 * É formador DESTA trilha — definição canônica de "dono do curso".
 *
 * Só `formator_ids` conta. Ter `manage:formation` autoriza editar cursos, não
 * acompanhar os alunos de um curso alheio. Admin sempre passa.
 */
export function isFormatorOfTrack(
  user: (PermissibleUser & { id?: string }) | null | undefined,
  track: { formator_ids?: string[] } | null | undefined,
): boolean {
  if (!user) return false;
  if (isAdminUser(user)) return true;
  if (!user.id) return false;
  return Boolean(track?.formator_ids?.includes(user.id));
}

/**
 * Retorna todas as permissões efetivas do usuário (somando grupo + individuais).
 */
export function getAvailableFeatures(
  user: PermissibleUser | null | undefined,
  dynamicPermissions?: Record<string, string[]>
): string[] {
  if (!user) return [];

  const rolePermissions = user.role ? (dynamicPermissions?.[user.role] || DEFAULT_ROLE_PERMISSIONS[user.role] || []) : [];
  const individualPermissions = user.features || [];

  // Se for admin, retorna '*' que representa tudo
  if (user.role === 'admin' || individualPermissions.includes('*') || rolePermissions.includes('*')) {
    return ['*'];
  }

  // Union das permissões sem duplicatas
  const allFeatures = new Set([...rolePermissions, ...individualPermissions]);
  return Array.from(allFeatures);
}
