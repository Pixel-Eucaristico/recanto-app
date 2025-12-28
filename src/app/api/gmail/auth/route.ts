import { NextResponse } from 'next/server';

/**
 * GET /api/gmail/auth
 * Initiates Gmail OAuth2 flow
 */
export async function GET() {
  const clientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '').trim();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').trim();
  const redirectUri = `${appUrl}/api/gmail/callback`;

  if (!clientId) {
    return NextResponse.json(
      { error: 'Google Client ID not configured (NEXT_PUBLIC_GOOGLE_CLIENT_ID or GOOGLE_CLIENT_ID)' },
      { status: 500 }
    );
  }

  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('scope', scopes.join(' '));
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'consent');

  return NextResponse.redirect(authUrl.toString());
}
