export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { googleYouTubeService } from '@/integrations/google-youtube/GoogleYouTubeService';
import { verifySession } from '@/domains/auth/services/sessionService';

export async function GET(req: NextRequest) {
  const session = await verifySession();
  const fallbackReturn = '/app/dashboard/admin/formation';
  if (!session) {
    return NextResponse.redirect(new URL(`/app/login?error=session_expired&redirect=${encodeURIComponent(fallbackReturn)}`, req.url));
  }
  const returnTo = req.nextUrl.searchParams.get('return_to') ?? fallbackReturn;
  const authUrl = googleYouTubeService.getAuthUrl(session.uid, returnTo);

  // DEBUG: log redirect_uri being sent to Google
  const parsed = new URL(authUrl);
  console.log('[YouTube Auth] redirect_uri sent to Google:', parsed.searchParams.get('redirect_uri'));
  console.log('[YouTube Auth] env NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
  console.log('[YouTube Auth] env GOOGLE_OAUTH_CALLBACK_URL:', process.env.GOOGLE_OAUTH_CALLBACK_URL);

  return NextResponse.redirect(authUrl);
}
