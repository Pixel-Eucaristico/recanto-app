/**
 * API Route: Google Calendar OAuth Callback
 * GET /api/calendar/callback - Handles OAuth callback and saves tokens
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarService } from '@/integrations/google-calendar/GoogleCalendarService';
import { verifySession } from '@/domains/auth/services/sessionService';

export async function GET(req: NextRequest) {
  try {
    // Get userId from state parameter (passed in OAuth flow)
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('state');
    const code = searchParams.get('code');

    if (!userId) {
      console.error('❌ [Calendar Callback] userId não encontrado no state');
      return NextResponse.redirect(new URL('/app/login?error=invalid_state', req.url));
    }

    if (!code) {
      console.error('❌ [Calendar Callback] Código OAuth não fornecido');
      return NextResponse.redirect(new URL('/app/dashboard/schedule?error=no_code', req.url));
    }

    // Get user data from Firestore to get email
    const { firestore } = await import('@/domains/auth/services/firebaseAdmin');
    const userDoc = await firestore.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      console.error('❌ [Calendar Callback] Usuário não encontrado');
      return NextResponse.redirect(new URL('/app/login?error=user_not_found', req.url));
    }

    const userData = userDoc.data();
    const userEmail = userData?.email;

    if (!userEmail) {
      console.error('❌ [Calendar Callback] Email do usuário não encontrado');
      return NextResponse.redirect(new URL('/app/dashboard/schedule?error=no_email', req.url));
    }

    console.log('✅ [Calendar Callback] Conectando calendário para role:', userData?.role);

    // Exchange code for tokens
    const tokens = await googleCalendarService.getTokensFromCode(code);

    // Save tokens temporarily (without calendar configuration)
    await googleCalendarService.saveConfig(userId, {
      userId,
      tokens,
      syncEnabled: false, // Will be enabled after calendar selection
      lastSync: null,
    });

    console.log('✅ [Calendar Callback] Tokens salvos. Redirecionando para seleção de calendário...');

    // Redirect to calendar selection page
    return NextResponse.redirect(
      new URL('/app/dashboard/schedule?step=select_calendar', req.url)
    );
  } catch (error) {
    console.error('❌ [Calendar Callback] Erro:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.redirect(new URL('/app/dashboard/schedule?error=auth_failed', req.url));
  }
}
