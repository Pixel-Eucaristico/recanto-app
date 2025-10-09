import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  Auth
} from "firebase/auth";
import { getDatabase, Database } from "firebase/database";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, Analytics } from "firebase/analytics";

// ----------------------------------------------------
// Verificação de variáveis de ambiente
// ----------------------------------------------------
const requiredEnv = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
  "NEXT_PUBLIC_FIREBASE_DATABASE_URL",
];

// Verifica se todas as variáveis estão definidas
const missingEnvVars = requiredEnv.filter(key => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.warn(`[Firebase] Variáveis de ambiente não definidas: ${missingEnvVars.join(', ')}`);
  console.warn('[Firebase] Firebase não será inicializado. Configure as variáveis de ambiente para usar autenticação.');
}

// Flag para indicar se Firebase está configurado
export const isFirebaseConfigured = missingEnvVars.length === 0;

// ----------------------------------------------------
// Configuração Firebase (apenas se configurado)
// ----------------------------------------------------
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let database: Database | null = null;
let firestore: Firestore | null = null;
let analytics: Analytics | null = null;

if (isFirebaseConfigured) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
  };

  // Evita reinicializar Firebase no hot reload do Next.js
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

  // ----------------------------------------------------
  // Serviços Firebase
  // ----------------------------------------------------
  auth = getAuth(app);
  database = getDatabase(app); // Realtime Database (legacy)
  firestore = getFirestore(app); // Firestore (novo!)
  analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
}

// Exporta os serviços (podem ser null se não configurados)
export { auth, database, firestore, analytics };

// ----------------------------------------------------
// Provedores de Auth (apenas se Firebase configurado)
// ----------------------------------------------------
export const googleProvider = isFirebaseConfigured ? new GoogleAuthProvider() : null;
export const facebookProvider = isFirebaseConfigured ? new FacebookAuthProvider() : null;
export const twitterProvider = isFirebaseConfigured ? new TwitterAuthProvider() : null;

// ----------------------------------------------------
// Funções de login
// ----------------------------------------------------
async function formatUser(user: FirebaseUser) {
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    photo: user.photoURL,
  };
}

export async function loginWithGoogle() {
  if (!auth || !googleProvider) {
    throw new Error('Firebase não está configurado. Configure as variáveis de ambiente.');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return formatUser(result.user);
}

export async function loginWithFacebook() {
  if (!auth || !facebookProvider) {
    throw new Error('Firebase não está configurado. Configure as variáveis de ambiente.');
  }
  const result = await signInWithPopup(auth, facebookProvider);
  return formatUser(result.user);
}

export async function loginWithTwitter() {
  if (!auth || !twitterProvider) {
    throw new Error('Firebase não está configurado. Configure as variáveis de ambiente.');
  }
  const result = await signInWithPopup(auth, twitterProvider);
  return formatUser(result.user);
}

// ----------------------------------------------------
// Função de logout
// ----------------------------------------------------
export async function logout() {
  if (!auth) {
    throw new Error('Firebase não está configurado. Configure as variáveis de ambiente.');
  }
  await auth.signOut();
}

export default app;
