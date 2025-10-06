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
// Verificação de variáveis de ambiente
// ----------------------------------------------------
function validateFirebaseConfig() {
  const requiredEnv = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  };

  const missing = Object.entries(requiredEnv)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error(`[Firebase] Variáveis de ambiente faltando: ${missing.join(', ')}`);
    throw new Error(`Firebase configuration incomplete. Missing: ${missing.join(', ')}`);
  }

  return requiredEnv;
}

// ----------------------------------------------------
// Configuração Firebase
// ----------------------------------------------------
const config = validateFirebaseConfig();

const firebaseConfig = {
  apiKey: config.apiKey!,
  authDomain: config.authDomain!,
  databaseURL: config.databaseURL!,
  projectId: config.projectId!,
  storageBucket: config.storageBucket!,
  messagingSenderId: config.messagingSenderId!,
  appId: config.appId!,
  measurementId: config.measurementId!,
};

// Evita reinicializar Firebase no hot reload do Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// ----------------------------------------------------
// Serviços Firebase
// ----------------------------------------------------
export const auth = getAuth(app);
export const database = getDatabase(app); // Realtime Database (legacy)
export const firestore = getFirestore(app); // Firestore (novo!)

// Analytics apenas no lado do cliente e em produção
let analytics = null;
if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn("[Firebase] Analytics não pôde ser inicializado:", error);
  }
}
export { analytics };

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
