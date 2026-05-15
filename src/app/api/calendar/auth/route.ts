/**
 * API Route: Google Calendar OAuth Authorization
 * GET /api/calendar/auth - Redirects to Google OAuth consent screen via central callback.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarService } from '@/integrations/google-calendar/GoogleCalendarService';
import { verifySession } from '@/domains/auth/services/sessionService';

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession();
    const fallbackReturn = '/app/dashboard/schedule?step=select_calendar';
    if (!session) {
      return NextResponse.redirect(new URL(`/app/login?error=session_expired&redirect=${encodeURIComponent(fallbackReturn)}`, req.url));
    }
    const returnTo = req.nextUrl.searchParams.get('return_to') ?? fallbackReturn;
    const authUrl = googleCalendarService.getAuthUrl(session.uid, returnTo);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('[Calendar Auth] error:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.redirect(new URL('/app/dashboard/schedule?error=auth_failed', req.url));
  }
}
