/**
 * API Route: Google Calendar Connection Status
 * GET /api/calendar/status - Checks if Google Calendar is connected
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarService } from '@/integrations/google-calendar/GoogleCalendarService';
import { verifySession } from '@/domains/auth/services/sessionService';

export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated (ANY authenticated user can check)
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if calendar is configured for this user
    const config = await googleCalendarService.getConfig(session.uid);

    return NextResponse.json({
      connected: !!config && config.syncEnabled,
      lastSync: config?.lastSync || null,
    });
  } catch (error) {
    console.error('Error checking calendar status:', error);
    return NextResponse.json(
      { error: 'Failed to check calendar status' },
      { status: 500 }
    );
  }
}
