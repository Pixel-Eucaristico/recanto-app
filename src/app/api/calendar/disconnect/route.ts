/**
 * API Route: Disconnect Google Calendar
 * POST /api/calendar/disconnect - Disconnects user's Google Calendar
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarService } from '@/integrations/google-calendar/GoogleCalendarService';
import { verifySession } from '@/domains/auth/services/sessionService';

export async function POST(req: NextRequest) {
  try {
    console.log('🔌 [Calendar Disconnect] Desconectando...');

    // Verify user is authenticated
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('👤 [Calendar Disconnect] Usuário:', session.email);

    // Get current config
    const config = await googleCalendarService.getConfig(session.uid);

    // Stop webhook if exists
    if (config && config.webhookChannelId) {
      try {
        await googleCalendarService.stopWebhook(config.webhookChannelId, config.webhookResourceId!);
        console.log('✅ [Calendar Disconnect] Webhook removido');
      } catch (error) {
        console.error('⚠️ [Calendar Disconnect] Erro ao remover webhook:', error);
      }
    }

    // Delete config from Firestore
    await googleCalendarService.deleteConfig(session.uid);

    console.log('✅ [Calendar Disconnect] Google Calendar desconectado!');

    return NextResponse.json({
      success: true,
      message: 'Google Calendar desconectado com sucesso'
    });
  } catch (error) {
    console.error('❌ [Calendar Disconnect] Erro:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
