/**
 * Callback unificado de OAuth Google.
 * Único redirect URI registrado no Google Cloud Console:
 *   {origin}/api/google/callback
 *
 * O `state` carrega qual integração + uid + URL de retorno.
 * Cada integração salva tokens na sua coleção dedicada.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { decodeState } from '@/integrations/google/oauthState';
import { googleYouTubeService } from '@/integrations/google-youtube/GoogleYouTubeService';
import { googleCalendarService } from '@/integrations/google-calendar/GoogleCalendarService';
import { env } from '@/config/env';

function appendQuery(url: URL, key: string, value: string): URL {
  url.searchParams.set(key, value);
  return url;
}

function resolveCallbackUri(): string {
  if (env.GOOGLE_OAUTH_CALLBACK_URL) return env.GOOGLE_OAUTH_CALLBACK_URL;
  if (env.NEXT_PUBLIC_APP_URL) return `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/api/google/callback`;
  return 'http://localhost:3000/api/google/callback';
}

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get('code');
  const stateRaw = searchParams.get('state');
  const oauthError = searchParams.get('error');

  const state = stateRaw ? decodeState(stateRaw) : null;
  const fallback = new URL('/app/dashboard', origin);
  const returnUrl = state?.returnTo
    ? new URL(state.returnTo, origin)
    : fallback;

  if (oauthError) {
    return NextResponse.redirect(appendQuery(returnUrl, 'oauth_error', oauthError));
  }
  if (!state || !code) {
    return NextResponse.redirect(appendQuery(returnUrl, 'oauth_error', 'invalid_state'));
  }

  try {
    switch (state.integration) {
      case 'youtube': {
        const tokens = await googleYouTubeService.getTokensFromCode(code);
        await googleYouTubeService.saveTokens(state.uid, tokens);
        return NextResponse.redirect(appendQuery(returnUrl, 'youtube_connected', '1'));
      }

      case 'calendar': {
        const tokens = await googleCalendarService.getTokensFromCode(code);
        await googleCalendarService.saveConfig(state.uid, {
          userId: state.uid,
          tokens,
          syncEnabled: false,
        });
        return NextResponse.redirect(appendQuery(returnUrl, 'calendar_connected', '1'));
      }

      case 'gmail': {
        // Gmail uses raw fetch (no googleapis client). Exchange code manually.
        const clientId = env.GOOGLE_CLIENT_ID;
        const clientSecret = env.GOOGLE_CLIENT_SECRET;
        const callbackUrl = resolveCallbackUri();

        if (!clientId || !clientSecret) throw new Error('Google OAuth credentials missing');

        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: callbackUrl,
            grant_type: 'authorization_code',
          }),
        });
        if (!tokenRes.ok) throw new Error('Failed to exchange Gmail code for tokens');
        const tokens = await tokenRes.json();

        const { firestore } = await import('@/domains/auth/services/firebaseAdmin');
        await firestore.collection('config').doc('gmail_oauth').set({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        });

        return NextResponse.redirect(appendQuery(returnUrl, 'gmail_connected', '1'));
      }

      default:
        return NextResponse.redirect(appendQuery(returnUrl, 'oauth_error', 'unsupported_integration'));
    }
  } catch (err) {
    console.error('[Google Callback] error:', err);
    return NextResponse.redirect(appendQuery(returnUrl, 'oauth_error', 'auth_failed'));
  }
}
