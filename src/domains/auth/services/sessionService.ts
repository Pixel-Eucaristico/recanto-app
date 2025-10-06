import { cookies } from "next/headers";
import { adminAuth } from "./firebaseAdmin";

const ONE_DAY = 60 * 60 * 24;

export const sessionService = {
  async set(token: string) {
    (await cookies()).set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: ONE_DAY,
      path: "/",
    });
  },
  async clear() {
    (await cookies()).delete("session");
  },
  async get() {
    return (await cookies()).get("session")?.value ?? null;
  },
};

/**
 * Verify session token and return user data
 * Returns null if session is invalid or expired
 */
export async function verifySession() {
  const token = await sessionService.get();
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded;
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}
