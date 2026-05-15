/**
 * Serviço de Sincronização Automática com Google Calendar
 * Monitora mudanças em eventos e sincroniza automaticamente
 *
 * IMPORTANTE: Este serviço é SERVER-SIDE ONLY
 */

import type { Event } from '@/types/firebase-entities';

export class CalendarAutoSyncService {
  private syncInterval: NodeJS.Timeout | null = null;

  // Intervalo configurável via .env (padrão: 1 hora)
  private get SYNC_INTERVAL_MS(): number {
    const envInterval = process.env.CALENDAR_SYNC_INTERVAL_MS;
    return envInterval ? parseInt(envInterval, 10) : 3600000; // 1 hora padrão
  }

  /**
   * Inicia sincronização automática periódica
   */
  startAutoSync() {
    if (this.syncInterval) {
      console.log('⏭️ Sync automático já está rodando');
      return;
    }

    const intervalMinutes = Math.floor(this.SYNC_INTERVAL_MS / 60000);
    console.log(`🔄 Iniciando sync automático a cada ${intervalMinutes} minutos`);

    // Executar imediatamente
    this.syncAllUsers();

    // Executar periodicamente
    this.syncInterval = setInterval(() => {
      this.syncAllUsers();
    }, this.SYNC_INTERVAL_MS);
  }

  /**
   * Para sincronização automática
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏸️ Sync automático parado');
    }
  }

  /**
   * Sincroniza todos os usuários conectados
   */
  private async syncAllUsers() {
    try {
      const startTime = Date.now();

      // Buscar todas as configurações de calendário ativas
      const { firestore } = await import('@/domains/auth/services/firebaseAdmin');
      const configsSnapshot = await firestore
        .collection('google_calendar_configs')
        .where('syncEnabled', '==', true)
        .get();

      if (configsSnapshot.empty) {
        return;
      }

      let totalImported = 0;
      let totalExported = 0;
      let errors = 0;

      console.log(`🔄 Iniciando sync: ${configsSnapshot.size} calendários`);

      // Lazy import do Google Calendar Service
      const { googleCalendarService } = await import('@/integrations/google-calendar/GoogleCalendarService');

      for (const doc of configsSnapshot.docs) {
        const config = doc.data() as import('@/types/google-calendar').GoogleCalendarConfig;
        const userId = doc.id;

        try {
          // Buscar role do usuário
          const userDoc = await firestore.collection('users').doc(userId).get();
          const userData = userDoc.data();
          const userRole = userData?.role || null;

          // Adicionar role ao config
          const configWithRole = { ...config, role: userRole };

          // Importar do Google Calendar
          const importResult = await googleCalendarService.syncFromGoogleCalendar(userId);
          totalImported += importResult.eventsAdded || 0;

          // Exportar eventos novos/atualizados para Google Calendar
          const exported = await this.exportNewEventsForUser(userId, configWithRole, firestore);
          totalExported += exported;
        } catch (error) {
          errors++;
          console.error(`❌ Erro ao sincronizar usuário ${userId}:`, error instanceof Error ? error.message : 'Unknown');
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Sync concluído em ${duration}s: ${totalImported} importados, ${totalExported} exportados${errors > 0 ? `, ${errors} erros` : ''}`);
    } catch (error) {
      console.error('❌ Erro no sync automático:', error instanceof Error ? error.message : 'Unknown');
    }
  }

  /**
   * Exporta eventos novos para o calendário do usuário
   * @returns Número de eventos exportados com sucesso
   */
  private async exportNewEventsForUser(userId: string, config: any, firestore: any): Promise<number> {
    try {
      // Lazy import do Google Calendar Service
      const { googleCalendarService } = await import('@/integrations/google-calendar/GoogleCalendarService');

      // Query para eventos futuros sem google_calendar_id
      const now = new Date().toISOString();
      let eventsQuery = firestore
        .collection('events')
        .where('start', '>=', now)
        .limit(100);

      const eventsSnapshot = await eventsQuery.get();

      if (eventsSnapshot.empty) {
        return 0;
      }

      // Filtrar eventos baseado no role do usuário
      const isAdmin = config.role === 'admin';
      const eventsToExport: Event[] = [];

      for (const doc of eventsSnapshot.docs) {
        const event = { id: doc.id, ...doc.data() } as Event;

        // Pular eventos que já estão sincronizados
        if (event.google_calendar_id) {
          continue;
        }

        // Admin: todos os eventos | Outros: apenas públicos
        if (isAdmin || event.is_public) {
          eventsToExport.push(event);
        }
      }

      if (eventsToExport.length === 0) {
        return 0;
      }

      let exported = 0;

      for (const event of eventsToExport) {
        try {
          const googleEventId = await googleCalendarService.createEventInGoogle(event, config);

          // Atualizar evento com ID do Google Calendar usando Admin SDK
          await firestore
            .collection('events')
            .doc(event.id)
            .update({
              google_calendar_id: googleEventId,
              last_synced_at: new Date().toISOString(),
            });

          exported++;
        } catch (error) {
          console.error(`❌ Erro ao exportar evento ${event.id}:`, error instanceof Error ? error.message : 'Unknown');
        }
      }

      return exported;
    } catch (error) {
      console.error(`❌ Erro ao exportar eventos:`, error instanceof Error ? error.message : 'Unknown');
      return 0;
    }
  }

  /**
   * Sincroniza um evento específico imediatamente
   */
  async syncEvent(eventId: string) {
    try {
      // Lazy imports
      const { firestore } = await import('@/domains/auth/services/firebaseAdmin');
      const { googleCalendarService } = await import('@/integrations/google-calendar/GoogleCalendarService');

      // Buscar evento usando Admin SDK
      const eventDoc = await firestore.collection('events').doc(eventId).get();

      if (!eventDoc.exists) {
        throw new Error('Evento não encontrado');
      }

      const event = { id: eventDoc.id, ...eventDoc.data() } as Event;

      // Buscar todos os usuários conectados
      const configsSnapshot = await firestore
        .collection('google_calendar_configs')
        .where('syncEnabled', '==', true)
        .get();

      for (const doc of configsSnapshot.docs) {
        const config = doc.data() as import('@/types/google-calendar').GoogleCalendarConfig;
        const userId = doc.id;

        try {
          // Buscar role do usuário
          const userDoc = await firestore.collection('users').doc(userId).get();
          const userData = userDoc.data();
          const userRole = userData?.role || null;

          // Verificar se o usuário deve ver este evento
          const isAdmin = userRole === 'admin';
          if (!isAdmin && !event.is_public) {
            continue; // Pular se não for admin e evento for privado
          }

          // Adicionar role ao config
          const configWithRole = { ...config, role: userRole };

          if (event.google_calendar_id) {
            // Atualizar evento existente
            await googleCalendarService.updateEventInGoogle(event, configWithRole);
          } else {
            // Criar novo evento
            const googleEventId = await googleCalendarService.createEventInGoogle(event, configWithRole);

            // Atualizar evento com ID do Google Calendar usando Admin SDK
            await firestore
              .collection('events')
              .doc(event.id)
              .update({
                google_calendar_id: googleEventId,
                last_synced_at: new Date().toISOString(),
              });
          }
        } catch (error) {
          console.error(`❌ Erro ao sincronizar evento para usuário ${userId}:`, error instanceof Error ? error.message : 'Unknown');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar evento:', error instanceof Error ? error.message : 'Unknown');
      throw error;
    }
  }
}

// Exportar instância singleton
export const calendarAutoSync = new CalendarAutoSyncService();
