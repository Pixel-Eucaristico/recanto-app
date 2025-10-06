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
    // Verify user is authenticated and is admin
    const session = await verifySession();
    if (!session) {
      return NextResponse.redirect('/app/login?error=unauthorized');
    }

    if (session.role !== 'admin') {
      return NextResponse.redirect('/app/dashboard?error=forbidden');
    }

    // Get authorization code from query params
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect('/app/dashboard/schedule?error=no_code');
    }

    // Exchange code for tokens
    const tokens = await googleCalendarService.getTokensFromCode(code);

    // Get user's primary calendar (email)
    const calendarId = session.email;

    // Save configuration to Firestore
    await googleCalendarService.saveConfig(session.uid, {
      userId: session.uid,
      calendarId,
      tokens,
      syncEnabled: true,
      lastSync: new Date().toISOString(),
    });

    // Setup webhook for push notifications
    try {
      const webhook = await googleCalendarService.setupWebhook(
        session.uid,
        calendarId,
        tokens
      );

      await googleCalendarService.saveConfig(session.uid, {
        webhookChannelId: webhook.channelId,
        webhookResourceId: webhook.resourceId,
        webhookExpiration: webhook.expiration,
      });
    } catch (webhookError) {
      console.error('Failed to setup webhook:', webhookError);
      // Continue anyway, sync will still work manually
    }

    // Perform initial sync
    await googleCalendarService.syncFromGoogleCalendar(session.uid);

    // Redirect to schedule page with success message
    return NextResponse.redirect(
      '/app/dashboard/schedule?success=calendar_connected'
    );
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    return NextResponse.redirect('/app/dashboard/schedule?error=auth_failed');
  }
}
