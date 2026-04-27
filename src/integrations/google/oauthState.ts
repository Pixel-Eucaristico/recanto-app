/**
 * Encoding/decoding do parâmetro `state` do OAuth Google.
 * Carrega: integração + uid + returnTo (URL pra voltar após sucesso/erro).
 */

export type GoogleIntegration = 'youtube' | 'calendar' | 'gmail';

export interface GoogleOAuthState {
  /** Qual integração disparou o flow. */
  integration: GoogleIntegration;
  /** UID do usuário Firebase. */
  uid: string;
  /** Caminho relativo pra redirecionar após o callback (ex: '/app/dashboard/admin/formation'). */
  returnTo: string;
}

export function encodeState(state: GoogleOAuthState): string {
  const json = JSON.stringify(state);
  // base64url para evitar caracteres especiais no query
  return Buffer.from(json, 'utf8').toString('base64url');
}

export function decodeState(raw: string): GoogleOAuthState | null {
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as GoogleOAuthState;
    if (!parsed.integration || !parsed.uid || !parsed.returnTo) return null;
    return parsed;
  } catch {
    return null;
  }
}
