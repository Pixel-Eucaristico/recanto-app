import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '@/domains/auth/services/firebaseClient';
import { userService } from './UserService';
import type { FirebaseUser } from '@/types/firebase-entities';
import type { Role } from '@/features/auth/types/user';

const DEV_LOG = process.env.NODE_ENV !== 'production';
const devLog = (...args: unknown[]) => { if (DEV_LOG) console.log(...args); };
const devWarn = (...args: unknown[]) => { if (DEV_LOG) console.warn(...args); };

/**
 * Cria perfil no Firestore com UID do Firebase Auth.
 * Usa merge:true — nunca sobrescreve dados existentes.
 * Resgata perfil provisório se o email já existir com outro UID.
 */
export async function createUserProfile(
  uid: string,
  name: string,
  email: string,
  role: Role,
  photo_url: string | null = null,
  birthdate?: string,
): Promise<FirebaseUser> {
  const userRef = doc(firestore, 'users', uid);

  const existingDoc = await getDoc(userRef);
  if (existingDoc.exists()) {
    devWarn(`[AuthService] Usuário ${uid} já existe — retornando dados existentes.`);
    return existingDoc.data() as FirebaseUser;
  }

  devLog(`[AuthService] Verificando perfil provisório para: ${email}`);
  let finalRole = role;
  let finalFeatures: string[] | undefined;
  let finalPhone: string | undefined;

  try {
    const existingByEmail = await userService.getUserByEmail(email);
    if (existingByEmail && existingByEmail.id !== uid) {
      devLog(`[AuthService] Perfil provisório (ID: ${existingByEmail.id}) encontrado. Resgatando...`);
      if (existingByEmail.role) finalRole = existingByEmail.role as Role;
      if (existingByEmail.features) finalFeatures = existingByEmail.features;
      if (existingByEmail.phone) finalPhone = existingByEmail.phone;
      await userService.delete(existingByEmail.id);
      devLog(`[AuthService] Perfil provisório ${existingByEmail.id} deletado.`);
    }
  } catch (err) {
    console.error('[AuthService] Erro ao resgatar perfil provisório:', err);
  }

  const userData: FirebaseUser = {
    id: uid, name, email,
    role: finalRole,
    photo_url: photo_url || null,
    created_at: new Date().toISOString(),
  };
  if (finalFeatures) userData.features = finalFeatures;
  if (finalPhone) userData.phone = finalPhone;
  if (birthdate) userData.birthdate = birthdate;

  await setDoc(userRef, userData, { merge: true });
  devLog(`✅ [AuthService] Novo usuário ${uid} criado com role: ${finalRole}`);
  return userData;
}
