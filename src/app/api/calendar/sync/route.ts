/**
 * API Route: Manual Calendar Sync
 * POST /api/calendar/sync - Manually triggers sync from Google Calendar
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarService } from '@/integrations/google-calendar/GoogleCalendarService';
import { verifySession } from '@/domains/auth/services/sessionService';

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated and is admin
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Perform sync
    const result = await googleCalendarService.syncFromGoogleCalendar(
      session.uid
    );

    if (!result.success) {
      return NextResponse.json(
        { error: 'Sync failed', details: result.errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sync completed successfully',
      stats: {
        added: result.eventsAdded,
        updated: result.eventsUpdated,
        deleted: result.eventsDeleted,
      },
    });
  } catch (error) {
    console.error('Error syncing calendar:', error);
    return NextResponse.json(
      { error: 'Failed to sync calendar' },
      { status: 500 }
    );
  }
}
