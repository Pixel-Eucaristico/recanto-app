import { NextResponse } from 'next/server';

/**
 * GET /api/gmail/status
 * Check if Gmail is connected and valid
 */
export async function GET() {
  try {
    const { firestore } = await import('@/domains/auth/services/firebaseAdmin');

    const configRef = firestore.collection('config').doc('gmail_oauth');
    const configSnap = await configRef.get();

    if (!configSnap.exists) {
      return NextResponse.json({
        connected: false,
        message: 'Gmail not connected',
      });
    }

    const config = configSnap.data() || {};
    const expiresAt = new Date(config.expires_at);
    const isExpired = expiresAt < new Date();

    if (isExpired && config.refresh_token) {
      // Try to refresh the token
      try {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
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
          await configRef.set({
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

/**
 * DELETE /api/gmail/status
 * Disconnect Gmail (remove configuration)
 */
export async function DELETE() {
  try {
    const { firestore } = await import('@/domains/auth/services/firebaseAdmin');
    await firestore.collection('config').doc('gmail_oauth').delete();

    return NextResponse.json({
      connected: false,
      message: 'Gmail disconnected successfully',
    });
  } catch (error) {
    console.error('Error disconnecting Gmail:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Gmail' },
      { status: 500 }
    );
  }
}
