import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/gmail/callback
 * Handles OAuth2 callback from Google
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard/admin?error=gmail_auth_failed`
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: 'No authorization code provided' },
      { status: 400 }
    );
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Store tokens in Firestore (admin-only access)
    const { doc, setDoc } = await import('firebase/firestore');
    const { firestore } = await import('@/domains/auth/services/firebaseClient');

    const configRef = doc(firestore, 'config/gmail_oauth');
    await setDoc(configRef, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Redirect back to admin with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard/admin?gmail_connected=true`
    );
  } catch (error) {
    console.error('Error during Gmail OAuth callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard/admin?error=gmail_auth_failed`
    );
  }
}
