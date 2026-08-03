import type { Role } from '@/features/auth/types/user';
import type { FirebaseUser } from '@/types/firebase-entities';

export type SocialAuthProvider = 'google' | 'facebook' | 'twitter';

export interface AuthRepository {
  register(
    email: string,
    password: string,
    name: string,
    role?: Role,
    birthdate?: string,
  ): Promise<FirebaseUser>;
  login(email: string, password: string): Promise<FirebaseUser | null>;
  loginWithProvider(provider: SocialAuthProvider): Promise<FirebaseUser>;
  logout(): Promise<void>;
  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void;
  getCurrentUser(): Promise<FirebaseUser | null>;
  linkGoogleAccount(): Promise<void>;
  createLocalPassword(password: string): Promise<void>;
  updateProfilePicture(uid: string, photoUrl: string): Promise<void>;
}
