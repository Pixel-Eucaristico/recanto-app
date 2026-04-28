import { auth, googleProvider, facebookProvider, twitterProvider } from '@/domains/auth/services/firebaseClient';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, signOut, onAuthStateChanged,
  type AuthProvider, linkWithPopup, updatePassword,
} from 'firebase/auth';
import { userService } from './UserService';
import { createUserProfile } from './createUserProfile';
import type { FirebaseUser } from '@/types/firebase-entities';
import type { Role } from '@/features/auth/types/user';

const DEV_LOG = process.env.NODE_ENV !== 'production';
const devLog = (...args: unknown[]) => { if (DEV_LOG) console.log(...args); };
const devWarn = (...args: unknown[]) => { if (DEV_LOG) console.warn(...args); };

class AuthService {
  async register(email: string, password: string, name: string, role: Role = 'visitante'): Promise<FirebaseUser> {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      return await createUserProfile(user.uid, name, email, role);
    } catch (error: any) {
      console.error('Error registering user:', error);
      throw new Error(error.message || 'Erro ao registrar usuário');
    }
  }

  async login(email: string, password: string): Promise<FirebaseUser | null> {
    try {
      const { user: { uid, displayName, email: userEmail } } = await signInWithEmailAndPassword(auth, email, password);
      try {
        const user = await userService.get(uid);
        if (user) return user;
        devLog(`[AuthService] Criando perfil inicial para: ${uid}`);
        return await createUserProfile(uid, displayName || userEmail!.split('@')[0], userEmail!, 'visitante');
      } catch (firestoreError: any) {
        console.error('[AuthService] Firestore offline no login:', firestoreError.message);
        return { id: uid, name: displayName || userEmail!.split('@')[0], email: userEmail!, role: null, photo_url: null, created_at: new Date().toISOString() };
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    }
  }

  async loginWithProvider(providerName: 'google' | 'facebook' | 'twitter'): Promise<FirebaseUser> {
    try {
      const providerMap: Record<string, AuthProvider> = { google: googleProvider, facebook: facebookProvider, twitter: twitterProvider };
      const provider = providerMap[providerName];
      if (!provider) throw new Error('Provedor inválido');

      const { user: { uid, displayName, email, photoURL } } = await signInWithPopup(auth, provider);
      try {
        const user = await userService.get(uid);
        if (user) return user;
        return await createUserProfile(uid, displayName || email!.split('@')[0], email!, 'visitante', photoURL || null);
      } catch (firestoreError: any) {
        console.error('[AuthService] Firestore offline no login social:', firestoreError.message);
        return { id: uid, name: displayName || email!.split('@')[0], email: email!, role: null, photo_url: photoURL || null, created_at: new Date().toISOString() };
      }
    } catch (error: any) {
      console.error('Error logging in with provider:', error);
      if (error.code === 'auth/popup-blocked') throw new Error('O popup foi bloqueado pelo navegador. Permita popups e tente novamente.');
      if (error.code === 'auth/account-exists-with-different-credential') throw new Error('Este email já está cadastrado. Faça login com sua senha e vincule a conta no Perfil.');
      throw new Error(error.message || 'Erro ao fazer login com provedor');
    }
  }

  async linkGoogleAccount(): Promise<void> {
    try {
      if (!auth.currentUser) throw new Error('Nenhum usuário logado');
      await linkWithPopup(auth.currentUser, googleProvider);
      devLog('✅ [AuthService] Conta Google vinculada.');
    } catch (error: any) {
      console.error('Error linking Google account:', error);
      if (error.code === 'auth/popup-blocked') throw new Error('O popup foi bloqueado pelo navegador.');
      throw new Error(error.message || 'Erro ao vincular conta Google');
    }
  }

  async createLocalPassword(password: string): Promise<void> {
    try {
      if (!auth.currentUser) throw new Error('Nenhum usuário logado');
      await updatePassword(auth.currentUser, password);
    } catch (error: any) {
      console.error('Error creating local password:', error);
      throw new Error(error.message || 'Erro ao criar senha local');
    }
  }

  async logout(): Promise<void> {
    try { await signOut(auth); }
    catch (error) { console.error('Error logging out:', error); throw error; }
  }

  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) { devLog(`🔓 [AuthService] Usuário deslogado`); callback(null); return; }

      devLog(`🔄 [AuthService] onAuthStateChange: ${firebaseUser.uid}`);
      try {
        const user = await userService.get(firebaseUser.uid);
        if (user) { devLog(`✅ [AuthService] Usuário: ${user.email}, role: ${user.role}`); callback(user); return; }

        devWarn(`⚠️ [AuthService] Não encontrado no Firestore — criando perfil: ${firebaseUser.uid}`);
        const newUser = await createUserProfile(
          firebaseUser.uid,
          firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
          firebaseUser.email || '',
          'visitante',
          firebaseUser.photoURL || null,
        );
        callback(newUser);
      } catch (error: any) {
        console.error(`❌ [AuthService] Firestore offline:`, error.message);
        callback({ id: firebaseUser.uid, name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário', email: firebaseUser.email || '', role: null, photo_url: firebaseUser.photoURL || null, created_at: new Date().toISOString() });
      }
    });
  }

  async getCurrentUser(): Promise<FirebaseUser | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    try {
      const user = await userService.get(firebaseUser.uid);
      if (user) return user;
      if (firebaseUser.email) return await createUserProfile(firebaseUser.uid, firebaseUser.displayName || firebaseUser.email.split('@')[0], firebaseUser.email, 'visitante', firebaseUser.photoURL || null);
    } catch (error: any) {
      console.error('[AuthService] Erro ao buscar usuário atual:', error.message);
    }
    return null;
  }

  async updateProfilePicture(uid: string, photoUrl: string): Promise<void> {
    try { await userService.update(uid, { photo_url: photoUrl }); }
    catch (error) { console.error('Error updating profile picture:', error); throw error; }
  }
}

export const authService = new AuthService();
export default authService;
