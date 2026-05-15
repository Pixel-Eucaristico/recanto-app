/**
 * Whitelist de admins autorizados a usar DevRoleSelector e ferramentas similares.
 *
 * Lista vem de env var `ADMIN_WHITELIST` (comma-separated emails ou UIDs).
 * Mantém secrets fora do git. Local: define em `.env.local`. Prod: define em Vercel env.
 *
 * Vazio = ninguém (DevRoleSelector fica oculto).
 *
 * SEGURANÇA: combinado com checks de role + NODE_ENV no componente.
 */

const ADMIN_WHITELIST: string[] = (process.env.ADMIN_WHITELIST ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

export function isWhitelistedAdmin(
  email: string | null | undefined,
  uid?: string | null,
): boolean {
  if (ADMIN_WHITELIST.length === 0) return false;
  return Boolean(
    (email && ADMIN_WHITELIST.includes(email)) ||
    (uid && ADMIN_WHITELIST.includes(uid)),
  );
}
