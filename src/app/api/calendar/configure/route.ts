/**
 * API Route: Configure Google Calendar
 * POST /api/calendar/configure - Configures which calendar to use after OAuth
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarService } from '@/integrations/google-calendar/GoogleCalendarService';
import { verifySession } from '@/domains/auth/services/sessionService';

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { calendarId, customCalendarName } = await req.json();

    // Get user's temporary config (tokens saved during callback)
    const config = await googleCalendarService.getConfig(session.uid);

    if (!config || !config.tokens) {
      return NextResponse.json(
        { error: 'OAuth tokens not found. Please reconnect Google Calendar.' },
        { status: 400 }
      );
    }

    let selectedCalendarId = calendarId;

    // If custom calendar name provided, create it
    if (customCalendarName && typeof customCalendarName === 'string' && customCalendarName.trim().length > 0) {
      console.log('📅 Creating custom calendar:', customCalendarName);
      selectedCalendarId = await googleCalendarService.createCustomCalendar(
        config.tokens,
        customCalendarName.trim()
      );
    }

    // If no calendar selected, use default "Recanto" calendar
    if (!selectedCalendarId) {
      console.log('📅 Using default "Recanto" calendar');
      selectedCalendarId = await googleCalendarService.createRecantoCalendar(config.tokens);
    }

    // Update configuration with selected calendar
    await googleCalendarService.saveConfig(session.uid, {
      calendarId: selectedCalendarId,
      syncEnabled: true,
      lastSync: new Date().toISOString(),
    });

    // Setup webhook for push notifications
    try {
      const webhook = await googleCalendarService.setupWebhook(
        session.uid,
        selectedCalendarId,
        config.tokens
      );

      await googleCalendarService.saveConfig(session.uid, {
        webhookChannelId: webhook.channelId,
        webhookResourceId: webhook.resourceId,
        webhookExpiration: webhook.expiration,
      });
      console.log('✅ Webhook configurado');
    } catch (webhookError) {
      console.error('⚠️ Webhook falhou:', webhookError instanceof Error ? webhookError.message : 'Unknown');
      // Continue anyway, sync will still work manually
    }

    // Perform initial sync
    await googleCalendarService.syncFromGoogleCalendar(session.uid);

    return NextResponse.json({
      success: true,
      calendarId: selectedCalendarId,
      message: 'Calendar configured successfully'
    });
  } catch (error) {
    console.error('❌ [Configure Calendar] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to configure calendar'
      },
      { status: 500 }
    );
  }
}
