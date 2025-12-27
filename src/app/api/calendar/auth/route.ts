/**
 * API Route: Google Calendar OAuth Authorization
 * GET /api/calendar/auth - Redirects to Google OAuth consent screen
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarService } from '@/integrations/google-calendar/GoogleCalendarService';
import { verifySession } from '@/domains/auth/services/sessionService';

export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated (ANY authenticated user can connect)
    const session = await verifySession();

    if (!session) {
      console.error('❌ [Calendar Auth] Sessão não encontrada');
      // Redirect to login instead of returning JSON error
      return NextResponse.redirect(new URL('/app/login?error=session_expired&redirect=/app/dashboard/schedule', req.url));
    }

    console.log('✅ [Calendar Auth] Usuário autenticado - role:', session.role);

    // Generate OAuth URL with userId as state
    const authUrl = googleCalendarService.getAuthUrl(session.uid);

    // Redirect to Google OAuth consent screen
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('❌ [Calendar Auth] Erro:', error instanceof Error ? error.message : 'Unknown error');
    // Redirect to schedule with error message
    return NextResponse.redirect(new URL('/app/dashboard/schedule?error=auth_failed', req.url));
  }
}
