import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// ----------------------------------------------------
// Verificação de variáveis de ambiente (apenas em desenvolvimento)
// ----------------------------------------------------
if (process.env.NODE_ENV === 'development') {
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

  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0 && typeof window !== 'undefined') {
    console.warn(`[Firebase] ${missing.length} variáveis de ambiente não definidas no client`);
  }
}

// ----------------------------------------------------
// Configuração Firebase
// ----------------------------------------------------
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
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// ----------------------------------------------------
// Serviços Firebase
// ----------------------------------------------------
export const auth = getAuth(app);
export const database = getDatabase(app); // Realtime Database (legacy)
export const firestore = getFirestore(app); // Firestore (novo!)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

// ----------------------------------------------------
// Provedores de Auth
// ----------------------------------------------------
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const twitterProvider = new TwitterAuthProvider();

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
  const result = await signInWithPopup(auth, googleProvider);
  return formatUser(result.user);
}

export async function loginWithFacebook() {
  const result = await signInWithPopup(auth, facebookProvider);
  return formatUser(result.user);
}

export async function loginWithTwitter() {
  const result = await signInWithPopup(auth, twitterProvider);
  return formatUser(result.user);
}

// ----------------------------------------------------
// Função de logout
// ----------------------------------------------------
export async function logout() {
  await auth.signOut();
}

export default app;
