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
  
  // LOG PARA DEBUG EM PRODUÇÃO
  console.log(`[ACL Debug] Checking feature '${feature}' for user role '${userRole}'`);

  // 1. Acesso total (Super Admin ou Power User)
  if (userRole === 'admin' || userFeatures.includes('*')) {
    console.log(`[ACL Debug] -> Granted via Admin/*`);
    return true;
  }

  // 2. Verifica nas permissões individuais (Override)
  if (userFeatures.includes(feature)) {
    console.log(`[ACL Debug] -> Granted via individual user feature`);
    return true;
  }

  // 3. Verifica nas permissões do grupo (Role)
  if (userRole) {
    // Tenta primeiro o dinâmico (Firestore), depois o padrão (Código)
    const rolePermissions = dynamicPermissions?.[userRole] || DEFAULT_ROLE_PERMISSIONS[userRole];
    
    console.log(`[ACL Debug] Dynamic Permissions Loaded for '${userRole}':`, dynamicPermissions?.[userRole] ? 'YES' : 'NO (Using Default)');
    console.log(`[ACL Debug] Final Role Permissions for '${userRole}':`, rolePermissions);

    if (rolePermissions) {
      // O grupo tem acesso total?
      if (rolePermissions.includes('*')) {
        console.log(`[ACL Debug] -> Granted via group wildcard *`);
        return true;
      }

      // O grupo tem essa permissão específica?
      if (rolePermissions.includes(feature)) {
        console.log(`[ACL Debug] -> Granted via group feature match`);
        return true;
      }
    }
  }

  console.log(`[ACL Debug] -> Denied`);
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
