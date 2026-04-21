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
  linkWithPopup,
  updatePassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { userService } from './UserService';
import { FirebaseUser } from '@/types/firebase-entities';
import { Role } from '@/features/auth/types/user';

const DEV_LOG = process.env.NODE_ENV !== 'production';
const devLog = (...args: unknown[]) => { if (DEV_LOG) console.log(...args); };
const devWarn = (...args: unknown[]) => { if (DEV_LOG) console.warn(...args); };

class AuthService {
  /**
   * Registra novo usuário
   */
  async register(
    email: string,
    password: string,
    name: string,
    role: Role = 'visitante'
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
      try {
        const user = await userService.get(uid);

        if (user) {
          return user;
        }

        // Usuário realmente não existe no Firestore (não é erro de conexão)
        devLog(`[AuthService] Criando perfil inicial para o novo usuário: ${uid}`);
        return await this.createUserInDatabase(uid, displayName || userEmail!.split('@')[0], userEmail!, 'visitante');

      } catch (firestoreError: any) {
        // Erro de conexão - NÃO criar usuário, pode sobrescrever dados existentes
        console.error('[AuthService] Erro ao buscar usuário no Firestore:', firestoreError.message);
        devWarn('[AuthService] Login no Firebase Auth OK, mas Firestore offline. Retornando dados básicos.');

        // Retorna dados mínimos do Firebase Auth (sem role do Firestore)
        return {
          id: uid,
          name: displayName || userEmail!.split('@')[0],
          email: userEmail!,
          role: null, // Será carregado depois quando Firestore voltar
          photo_url: null,
          created_at: new Date().toISOString(),
        };
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    }
  }

