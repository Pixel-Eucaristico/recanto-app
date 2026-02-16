import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let app: App;
if (!getApps().length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey && serviceAccountKey.length > 2) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      app = initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (e) {
      console.warn("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY, falling back to individual variables.", e);
    // Fallback logic duplicated in catch to guarantee assignment
      const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || '';
      // Remove aspas excedentes e garante que \n literais sejam transformados em quebras reais
      const privateKey = rawPrivateKey
        .trim()
        .replace(/^"/, "")
        .replace(/"$/, "")
        .replace(/\\n/g, "\n");
        
      const projectId = process.env.FIREBASE_PROJECT_ID?.replace(/"/g, "");
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.replace(/"/g, "");

      console.log(`[FirebaseAdmin] PID: ${projectId} | KeyLen: ${privateKey.length} | FirstChars: ${privateKey.substring(0, 30)}`);
      console.log(`[FirebaseAdmin] System Time: ${new Date().toLocaleString('pt-BR')} (Year: ${new Date().getFullYear()})`);

      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log(`✅ [FirebaseAdmin] Initialized Project: ${projectId}`);
    }
  } else {
    // Fallback to individual environment variables
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || '';
    const privateKey = rawPrivateKey
      .trim()
      .replace(/^"/, "")
      .replace(/"$/, "")
      .replace(/\\n/g, "\n");
      
    const projectId = process.env.FIREBASE_PROJECT_ID?.replace(/"/g, "");
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.replace(/"/g, "");

    console.log(`[FirebaseAdmin] PID: ${projectId} | KeyLen: ${privateKey.length} | FirstChars: ${privateKey.substring(0, 30)}`);

    if (!privateKey) {
        console.error("FIREBASE_PRIVATE_KEY is missing!");
    }

    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log(`✅ [FirebaseAdmin] Initialized with individual variables for project: ${projectId}`);
  }
} else {
  app = getApps()[0]!;
  // console.log(`✅ [FirebaseAdmin] Re-using existing app instance.`);
}

export const adminAuth = getAuth(app);
export const firestore = getFirestore(app);
// Prevent "already initialized" error during HMR
try {
  firestore.settings({ ignoreUndefinedProperties: true });
} catch (e) {
  // Ignore error if settings are already applied
}
