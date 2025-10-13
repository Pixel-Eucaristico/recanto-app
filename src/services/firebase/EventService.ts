import { BaseFirebaseService } from './BaseFirebaseService';
import { Event } from '@/types/firebase-entities';
import { Role } from '@/features/auth/types/user';

class EventService extends BaseFirebaseService<Event> {
  constructor() {
    super('events');
  }

  /**
   * Busca eventos por tipo
   */
  async getEventsByType(type: Event['type']): Promise<Event[]> {
    return this.queryByField('type', type);
  }

  /**
   * Busca eventos acessíveis para um role específico
   * OTIMIZADO: Query direto no Firestore com array-contains!
   */
  async getEventsByRole(role: Role): Promise<Event[]> {
    return this.queryWithFilters([
      { field: 'target_audience', operator: 'array-contains', value: role }
    ]);
  }

  /**
   * Busca eventos por período
   * OTIMIZADO: Query direto no Firestore com range!
   */
  async getEventsByPeriod(startDate: string, endDate: string): Promise<Event[]> {
    return this.queryWithFilters([
      { field: 'start', operator: '>=', value: startDate },
      { field: 'start', operator: '<=', value: endDate }
    ]);
  }

  /**
   * Busca próximos eventos
   * OTIMIZADO: Query do Firestore com orderBy + limit (impossível no Realtime!)
   */
  async getUpcomingEvents(limit: number = 10): Promise<Event[]> {
    const today = new Date().toISOString();
    const { collection, query, where, orderBy: firestoreOrderBy, limit: firestoreLimit, getDocs } = await import('firebase/firestore');
    const { firestore } = await import('@/domains/auth/services/firebaseClient');

    const collectionRef = collection(firestore, 'events');
    const q = query(
      collectionRef,
      where('start', '>=', today),
      firestoreOrderBy('start', 'asc'),
      firestoreLimit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Event));
  }

  /**
   * Busca eventos públicos para exibir na página inicial
   * OTIMIZADO: Query do Firestore com filtro de is_public
   */
  async getPublicEvents(limit: number = 10): Promise<Event[]> {
    const today = new Date().toISOString();
    const { collection, query, where, orderBy: firestoreOrderBy, limit: firestoreLimit, getDocs } = await import('firebase/firestore');
    const { firestore } = await import('@/domains/auth/services/firebaseClient');

    const collectionRef = collection(firestore, 'events');
    const q = query(
      collectionRef,
      where('is_public', '==', true),
      where('start', '>=', today),
      firestoreOrderBy('start', 'asc'),
      firestoreLimit(limit)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Event));
  }

  /**
   * Marca evento como público (apenas admin pode fazer)
   */
  async setPublic(eventId: string, isPublic: boolean): Promise<void> {
    await this.update(eventId, { is_public: isPublic });
  }

  /**
   * Cria evento e sincroniza com Google Calendar (se configurado)
   * Usado pela API para sincronização automática
   */
  async createAndSync(event: Event, userId: string): Promise<Event> {
    const createdEvent = await this.create(event);

    // Sync to Google Calendar in background (server-side only)
    if (typeof window === 'undefined') {
      try {
        const { googleCalendarService } = await import('@/integrations/google-calendar/GoogleCalendarService');
        const config = await googleCalendarService.getConfig(userId);

        if (config && config.syncEnabled) {
          const googleEventId = await googleCalendarService.createEventInGoogle(
            createdEvent,
            config
          );

          // Update event with Google Calendar ID
          await this.update(createdEvent.id, {
            google_calendar_id: googleEventId,
            last_synced_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Failed to sync event to Google Calendar:', error);
        // Event is created in Firestore, sync failed but don't throw
      }
    }

    return createdEvent;
  }

  /**
   * Atualiza evento e sincroniza com Google Calendar (se configurado)
   */
  async updateAndSync(eventId: string, updates: Partial<Event>, userId: string): Promise<void> {
    await this.update(eventId, updates);

    // Sync to Google Calendar in background (server-side only)
    if (typeof window === 'undefined') {
      try {
        const event = await this.get(eventId);
        if (!event || !event.google_calendar_id) return;

        const { googleCalendarService } = await import('@/integrations/google-calendar/GoogleCalendarService');
        const config = await googleCalendarService.getConfig(userId);

        if (config && config.syncEnabled) {
          await googleCalendarService.updateEventInGoogle(event, config);
          await this.update(eventId, {
            last_synced_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Failed to sync event update to Google Calendar:', error);
      }
    }
  }

  /**
   * Deleta evento e sincroniza com Google Calendar (se configurado)
   */
  async deleteAndSync(eventId: string, userId: string): Promise<void> {
    // Get event before deletion
    const event = await this.get(eventId);

    await this.delete(eventId);

    // Sync to Google Calendar in background (server-side only)
    if (typeof window === 'undefined' && event?.google_calendar_id) {
      try {
        const { googleCalendarService } = await import('@/integrations/google-calendar/GoogleCalendarService');
        const config = await googleCalendarService.getConfig(userId);

        if (config && config.syncEnabled) {
          await googleCalendarService.deleteEventFromGoogle(
            event.google_calendar_id,
            config
          );
        }
      } catch (error) {
        console.error('Failed to sync event deletion to Google Calendar:', error);
      }
    }
  }
}

export const eventService = new EventService();
export default eventService;
