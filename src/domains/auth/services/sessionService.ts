import { cookies } from "next/headers";
import { adminAuth } from "./firebaseAdmin";

const ONE_DAY = 60 * 60 * 24;

export const sessionService = {
  async set(token: string) {
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ONE_DAY,
      path: "/",
    });
  },
  async clear() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
  },
  async get() {
    const cookieStore = await cookies();
    return cookieStore.get("session")?.value ?? null;
  },
};

/**
 * Verify session token and return user data with role from Firestore
 * Returns null if session is invalid or expired
 */
export async function verifySession() {
  const token = await sessionService.get();
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);

    // ✅ BUSCAR ROLE DO FIRESTORE
    const { firestore } = await import('./firebaseAdmin');
    const userDoc = await firestore.collection('users').doc(decoded.uid).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      // Adicionar role ao decoded token
      return {
        ...decoded,
        role: userData?.role || null
      };
    }

    return decoded;
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}
