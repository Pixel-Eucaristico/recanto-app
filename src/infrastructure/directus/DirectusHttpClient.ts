export interface DirectusAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires?: number;
}

const ACCESS_TOKEN_KEY = 'recanto.directus.access_token';
const REFRESH_TOKEN_KEY = 'recanto.directus.refresh_token';

function getDirectusUrl(): string {
  const url =
    typeof window === 'undefined'
      ? process.env.DIRECTUS_URL
      : process.env.NEXT_PUBLIC_DIRECTUS_URL;

  if (!url) {
    throw new Error('DIRECTUS_URL/NEXT_PUBLIC_DIRECTUS_URL nao configurada.');
  }

  return url.replace(/\/$/, '');
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export class DirectusHttpClient {
  private accessToken?: string;
  private refreshToken?: string;

  constructor(accessToken?: string) {
    this.accessToken = accessToken;

    if (canUseStorage()) {
      this.accessToken ??= window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? undefined;
      this.refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY) ?? undefined;
    }
  }

  setTokens(tokens: DirectusAuthTokens): void {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;

    if (canUseStorage()) {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
      if (tokens.refresh_token) {
        window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
      }
    }
  }

  clearTokens(): void {
    this.accessToken = undefined;
    this.refreshToken = undefined;

    if (canUseStorage()) {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  getRefreshToken(): string | undefined {
    return this.refreshToken;
  }

  hasSession(): boolean {
    return Boolean(this.accessToken);
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${getDirectusUrl()}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
        ...options.headers,
      },
    });

    if (response.status === 204) return undefined as T;

    const text = await response.text();
    const body = text ? JSON.parse(text) : undefined;

    if (!response.ok) {
      const message = body?.errors?.[0]?.message ?? body?.error?.message ?? text;
      throw new Error(message || `Directus request failed: ${response.status}`);
    }

    return (body?.data ?? body) as T;
  }
}

export const directusHttpClient = new DirectusHttpClient();
