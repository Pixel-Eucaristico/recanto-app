/**
 * API Route: Google Calendar Webhook
 * POST /api/calendar/webhook - Receives push notifications from Google Calendar
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarService } from '@/integrations/google-calendar/GoogleCalendarService';
import { firestore } from '@/domains/auth/services/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    // Get webhook headers
    const channelId = req.headers.get('x-goog-channel-id');
    const resourceState = req.headers.get('x-goog-resource-state');
    const resourceId = req.headers.get('x-goog-resource-id');

    if (!channelId || !resourceId) {
      return NextResponse.json(
        { error: 'Invalid webhook request' },
        { status: 400 }
      );
    }

    // Ignore 'sync' state (initial verification)
    if (resourceState === 'sync') {
      return NextResponse.json({ success: true });
    }

    // Find the user associated with this channel
    const configSnapshot = await firestore
      .collection('google_calendar_configs')
      .where('webhookChannelId', '==', channelId)
      .where('webhookResourceId', '==', resourceId)
      .limit(1)
      .get();

    if (configSnapshot.empty) {
      console.error('No config found for channel:', channelId);
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    const userId = configSnapshot.docs[0].data().userId;

    // Trigger sync in background
    // Note: In production, use a task queue (Cloud Tasks, BullMQ, etc.)
    googleCalendarService
      .syncFromGoogleCalendar(userId)
      .catch((error) => {
        console.error('Background sync failed:', error);
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
