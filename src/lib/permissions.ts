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
export function hasFeature(
  user: PermissibleUser | null | undefined, 
  feature: string,
  dynamicPermissions?: Record<string, string[]>
): boolean {
  if (!user) return false;

  const userFeatures = user.features || [];
  const userRole = user.role;

  // 1. Acesso total (Super Admin ou Power User)
  if (userRole === 'admin' || userFeatures.includes('*')) {
    return true;
  }

  // 2. Verifica nas permissões individuais (Override)
  if (userFeatures.includes(feature)) {
    return true;
  }

  // 3. Verifica nas permissões do grupo (Role)
  if (userRole) {
    // Tenta primeiro o dinâmico (Firestore), depois o padrão (Código)
    const rolePermissions = dynamicPermissions?.[userRole] || DEFAULT_ROLE_PERMISSIONS[userRole];
    
    if (rolePermissions) {
      // O grupo tem acesso total?
      if (rolePermissions.includes('*')) {
        return true;
      }

      // O grupo tem essa permissão específica?
      if (rolePermissions.includes(feature)) {
        return true;
      }
    }
  }

  return false;
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
