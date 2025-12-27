/**
 * API Route: Controle de Sincronização Automática
 * POST /api/calendar/auto-sync - Inicia/para sincronização automática
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { calendarAutoSync } from '@/services/calendar-auto-sync';
import { verifySession } from '@/domains/auth/services/sessionService';

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const { action } = await req.json();

    if (action === 'start') {
      calendarAutoSync.startAutoSync();
      return NextResponse.json({
        success: true,
        message: 'Sincronização automática iniciada',
      });
    } else if (action === 'stop') {
      calendarAutoSync.stopAutoSync();
      return NextResponse.json({
        success: true,
        message: 'Sincronização automática parada',
      });
    } else {
      return NextResponse.json(
        { error: 'Ação inválida. Use "start" ou "stop"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('❌ Erro ao controlar sync automático:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json(
      { error: 'Failed to control auto sync' },
      { status: 500 }
    );
  }
}
