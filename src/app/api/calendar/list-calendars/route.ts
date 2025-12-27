/**
 * API Route: List Google Calendars
 * GET /api/calendar/list-calendars - Lists all user's Google Calendars
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarService } from '@/integrations/google-calendar/GoogleCalendarService';
import { verifySession } from '@/domains/auth/services/sessionService';

export async function GET(req: NextRequest) {
  try {
    console.log('📋 [List Calendars] Iniciando listagem de calendários...');

    // Verify user is authenticated
    const session = await verifySession();
    if (!session) {
      console.error('❌ [List Calendars] Sessão não encontrada');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ [List Calendars] Usuário autenticado:', session.uid);

    // Get user's Google Calendar config
    const config = await googleCalendarService.getConfig(session.uid);

    if (!config || !config.tokens) {
      console.error('❌ [List Calendars] Config ou tokens não encontrados');
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 400 }
      );
    }

    console.log('✅ [List Calendars] Config encontrada, tokens presentes');

    // Check if tokens are expired and refresh if needed
    let tokens = config.tokens;
    if (tokens.expiry_date && Date.now() >= tokens.expiry_date) {
      console.log('🔄 [List Calendars] Tokens expirados, renovando...');
      tokens = await googleCalendarService.refreshAccessToken(tokens.refresh_token);
      await googleCalendarService.saveConfig(session.uid, { tokens });
      console.log('✅ [List Calendars] Tokens renovados com sucesso');
    }

    // List all calendars
    console.log('📋 [List Calendars] Buscando calendários do Google...');
    const calendars = await googleCalendarService.listCalendars(tokens);

    console.log(`✅ [List Calendars] ${calendars.length} calendários encontrados:`,
      calendars.map(c => ({ id: c.id, summary: c.summary, primary: c.primary }))
    );

    if (calendars.length === 0) {
      console.warn('⚠️ [List Calendars] Nenhum calendário encontrado para o usuário');
    }

    return NextResponse.json({ calendars });
  } catch (error) {
    console.error('❌ [List Calendars] Erro completo:', error);
    console.error('❌ [List Calendars] Stack:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to list calendars',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calendar/list-calendars - Creates a custom calendar
 */
export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { calendarName } = await req.json();

    if (!calendarName || typeof calendarName !== 'string' || calendarName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Calendar name is required' },
        { status: 400 }
      );
    }

    // Get user's Google Calendar config
    const config = await googleCalendarService.getConfig(session.uid);

    if (!config || !config.tokens) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 400 }
      );
    }

    // Create custom calendar
    const calendarId = await googleCalendarService.createCustomCalendar(
      config.tokens,
      calendarName.trim()
    );

    return NextResponse.json({
      success: true,
      calendarId,
      calendarName: calendarName.trim()
    });
  } catch (error) {
    console.error('❌ [Create Custom Calendar] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create calendar'
      },
      { status: 500 }
    );
  }
}
