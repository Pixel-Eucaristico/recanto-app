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
    // Verify user is authenticated
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ [Calendar Sync] Iniciando sync para role:', session.role);

    // Perform sync
    const result = await googleCalendarService.syncFromGoogleCalendar(
      session.uid
    );

    console.log('📊 [Calendar Sync] Resultado:', {
      success: result.success,
      added: result.eventsAdded,
      updated: result.eventsUpdated,
      errors: result.errors?.length || 0
    });

    if (!result.success) {
      console.error('❌ [Calendar Sync] Falhou:', result.errors);
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
    console.error('❌ [Calendar Sync] Erro exception:', error instanceof Error ? error.message : error);
    console.error('❌ [Calendar Sync] Stack:', error instanceof Error ? error.stack : '');
    return NextResponse.json(
      { error: 'Failed to sync calendar', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
