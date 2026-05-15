import { NextResponse } from 'next/server';
import { sessionService } from '@/domains/auth/services/sessionService';
import { adminAuth, firestore } from '@/domains/auth/services/firebaseAdmin';

/**
 * Health check das env vars.
 *
 * - PÚBLICO: retorna apenas { valid, error? } — se validação falhar, expõe mensagem.
 * - ADMIN autenticado: adicionalmente retorna lista de vars (só flags definido/vazio, nunca valores).
 * - Console: só loga erros. Nada de valor sensível.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function isAdmin(): Promise<boolean> {
  const token = await sessionService.get();
  if (!token) return false;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const userDoc = await firestore.collection('users').doc(decoded.uid).get();
    const role = userDoc.exists ? (userDoc.data()?.role as string | undefined) : undefined;
    return role === 'admin';
  } catch {
    return false;
  }
}

export async function GET() {
  let envMod: typeof import('@/config/env') | null = null;
  let validationError: string | null = null;

  try {
    envMod = await import('@/config/env');
    // força leitura pra disparar validação
    void envMod.env;
  } catch (err) {
    validationError = err instanceof Error ? err.message : String(err);
    console.error('[env/health]', validationError);
  }

  const admin = await isAdmin();

  if (validationError) {
    return NextResponse.json({ valid: false, error: validationError }, { status: 500 });
  }

  if (!admin) {
    return NextResponse.json({ valid: true });
  }

  const env = envMod!.env;
  const serverVars = {
    FIREBASE_PROJECT_ID: env.FIREBASE_PROJECT_ID ? '(definido)' : '(vazio)',
    FIREBASE_CLIENT_EMAIL: env.FIREBASE_CLIENT_EMAIL ? '(definido)' : '(vazio)',
    FIREBASE_PRIVATE_KEY: env.FIREBASE_PRIVATE_KEY ? '(definido)' : '(vazio)',
    R2_ACCOUNT_ID: env.R2_ACCOUNT_ID ? '(definido)' : '(vazio)',
    R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID ? '(definido)' : '(vazio)',
    R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY ? '(definido)' : '(vazio)',
    R2_BUCKET_NAME: env.R2_BUCKET_NAME ? '(definido)' : '(vazio)',
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID ? '(definido)' : '(não definido)',
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET ? '(definido)' : '(não definido)',
    GOOGLE_REDIRECT_URI: env.GOOGLE_REDIRECT_URI ? '(definido)' : '(não definido)',
  };
  const clientVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: env.NEXT_PUBLIC_FIREBASE_API_KEY ? '(definido)' : '(vazio)',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '(definido)' : '(vazio)',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '(definido)' : '(vazio)',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '(definido)' : '(vazio)',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '(definido)' : '(vazio)',
    NEXT_PUBLIC_FIREBASE_APP_ID: env.NEXT_PUBLIC_FIREBASE_APP_ID ? '(definido)' : '(vazio)',
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? '(definido)' : '(não definido)',
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ? '(definido)' : '(não definido)',
    NEXT_PUBLIC_R2_PUBLIC_URL: env.NEXT_PUBLIC_R2_PUBLIC_URL ? '(definido)' : '(vazio)',
    NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL ? '(definido)' : '(não definido)',
    NEXT_PUBLIC_MEDIA_MAX_MB: String(env.NEXT_PUBLIC_MEDIA_MAX_MB),
    NEXT_PUBLIC_ACL_DEBUG: env.NEXT_PUBLIC_ACL_DEBUG ?? 'false',
  };

  return NextResponse.json({ valid: true, server: serverVars, client: clientVars });
}
