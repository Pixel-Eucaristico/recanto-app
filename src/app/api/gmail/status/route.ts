import { NextResponse } from 'next/server';

/**
 * GET /api/gmail/status
 * Check if Gmail is connected and valid
 */
export async function GET() {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { firestore } = await import('@/domains/auth/services/firebaseClient');

    const configRef = doc(firestore, 'config/gmail_oauth');
    const configSnap = await getDoc(configRef);

    if (!configSnap.exists()) {
      return NextResponse.json({
        connected: false,
        message: 'Gmail not connected',
      });
    }

    const config = configSnap.data();
    const expiresAt = new Date(config.expires_at);
    const isExpired = expiresAt < new Date();

    if (isExpired && config.refresh_token) {
      // Try to refresh the token
      try {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId!,
            client_secret: clientSecret!,
            refresh_token: config.refresh_token,
            grant_type: 'refresh_token',
          }),
        });

        if (refreshResponse.ok) {
          const tokens = await refreshResponse.json();

          // Update tokens
          const { setDoc } = await import('firebase/firestore');
          await setDoc(configRef, {
            access_token: tokens.access_token,
            refresh_token: config.refresh_token, // Keep existing refresh token
            expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          });

          return NextResponse.json({
            connected: true,
            expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          });
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
      }
    }

    return NextResponse.json({
      connected: !isExpired,
      expires_at: config.expires_at,
      needs_refresh: isExpired,
    });
  } catch (error) {
    console.error('Error checking Gmail status:', error);
    return NextResponse.json(
      { error: 'Failed to check Gmail status' },
      { status: 500 }
    );
  }
}