  /**
   * Cria usuário no Firestore com UID do Firebase Auth
   * MIGRADO: Firestore ao invés do Realtime Database
   * SEGURO: Usa merge para NUNCA sobrescrever dados existentes (como role)
   */
  private async createUserInDatabase(
    uid: string,
    name: string,
    email: string,
    role: Role, // Role agora é obrigatória para evitar defaults acidentais
    photo_url: string | null = null
  ): Promise<FirebaseUser> {
    const userRef = doc(firestore, 'users', uid);

    // VERIFICAR se já existe ANTES de criar
    const existingDoc = await getDoc(userRef);
    if (existingDoc.exists()) {
      devWarn(`[AuthService] Usuário ${uid} já existe! Retornando dados existentes (não sobrescrevendo)`);
      return existingDoc.data() as FirebaseUser;
    }

    // ==========================================
    // INÍCIO DO FLUXO: RESGATE INTELIGENTE DE CONVITE (CLAIM ACCOUNT)
    // ==========================================
    devLog(`[AuthService] Verificando se existe um perfil provisório/convite para o email: ${email}`);
    let finalRole = role;
    let finalFeatures: string[] | undefined = undefined;
    let finalPhone: string | undefined = undefined;

    try {
      const existingUserByEmail = await userService.getUserByEmail(email);
      
      if (existingUserByEmail && existingUserByEmail.id !== uid) {
         devLog(`[AuthService] Perfil provisório encontrado (ID: ${existingUserByEmail.id}). Resgatando dados (Role: ${existingUserByEmail.role})...`);
         
         // Resgatar os dados inseridos manualmente pelo Admin
         if (existingUserByEmail.role) finalRole = existingUserByEmail.role as Role;
         if (existingUserByEmail.features) finalFeatures = existingUserByEmail.features;
         if (existingUserByEmail.phone) finalPhone = existingUserByEmail.phone;
         
         // Deletar o documento temporário/provísório para evitar duplicação do email no banco
         await userService.delete(existingUserByEmail.id);
         devLog(`[AuthService] Perfil provisório (${existingUserByEmail.id}) deletado com sucesso.`);
      }
    } catch (checkError) {
      console.error('[AuthService] Erro ao buscar/resgatar perfil provisório por email. Criando perfil normal:', checkError);
    }
    // ==========================================

    const userData: FirebaseUser = {
      id: uid,
      name,
      email,
      role: finalRole,
      photo_url: photo_url || null,
      created_at: new Date().toISOString(),
    };

    if (finalFeatures) userData.features = finalFeatures;
    if (finalPhone) userData.phone = finalPhone;

    // Usar merge: true como proteção adicional contra sobrescrita acidental
    await setDoc(userRef, userData, { merge: true });
    devLog(`✅ [AuthService] Novo usuário criado: ${uid} com role final: ${finalRole}`);

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

      // Busca ou cria usuário (com proteção contra sobrescrita)
      try {
        const user = await userService.get(uid);

        if (user) {
          return user;
        }

        // Usuário realmente não existe no Firestore
        devLog(`[AuthService] Criando perfil via provedor social para: ${uid}`);
        return await this.createUserInDatabase(
          uid,
          displayName || email!.split('@')[0],
          email!,
          'visitante',
          photoURL || null
        );
      } catch (firestoreError: any) {
        // Erro de conexão - retornar dados básicos sem criar
        console.error('[AuthService] Firestore offline no login social:', firestoreError.message);
        return {
          id: uid,
          name: displayName || email!.split('@')[0],
          email: email!,
          role: null,
          photo_url: photoURL || null,
          created_at: new Date().toISOString(),
        };
      }
    } catch (error: any) {
      console.error('Error logging in with provider:', error);
      if (error.code === 'auth/popup-blocked') {
        throw new Error('O popup de login foi bloqueado pelo seu navegador. Por favor, permita popups para este site na barra de endereços e tente novamente.');
      }
      if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('Este email já está cadastrado. Faça login com sua senha e vincule a conta no Perfil.');
      }
      throw new Error(error.message || 'Erro ao fazer login com provedor');
    }
  }

  /**
   * Vincula a conta atual com o provedor Google
   */
  async linkGoogleAccount(): Promise<void> {
    try {
      if (!auth.currentUser) throw new Error('Nenhum usuário logado');
      await linkWithPopup(auth.currentUser, googleProvider);
      devLog('✅ [AuthService] Conta Google vinculada com sucesso.');
    } catch (error: any) {
      console.error('Error linking Google account:', error);
      if (error.code === 'auth/popup-blocked') {
        throw new Error('O popup de vinculação foi bloqueado pelo navegador. Por favor, permita popups para este site.');
      }
      throw new Error(error.message || 'Erro ao vincular conta Google');
    }
  }

  /**
   * Cria uma senha local para a conta atual
   */
  async createLocalPassword(password: string): Promise<void> {
    try {
      if (!auth.currentUser) throw new Error('Nenhum usuário logado');
      await updatePassword(auth.currentUser, password);
      devLog('✅ [AuthService] Senha local criada/atualizada com sucesso.');
    } catch (error: any) {
      console.error('Error creating local password:', error);
      throw new Error(error.message || 'Erro ao criar senha local');
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
        devLog(`🔄 [AuthService] onAuthStateChange disparado para UID: ${firebaseUser.uid}`);

        try {
          // Busca dados completos do usuário pelo UID
          const user = await userService.get(firebaseUser.uid);

          if (user) {
            devLog(`✅ [AuthService] Usuário encontrado: ${user.email}, role: ${user.role}`);
            callback(user);
          } else {
            // Usuário não existe no Firestore - criar perfil inicial
            devWarn(`⚠️ [AuthService] Usuário não encontrado no Firestore, criando perfil: ${firebaseUser.uid}`);
            const newUser = await this.createUserInDatabase(
              firebaseUser.uid,
              firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
              firebaseUser.email || '',
              'visitante',
              firebaseUser.photoURL || null
            );
            callback(newUser);
          }
        } catch (error: any) {
          // Erro de conexão - retornar dados básicos do Firebase Auth
          console.error(`❌ [AuthService] Erro ao buscar usuário no Firestore:`, error.message);
          devWarn(`⚠️ [AuthService] Usando dados do Firebase Auth (Firestore offline)`);

          // Retorna dados mínimos para não travar o app
          callback({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
            email: firebaseUser.email || '',
            role: null, // Será carregado depois quando Firestore reconectar
            photo_url: firebaseUser.photoURL || null,
            created_at: new Date().toISOString(),
          });
        }
      } else {
        devLog(`🔓 [AuthService] Usuário deslogado`);
        callback(null);
      }
    });

    return unsubscribe;
  }

  /**
   * Obtém usuário atual
   * SEGURO: Não cria usuário automaticamente se houver erro de conexão
   */
  async getCurrentUser(): Promise<FirebaseUser | null> {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      try {
        const user = await userService.get(firebaseUser.uid);

        if (user) {
          return user;
        }

        // Usuário realmente não existe - criar apenas se não houver erro
        if (firebaseUser.email) {
          return await this.createUserInDatabase(
            firebaseUser.uid,
            firebaseUser.displayName || firebaseUser.email.split('@')[0],
            firebaseUser.email,
            'visitante',
            firebaseUser.photoURL || null
          );
        }
      } catch (error: any) {
        console.error('[AuthService] Erro ao buscar usuário atual:', error.message);
        // Retorna null em vez de criar usuário quando há erro de conexão
        return null;
      }
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
