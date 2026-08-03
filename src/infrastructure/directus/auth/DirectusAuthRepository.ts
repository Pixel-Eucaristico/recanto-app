import { directusHttpClient } from '../DirectusHttpClient';
import { directusUserRepository } from '../users/DirectusUserRepository';
import type { AuthRepository, SocialAuthProvider } from '@/domain/auth/AuthRepository';
import type { Role } from '@/features/auth/types/user';
import type { FirebaseUser } from '@/types/firebase-entities';

interface DirectusUserMe {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  avatar?: string | null;
}

interface DirectusLoginResponse {
  access_token: string;
  refresh_token?: string;
  expires?: number;
}

function displayName(user: DirectusUserMe): string {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return name || user.email.split('@')[0] || 'Usuario';
}

export class DirectusAuthRepository implements AuthRepository {
  async register(
    email: string,
    password: string,
    name: string,
    role: Role = 'visitante',
    birthdate?: string,
  ): Promise<FirebaseUser> {
    const [firstName, ...lastNameParts] = name.trim().split(/\s+/);

    await directusHttpClient.request('/users/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        first_name: firstName || name,
        last_name: lastNameParts.join(' ') || undefined,
      }),
    });

    const logged = await this.login(email, password);
    if (!logged) throw new Error('Registro Directus criado, mas login inicial falhou.');

    return directusUserRepository.update(logged.id, {
      name,
      role,
      birthdate,
    } as Partial<Omit<FirebaseUser, 'id'>>).then(user => user ?? logged);
  }

  async login(email: string, password: string): Promise<FirebaseUser | null> {
    const tokens = await directusHttpClient.request<DirectusLoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, mode: 'json' }),
    });

    directusHttpClient.setTokens(tokens);
    return this.getCurrentUser();
  }

  async loginWithProvider(provider: SocialAuthProvider): Promise<FirebaseUser> {
    const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? process.env.DIRECTUS_URL;
    if (!baseUrl || typeof window === 'undefined') {
      throw new Error('Login social Directus precisa rodar no browser com NEXT_PUBLIC_DIRECTUS_URL.');
    }

    const redirect = encodeURIComponent(window.location.href);
    window.location.href = `${baseUrl.replace(/\/$/, '')}/auth/oauth/${provider}?redirect=${redirect}`;
    throw new Error('Redirecionando para login social Directus.');
  }

  async logout(): Promise<void> {
    const refreshToken = directusHttpClient.getRefreshToken();

    if (refreshToken) {
      await directusHttpClient.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken, mode: 'json' }),
      });
    }

    directusHttpClient.clearTokens();
  }

  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    let cancelled = false;

    this.getCurrentUser()
      .then(user => {
        if (!cancelled) callback(user);
      })
      .catch(() => {
        if (!cancelled) callback(null);
      });

    const onStorage = (event: StorageEvent) => {
      if (event.key?.startsWith('recanto.directus.')) {
        this.getCurrentUser().then(callback).catch(() => callback(null));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
    }

    return () => {
      cancelled = true;
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', onStorage);
      }
    };
  }

  async getCurrentUser(): Promise<FirebaseUser | null> {
    if (!directusHttpClient.hasSession()) return null;

    const me = await directusHttpClient.request<DirectusUserMe>('/users/me');
    const existing = await directusUserRepository.get(me.id);

    if (existing) return existing;

    return directusUserRepository.create({
      name: displayName(me),
      email: me.email,
      role: 'visitante',
      photo_url: me.avatar ?? null,
      created_at: new Date().toISOString(),
    } as Omit<FirebaseUser, 'id'>);
  }

  async linkGoogleAccount(): Promise<void> {
    throw new Error('Vincular Google no Directus deve ser configurado via OAuth provider.');
  }

  async createLocalPassword(): Promise<void> {
    throw new Error('Criacao de senha local no Directus deve usar o fluxo de reset/password do Directus.');
  }

  async updateProfilePicture(uid: string, photoUrl: string): Promise<void> {
    await directusUserRepository.update(uid, { photo_url: photoUrl });
  }
}

export const directusAuthRepository = new DirectusAuthRepository();
