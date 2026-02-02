import {
  auth,
  firestore,
  googleProvider,
  facebookProvider,
  twitterProvider
} from '@/domains/auth/services/firebaseClient';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User as FirebaseAuthUser,
  onAuthStateChanged,
  AuthProvider,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { userService } from './UserService';
import { FirebaseUser } from '@/types/firebase-entities';
import { Role } from '@/features/auth/types/user';

class AuthService {
  /**
   * Registra novo usuário
   */
  async register(
    email: string,
    password: string,
    name: string,
    role: Role = null
  ): Promise<FirebaseUser> {
    try {
      // Cria usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      // Cria registro no Firestore usando UID do Firebase Auth
      const newUser = await this.createUserInDatabase(uid, name, email, role);

      return newUser;
    } catch (error: any) {
      console.error('Error registering user:', error);
      throw new Error(error.message || 'Erro ao registrar usuário');
    }
  }

  /**
   * Login de usuário
   */
  async login(email: string, password: string): Promise<FirebaseUser | null> {
    try {
      // Autentica no Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { uid, displayName, email: userEmail } = userCredential.user;

      // Busca dados do usuário no Firestore pelo UID do Firebase Auth
      let user = await userService.get(uid);

      // Se não existir, cria registro com UID do Firebase Auth
      if (!user) {
        user = await this.createUserInDatabase(uid, displayName || userEmail!.split('@')[0], userEmail!);
      }

      return user;
    } catch (error: any) {
      console.error('Error logging in:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    }
  }

  /**
   * Cria usuário no Firestore com UID do Firebase Auth
   * MIGRADO: Firestore ao invés do Realtime Database
   */
  private async createUserInDatabase(
    uid: string,
    name: string,
    email: string,
    role: Role = undefined,
    photo_url: string = undefined
  ): Promise<FirebaseUser> {
    const userData: FirebaseUser = {
      id: uid,
      name,
      email,
      role,
      photo_url,
      created_at: new Date().toISOString(),
    };

    // Usar o UID como ID do documento no Firestore
    const userRef = doc(firestore, 'users', uid);
    await setDoc(userRef, userData);

    return userData;
  }

  /**
   * Login com provedor social (Google, Facebook, Twitter)
   */
  async loginWithProvider(providerName: 'google' | 'facebook' | 'twitter'): Promise<FirebaseUser> {
    try {
      let provider: AuthProvider;

      switch (providerName) {
        case 'google':
          provider = googleProvider;
          break;
        case 'facebook':
          provider = facebookProvider;
          break;
        case 'twitter':
          provider = twitterProvider;
          break;
        default:
          throw new Error('Provedor inválido');
      }

      const result = await signInWithPopup(auth, provider);
      const { uid, displayName, email, photoURL } = result.user;

      // Busca ou cria usuário
      let user = await userService.get(uid);

      if (!user) {
        user = await this.createUserInDatabase(
          uid,
          displayName || email!.split('@')[0],
          email!,
          undefined, // role
          photoURL || undefined // photo
        );
      }

      return user;
    } catch (error: any) {
      console.error('Error logging in with provider:', error);
      throw new Error(error.message || 'Erro ao fazer login com provedor');
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  /**
   * Observa mudanças no estado de autenticação
   */
  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Busca dados completos do usuário pelo UID
        let user = await userService.get(firebaseUser.uid);

        // Se não existir, cria registro (login via Google, etc)
        if (!user) {
          user = await this.createUserInDatabase(
            firebaseUser.uid,
            firebaseUser.displayName || firebaseUser.email!.split('@')[0],
            firebaseUser.email!,
            undefined, // role
            firebaseUser.photoURL || undefined // photo
          );
        }

        callback(user);
      } else {
        callback(null);
      }
    });

    return unsubscribe;
  }

  /**
   * Obtém usuário atual
   */
  async getCurrentUser(): Promise<FirebaseUser | null> {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      let user = await userService.get(firebaseUser.uid);

      // Se não existir, cria registro
      if (!user && firebaseUser.email) {
        user = await this.createUserInDatabase(
          firebaseUser.uid,
          firebaseUser.displayName || firebaseUser.email.split('@')[0],
          firebaseUser.email,
          undefined,
          firebaseUser.photoURL || undefined
        );
      }

      return user;
    }
    return null;
  }

  /**
   * Atualiza foto de perfil
   */
  async updateProfilePicture(uid: string, photoUrl: string): Promise<void> {
    try {
      await userService.update(uid, { photo_url: photoUrl });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;
