/**
 * API Route: Export Events to Google Calendar
 * POST /api/calendar/export - Exports Firestore events to Google Calendar
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarService } from '@/integrations/google-calendar/GoogleCalendarService';
import { verifySession } from '@/domains/auth/services/sessionService';
import type { Event } from '@/types/firebase-entities';

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.role === 'admin';
    console.log('✅ [Calendar Export] Iniciando export - Admin:', isAdmin);

    // Get calendar config
    const config = await googleCalendarService.getConfig(session.uid);
    if (!config || !config.syncEnabled) {
      return NextResponse.json(
        { error: 'Google Calendar not connected or sync disabled' },
        { status: 400 }
      );
    }

    // ✅ Usar Firebase Admin SDK para buscar eventos
    const { firestore } = await import('@/domains/auth/services/firebaseAdmin');
    const now = new Date().toISOString();

    console.log('📋 [Calendar Export] Buscando eventos futuros do Firestore...');
    console.log('📋 [Calendar Export] Data atual:', now);

    // Query para eventos futuros
    const eventsSnapshot = await firestore
      .collection('events')
      .where('start', '>=', now)
      .limit(100)
      .get();

    console.log(`📋 [Calendar Export] ${eventsSnapshot.size} eventos futuros encontrados`);

    if (eventsSnapshot.empty) {
      console.log('⚠️ [Calendar Export] Nenhum evento futuro encontrado no Firestore');
      return NextResponse.json({
        success: true,
        message: 'No events to export',
        stats: { total: 0, exported: 0, failed: 0, scope: isAdmin ? 'all' : 'public_only' }
      });
    }

    // Filtrar eventos baseado no role
    const eventsToCreate: Event[] = [];
    const eventsToUpdate: Event[] = [];
    const alreadySynced: string[] = [];
    const skippedNonPublic: string[] = [];

    for (const doc of eventsSnapshot.docs) {
      const event = { id: doc.id, ...doc.data() } as Event;

      // Verificar se evento foi modificado após última sincronização
      const wasModified = event.updated_at && event.last_synced_at &&
        new Date(event.updated_at).getTime() > new Date(event.last_synced_at).getTime();

      if (event.google_calendar_id) {
        // Evento já sincronizado
        if (wasModified) {
          // Evento foi modificado, precisa atualizar no Google
          if (isAdmin || event.is_public) {
            console.log(`✏️ [Calendar Export] Evento modificado: "${event.title}" - Precisa atualizar no Google`);
            eventsToUpdate.push(event);
          } else {
            console.log(`🔒 [Calendar Export] Pulando "${event.title}" - Modificado mas não público`);
            skippedNonPublic.push(event.title);
          }
        } else {
          // Evento já está sincronizado e não foi modificado
          console.log(`⏭️ [Calendar Export] Pulando "${event.title}" - Já sincronizado (google_calendar_id: ${event.google_calendar_id})`);
          alreadySynced.push(event.title);
        }
        continue;
      }

      // Evento novo (sem google_calendar_id)
      if (isAdmin || event.is_public) {
        console.log(`➕ [Calendar Export] Evento novo: "${event.title}" - is_public: ${event.is_public}`);
        eventsToCreate.push(event);
      } else {
        console.log(`🔒 [Calendar Export] Pulando "${event.title}" - Não público e usuário não é admin`);
        skippedNonPublic.push(event.title);
      }
    }

    console.log(`📤 [Calendar Export] Resumo:`);
    console.log(`   - Total encontrado: ${eventsSnapshot.size}`);
    console.log(`   - Já sincronizados: ${alreadySynced.length}`, alreadySynced);
    console.log(`   - Não públicos (pulados): ${skippedNonPublic.length}`, skippedNonPublic);
    console.log(`   - Para criar: ${eventsToCreate.length}`);
    console.log(`   - Para atualizar: ${eventsToUpdate.length}`);

    // Se não há eventos para processar, retornar com detalhes
    if (eventsToCreate.length === 0 && eventsToUpdate.length === 0) {
      console.log('⚠️ [Calendar Export] Nenhum evento para criar ou atualizar');
      return NextResponse.json({
        success: true,
        message: 'No events to create or update',
        stats: {
          total: eventsSnapshot.size,
          created: 0,
          updated: 0,
          failed: 0,
          alreadySynced: alreadySynced.length,
          skippedNonPublic: skippedNonPublic.length,
          scope: isAdmin ? 'all' : 'public_only'
        },
        details: {
          alreadySynced,
          skippedNonPublic
        }
      });
    }

    let created = 0;
    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    // 1. CREATE new events in Google Calendar
    console.log(`\n➕ [Calendar Export] Criando ${eventsToCreate.length} eventos novos no Google...`);
    for (const event of eventsToCreate) {
      try {
        console.log(`🔄 [Calendar Export] Criando "${event.title}"...`);
        console.log(`   - Evento ID: ${event.id}`);
        console.log(`   - Data: ${event.start}`);
        console.log(`   - Calendário destino: ${config.calendarId}`);

        const googleEventId = await googleCalendarService.createEventInGoogle(
          event,
          config
        );

        console.log(`✅ [Calendar Export] Evento criado no Google: ${googleEventId}`);

        // Update event with Google Calendar ID usando Admin SDK
        await firestore
          .collection('events')
          .doc(event.id)
          .update({
            google_calendar_id: googleEventId,
            last_synced_at: new Date().toISOString(),
          });

        console.log(`✅ [Calendar Export] Firestore atualizado com google_calendar_id`);
        created++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to create "${event.title}": ${errorMessage}`);
        console.error(`❌ [Calendar Export] Falha ao criar "${event.title}":`, errorMessage);
        console.error(`❌ [Calendar Export] Stack:`, error instanceof Error ? error.stack : error);
      }
    }

    // 2. UPDATE modified events in Google Calendar
    console.log(`\n✏️ [Calendar Export] Atualizando ${eventsToUpdate.length} eventos modificados no Google...`);
    for (const event of eventsToUpdate) {
      try {
        console.log(`🔄 [Calendar Export] Atualizando "${event.title}"...`);
        console.log(`   - Evento ID: ${event.id}`);
        console.log(`   - Google Calendar ID: ${event.google_calendar_id}`);
        console.log(`   - updated_at: ${event.updated_at}`);
        console.log(`   - last_synced_at: ${event.last_synced_at}`);

        await googleCalendarService.updateEventInGoogle(
          event as any,
          config
        );

        console.log(`✅ [Calendar Export] Evento atualizado no Google`);

        // Update last_synced_at usando Admin SDK
        await firestore
          .collection('events')
          .doc(event.id)
          .update({
            last_synced_at: new Date().toISOString(),
          });

        console.log(`✅ [Calendar Export] Firestore atualizado com last_synced_at`);
        updated++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to update "${event.title}": ${errorMessage}`);
        console.error(`❌ [Calendar Export] Falha ao atualizar "${event.title}":`, errorMessage);
        console.error(`❌ [Calendar Export] Stack:`, error instanceof Error ? error.stack : error);
      }
    }

    console.log(`\n✅ [Calendar Export] Concluído: ${created} criados, ${updated} atualizados, ${failed} falharam`);

    return NextResponse.json({
      success: true,
      message: `Exported ${created + updated} events to Google Calendar (${created} created, ${updated} updated)`,
      stats: {
        total: eventsToCreate.length + eventsToUpdate.length,
        created,
        updated,
        exported: created + updated, // For backwards compatibility
        failed,
        scope: isAdmin ? 'all' : 'public_only'
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('❌ [Calendar Export] Erro:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Failed to export events', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
