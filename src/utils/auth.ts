/**
 * Utilitários para autenticação no lado do cliente
 * Usado como alternativa ao middleware para aplicações estáticas (output: export)
 */

// Verifica se o usuário está autenticado no lado do cliente
export function isAuthenticated(): boolean {
  // Verifica se está no lado do cliente
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Verifica se existe um token no localStorage
  const session = localStorage.getItem('session');
  return !!session;
}

// Salva o token de sessão no localStorage
export function setSession(token: string): void {
  localStorage.setItem('session', token);
}

// Remove o token de sessão do localStorage
export function clearSession(): void {
  localStorage.removeItem('session');
}

// Obtém o token de sessão do localStorage
export function getSession(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return localStorage.getItem('session');
}