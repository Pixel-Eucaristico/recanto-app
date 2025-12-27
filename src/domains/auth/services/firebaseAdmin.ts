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
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey ? privateKey.replace(/\\n/g, "\n") : undefined,
        }),
      });
    }
  } else {
    // Fallback to individual environment variables
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
        console.error("FIREBASE_PRIVATE_KEY is missing!");
    }

    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle both escaped newlines (from .env) and real newlines
        privateKey: privateKey ? privateKey.replace(/\\n/g, "\n") : undefined,
      }),
    });
    console.log(`✅ [FirebaseAdmin] Initialized with individual variables for project: ${process.env.FIREBASE_PROJECT_ID}`);
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
