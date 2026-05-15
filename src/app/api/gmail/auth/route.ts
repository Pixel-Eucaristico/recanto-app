export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { encodeState } from '@/integrations/google/oauthState';
import { verifySession } from '@/domains/auth/services/sessionService';
import { env } from '@/config/env';

/** Callback unificado já validado pelo zod schema (env.ts). */
function resolveCallbackUri(): string {
  if (env.GOOGLE_OAUTH_CALLBACK_URL) return env.GOOGLE_OAUTH_CALLBACK_URL;
  if (env.NEXT_PUBLIC_APP_URL) return `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/api/google/callback`;
  return 'http://localhost:3000/api/google/callback';
}

export async function GET(req: NextRequest) {
  const session = await verifySession();
  const fallbackReturn = '/app/dashboard/admin';
  if (!session) {
    return NextResponse.redirect(new URL(`/app/login?error=session_expired&redirect=${encodeURIComponent(fallbackReturn)}`, req.url));
  }

  const clientId = env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'Google Client ID não configurado' }, { status: 500 });
  }

  const returnTo = req.nextUrl.searchParams.get('return_to') ?? fallbackReturn;
  const state = encodeState({ integration: 'gmail', uid: session.uid, returnTo });

  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', resolveCallbackUri());
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes.join(' '));
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', state);

  return NextResponse.redirect(authUrl.toString());
}
