/**
 * Google Calendar Integration Service
 * Handles bidirectional sync between Google Calendar and Firestore
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import {
  GoogleCalendarConfig,
  GoogleCalendarEvent,
  GoogleCalendarTokens,
  SyncResult,
} from '@/types/google-calendar';
import type { Event } from '@/types/firebase-entities';

// Helper to clean environment variables (removes newlines, carriage returns, and trims)
const cleanEnvVar = (value: string | undefined): string =>
  (value || '').replace(/[\r\n]/g, '').trim();

/**
 * Google Calendar Service for OAuth and sync operations
 */
export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private calendar;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      cleanEnvVar(process.env.GOOGLE_CLIENT_ID),
      cleanEnvVar(process.env.GOOGLE_CLIENT_SECRET),
      cleanEnvVar(process.env.GOOGLE_REDIRECT_URI)
    );

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Get OAuth authorization URL with userId as state
   */
  getAuthUrl(userId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force to get refresh token
      state: userId, // Pass userId to recover in callback
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string): Promise<GoogleCalendarTokens> {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens as GoogleCalendarTokens;
  }

  /**
   * Set credentials for authenticated requests
   */
  setCredentials(tokens: GoogleCalendarTokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Refresh access token if expired
   */
  async refreshAccessToken(
    refreshToken: string
  ): Promise<GoogleCalendarTokens> {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials as GoogleCalendarTokens;
  }

  /**
   * Save Google Calendar configuration to Firestore
   */
  async saveConfig(userId: string, config: Partial<GoogleCalendarConfig>) {
    const { firestore } = await import('@/domains/auth/services/firebaseAdmin');
    const configRef = firestore
      .collection('google_calendar_configs')
      .doc(userId);

    await configRef.set(
      {
        ...config,
        userId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }

  /**
   * Delete Google Calendar configuration from Firestore
   */
  async deleteConfig(userId: string): Promise<void> {
    const { firestore } = await import('@/domains/auth/services/firebaseAdmin');
    const configRef = firestore
      .collection('google_calendar_configs')
      .doc(userId);

    await configRef.delete();
  }

  /**
   * Get Google Calendar configuration from Firestore
   */
  async getConfig(userId: string): Promise<GoogleCalendarConfig | null> {
    const { firestore } = await import('@/domains/auth/services/firebaseAdmin');
    const configRef = firestore
      .collection('google_calendar_configs')
      .doc(userId);
    const doc = await configRef.get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as GoogleCalendarConfig;
  }

  /**
   * Convert Google Calendar Event to Firestore Event
   */
  private googleEventToFirestoreEvent(
    googleEvent: GoogleCalendarEvent,
    userId: string
  ): Partial<Event> {
    // Handle All-Day events (Google only provides 'date' for them)
    let start, end;
    if (googleEvent.start.date) {
      // For all-day events, we set them to start at 00:00 in Sao Paulo
      // 00:00 BRT (UTC-3) is 03:00 UTC
      start = `${googleEvent.start.date}T03:00:00.000Z`;
      end = `${googleEvent.end.date}T23:59:59.000Z`;
    } else {
      start = googleEvent.start.dateTime!;
      end = googleEvent.end.dateTime!;
    }

    // ✅ Recuperar metadados customizados do Google Calendar
    const extendedProps = googleEvent.extendedProperties?.private;
    const eventType = extendedProps?.eventType as Event['type'] | undefined;
    const isPublic = extendedProps?.isPublic === 'true';

    const event: any = {
      title: googleEvent.summary || 'Sem título',
      description: googleEvent.description || '',
      start,
      end,
      google_calendar_id: googleEvent.id,
      last_synced_at: new Date().toISOString(),
      created_by: userId,
      is_public: isPublic,
      type: eventType || 'outro',
    };

    if (googleEvent.location) {
      event.location = googleEvent.location;
    }

    return event;
  }

  /**
   * List all user's calendars
   */
  async listCalendars(tokens: GoogleCalendarTokens): Promise<Array<{ id: string; summary: string; description?: string; primary?: boolean }>> {
    this.setCredentials(tokens);

    try {
      console.log('📋 [GoogleCalendarService] Iniciando listagem de calendários...');
      console.log('📋 [GoogleCalendarService] Tokens presentes:', {
        access_token: tokens.access_token ? 'SIM' : 'NÃO',
        refresh_token: tokens.refresh_token ? 'SIM' : 'NÃO',
        expiry_date: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : 'N/A'
      });

      const calendarList = await this.calendar.calendarList.list();

      console.log('📋 [GoogleCalendarService] Resposta da API recebida');
      console.log('📋 [GoogleCalendarService] Items:', calendarList.data.items?.length || 0);

      if (!calendarList.data.items || calendarList.data.items.length === 0) {
        console.warn('⚠️ [GoogleCalendarService] API retornou lista vazia de calendários');
        return [];
      }

      const calendars = calendarList.data.items.map(cal => ({
        id: cal.id!,
        summary: cal.summary || 'Sem nome',
        description: cal.description || undefined,
        primary: cal.primary || undefined
      }));

      console.log('✅ [GoogleCalendarService] Calendários processados:', calendars.length);

      return calendars;
    } catch (error: any) {
      console.error('❌ [GoogleCalendarService] Erro ao listar calendários:', error);
      console.error('❌ [GoogleCalendarService] Error code:', error.code);
      console.error('❌ [GoogleCalendarService] Error message:', error.message);

      if (error.response) {
        console.error('❌ [GoogleCalendarService] Response status:', error.response.status);
        console.error('❌ [GoogleCalendarService] Response data:', error.response.data);
      }

      // Provide more specific error messages
      if (error.code === 401 || error.message?.includes('invalid_grant')) {
        throw new Error('Token expirado ou inválido. Por favor, reconecte sua conta do Google.');
      } else if (error.code === 403) {
        throw new Error('Sem permissão para acessar calendários. Verifique as permissões da conta.');
      } else if (error.code === 'ENOTFOUND' || error.message?.includes('network')) {
        throw new Error('Erro de conexão com o Google Calendar. Verifique sua internet.');
      }

      throw new Error(`Erro ao listar calendários: ${error.message || 'Desconhecido'}`);
    }
  }

  /**
   * Create a custom calendar with given name
   */
  async createCustomCalendar(tokens: GoogleCalendarTokens, calendarName: string): Promise<string> {
    this.setCredentials(tokens);

    try {
      const newCalendar = await this.calendar.calendars.insert({
        requestBody: {
          summary: calendarName,
          description: `Calendário personalizado para ${calendarName}`,
          timeZone: 'America/Sao_Paulo',
        },
      });

      console.log('✅ Calendário personalizado criado:', newCalendar.data.id);
      return newCalendar.data.id!;
    } catch (error) {
      console.error('❌ Erro ao criar calendário personalizado:', error);
      throw error;
    }
  }

  /**
   * Create or get "Recanto" secondary calendar
   */
  async createRecantoCalendar(tokens: GoogleCalendarTokens): Promise<string> {
    this.setCredentials(tokens);

    try {
      // List all calendars to check if "Recanto" already exists
      const calendarList = await this.calendar.calendarList.list();
      const recantoCalendar = calendarList.data.items?.find(
        cal => cal.summary === 'Recanto do Amor Misericordioso'
      );

      if (recantoCalendar && recantoCalendar.id) {
        console.log('✅ Calendário "Recanto" já existe:', recantoCalendar.id);
        return recantoCalendar.id;
      }

      // Create new secondary calendar
      const newCalendar = await this.calendar.calendars.insert({
        requestBody: {
          summary: 'Recanto do Amor Misericordioso',
          description: 'Agenda da comunidade Recanto do Amor Misericordioso',
          timeZone: 'America/Sao_Paulo',
        },
      });

      console.log('✅ Calendário "Recanto" criado:', newCalendar.data.id);
      return newCalendar.data.id!;
    } catch (error) {
      console.error('❌ Erro ao criar calendário Recanto:', error);
      throw error;
    }
  }

  /**
   * Convert Firestore Event to Google Calendar Event
   */
  private firestoreEventToGoogleEvent(event: Event): Partial<GoogleCalendarEvent> {
    // Título sem prefixo pois já está em calendário separado
    const summary = event.title;

    // Descrição do evento
    const description = event.description || '';

    const googleEvent: any = {
      summary,
      description,
      start: {
        dateTime: event.start,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: event.end,
        timeZone: 'America/Sao_Paulo',
      },
      status: 'confirmed',
      // ✅ Armazenar metadados customizados no Google Calendar
      extendedProperties: {
        private: {
          eventType: event.type || 'outro', // Preservar o tipo do evento
          isPublic: event.is_public ? 'true' : 'false', // Preservar visibilidade
          firestoreId: event.id || '', // Referência ao Firestore
        },
      },
    };

    // Only add location if it exists
    if (event.location) {
      googleEvent.location = event.location;
    }

    console.log('📋 [firestoreEventToGoogleEvent] Metadados preservados:', {
      eventType: event.type,
      isPublic: event.is_public,
      firestoreId: event.id
    });

    return googleEvent;
  }

  /**
   * Fetch events from Google Calendar
   */
  async fetchGoogleCalendarEvents(
    calendarId: string,
    tokens: GoogleCalendarTokens
  ): Promise<GoogleCalendarEvent[]> {
    console.log('📋 [fetchGoogleCalendarEvents] Buscando eventos...');
    console.log('   - Calendar ID:', calendarId);

    const now = new Date().toISOString();
    console.log('   - timeMin (agora):', now);

    this.setCredentials(tokens);

    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: now,
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = (response.data.items || []) as GoogleCalendarEvent[];
      console.log(`✅ [fetchGoogleCalendarEvents] ${events.length} eventos retornados pela API`);

      if (events.length === 0) {
        console.warn('⚠️ [fetchGoogleCalendarEvents] Nenhum evento futuro encontrado no Google Calendar');
        console.warn('   - Verifique se há eventos com data/hora >= agora');
        console.warn('   - Verifique se está buscando no calendário correto');
      }

      return events;
    } catch (error: any) {
      console.error('❌ [fetchGoogleCalendarEvents] Erro ao buscar eventos:', error);
      console.error('❌ [fetchGoogleCalendarEvents] Error code:', error.code);
      console.error('❌ [fetchGoogleCalendarEvents] Error message:', error.message);

      if (error.response) {
        console.error('❌ [fetchGoogleCalendarEvents] Response status:', error.response.status);
        console.error('❌ [fetchGoogleCalendarEvents] Response data:', error.response.data);
      }

      throw error;
    }
  }

  /**
   * Sync events from Google Calendar to Firestore
   */
  async syncFromGoogleCalendar(userId: string): Promise<SyncResult> {
    console.log('📥 [syncFromGoogleCalendar] Iniciando importação...');
    console.log('📥 [syncFromGoogleCalendar] User ID:', userId);

    const result: SyncResult = {
      success: true,
      eventsAdded: 0,
      eventsUpdated: 0,
      eventsDeleted: 0,
      errors: [],
    };

    try {
      const config = await this.getConfig(userId);
      if (!config || !config.syncEnabled) {
        console.error('❌ [syncFromGoogleCalendar] Config não encontrada ou sync desabilitado');
        throw new Error('Google Calendar sync not configured or disabled');
      }

      console.log('✅ [syncFromGoogleCalendar] Config encontrada');
      console.log('   - Calendar ID:', config.calendarId);
      console.log('   - Sync enabled:', config.syncEnabled);

      // Refresh token if needed
      let tokens = config.tokens;
      if (tokens.expiry_date && Date.now() >= tokens.expiry_date) {
        console.log('🔄 [syncFromGoogleCalendar] Renovando tokens expirados...');
        tokens = await this.refreshAccessToken(tokens.refresh_token);
        await this.saveConfig(userId, { tokens });
        console.log('✅ [syncFromGoogleCalendar] Tokens renovados');
      }

      // Fetch events from Google Calendar
      console.log('📋 [syncFromGoogleCalendar] Buscando eventos do Google Calendar...');
      const googleEvents = await this.fetchGoogleCalendarEvents(
        config.calendarId,
        tokens
      );

      console.log(`✅ [syncFromGoogleCalendar] ${googleEvents.length} eventos encontrados no Google Calendar`);

      if (googleEvents.length > 0) {
        console.log('📋 [syncFromGoogleCalendar] Eventos do Google:');
        googleEvents.forEach(e => {
          console.log(`   - ${e.summary} (${e.start.dateTime || e.start.date}) [ID: ${e.id}]`);
        });
      }

      // ✅ Usar Firebase Admin SDK para buscar eventos
      const { firestore } = await import('@/domains/auth/services/firebaseAdmin');
      console.log('📋 [syncFromGoogleCalendar] Buscando eventos existentes no Firestore...');

      const eventsSnapshot = await firestore
        .collection('events')
        .where('google_calendar_id', '!=', null)
        .get();

      console.log(`✅ [syncFromGoogleCalendar] ${eventsSnapshot.size} eventos com google_calendar_id no Firestore`);

      const existingEventsMap = new Map(
        eventsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return [data.google_calendar_id, { id: doc.id, ...data }];
        })
      );

      console.log('📋 [syncFromGoogleCalendar] IDs já sincronizados:', Array.from(existingEventsMap.keys()));

      // Sync each Google event
      console.log(`🔄 [syncFromGoogleCalendar] Processando ${googleEvents.length} eventos...`);

      for (const googleEvent of googleEvents) {
        try {
          console.log(`\n🔄 [syncFromGoogleCalendar] Processando: "${googleEvent.summary}"`);
          console.log(`   - Google Event ID: ${googleEvent.id}`);
          console.log(`   - Google updated: ${googleEvent.updated}`);

          const existingEvent = existingEventsMap.get(googleEvent.id) as any;

          if (existingEvent) {
            console.log(`   ✏️ Evento já existe no Firestore (ID: ${existingEvent.id})`);
            console.log(`   - Firestore updated_at: ${existingEvent.updated_at}`);
            console.log(`   - Google updated: ${googleEvent.updated}`);

            // ✅ IMPORTANTE: Só atualizar se o Google tem dados mais recentes
            const googleUpdatedTime = googleEvent.updated ? new Date(googleEvent.updated).getTime() : 0;
            const firestoreUpdatedTime = existingEvent.updated_at ? new Date(existingEvent.updated_at).getTime() : 0;

            if (googleUpdatedTime > firestoreUpdatedTime) {
              console.log(`   ✏️ Google tem dados mais recentes, atualizando...`);
              // Update existing event usando Admin SDK
              const updates = this.googleEventToFirestoreEvent(googleEvent, userId);
              
              // PRESERVE existing metadata if not present in Google
              const finalUpdates = {
                ...updates,
                // Keep existing target_audience if it exists and updates doesn't have it
                target_audience: existingEvent.target_audience || ['admin', 'missionario', 'recantiano'],
                updated_at: new Date().toISOString(),
              };

              await firestore
                .collection('events')
                .doc(existingEvent.id)
                .update(finalUpdates);
              result.eventsUpdated++;
              console.log(`   ✅ Evento atualizado no Firestore`);
            } else {
              console.log(`   ⏭️ Firestore está mais atualizado, pulando importação`);
              console.log(`      (Google: ${new Date(googleUpdatedTime).toISOString()} vs Firestore: ${new Date(firestoreUpdatedTime).toISOString()})`);
            }
          } else {
            const newEvent = this.googleEventToFirestoreEvent(googleEvent, userId);
            
            // Set default audience for new events from Google
            const eventWithDefaults = {
                ...newEvent,
                target_audience: ['admin', 'missionario', 'recantiano'],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const docRef = await firestore.collection('events').add(eventWithDefaults);
            result.eventsAdded++;
            console.log(`   ✅ Evento criado no Firestore com ID: ${docRef.id}`);
          }
        } catch (error) {
          const errorMsg = `Failed to sync event ${googleEvent.id}: ${error instanceof Error ? error.message : 'Unknown'}`;
          console.error(`   ❌ Erro ao processar evento:`, errorMsg);
          console.error(`   ❌ Stack:`, error instanceof Error ? error.stack : error);
          result.errors.push(errorMsg);
        }
      }

      console.log(`\n✅ [syncFromGoogleCalendar] Processamento concluído:`);
      console.log(`   - Eventos adicionados: ${result.eventsAdded}`);
      console.log(`   - Eventos atualizados: ${result.eventsUpdated}`);
      console.log(`   - Erros: ${result.errors.length}`);

      if (result.errors.length > 0) {
        console.error(`   ⚠️ Erros encontrados:`, result.errors);
      }

      // Update last sync timestamp
      await this.saveConfig(userId, {
        lastSync: new Date().toISOString(),
      });

      console.log('✅ [syncFromGoogleCalendar] Last sync atualizado');
    } catch (error) {
      console.error('❌ [syncFromGoogleCalendar] Erro exception:', error);
      console.error('❌ [syncFromGoogleCalendar] Stack:', error instanceof Error ? error.stack : '');
      result.success = false;
      result.errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    console.log('\n📊 [syncFromGoogleCalendar] Resultado final:', result);
    return result;
  }

  /**
   * Create event in Google Calendar
   */
  async createEventInGoogle(
    event: Event,
    config: GoogleCalendarConfig
  ): Promise<string> {
    console.log('🔄 [GoogleCalendarService] createEventInGoogle iniciado');
    console.log('   - Evento:', event.title);
    console.log('   - Calendar ID:', config.calendarId);

    this.setCredentials(config.tokens);
    console.log('✅ [GoogleCalendarService] Credenciais configuradas');

    const googleEvent = this.firestoreEventToGoogleEvent(event);
    console.log('✅ [GoogleCalendarService] Evento convertido:', {
      summary: googleEvent.summary,
      start: googleEvent.start,
      end: googleEvent.end,
      location: googleEvent.location
    });

    try {
      const response = await this.calendar.events.insert({
        calendarId: config.calendarId,
        requestBody: googleEvent as any,
      });

      console.log('✅ [GoogleCalendarService] Evento criado com sucesso:', response.data.id);
      return response.data.id!;
    } catch (error: any) {
      console.error('❌ [GoogleCalendarService] Erro ao criar evento:', error);
      console.error('❌ [GoogleCalendarService] Error code:', error.code);
      console.error('❌ [GoogleCalendarService] Error message:', error.message);

      if (error.response) {
        console.error('❌ [GoogleCalendarService] Response status:', error.response.status);
        console.error('❌ [GoogleCalendarService] Response data:', error.response.data);
      }

      throw error;
    }
  }

  /**
   * Update event in Google Calendar
   */
  async updateEventInGoogle(
    event: Event,
    config: GoogleCalendarConfig
  ): Promise<void> {
    console.log('✏️ [updateEventInGoogle] Iniciando atualização...');
    console.log('   - Event ID:', event.id);
    console.log('   - Google Calendar ID:', event.google_calendar_id);
    console.log('   - Title:', event.title);
    console.log('   - Type:', event.type);

    if (!event.google_calendar_id) {
      throw new Error('Event does not have google_calendar_id');
    }

    this.setCredentials(config.tokens);
    console.log('✅ [updateEventInGoogle] Credenciais configuradas');

    const googleEvent = this.firestoreEventToGoogleEvent(event);
    console.log('✅ [updateEventInGoogle] Evento convertido para formato Google:', {
      summary: googleEvent.summary,
      start: googleEvent.start,
      end: googleEvent.end,
      extendedProperties: googleEvent.extendedProperties
    });

    try {
      await this.calendar.events.update({
        calendarId: config.calendarId,
        eventId: event.google_calendar_id,
        requestBody: googleEvent as any,
      });

      console.log('✅ [updateEventInGoogle] Evento atualizado com sucesso no Google');
    } catch (error: any) {
      console.error('❌ [updateEventInGoogle] Erro ao atualizar evento:', error);
      console.error('❌ [updateEventInGoogle] Error code:', error.code);
      console.error('❌ [updateEventInGoogle] Error message:', error.message);

      if (error.response) {
        console.error('❌ [updateEventInGoogle] Response status:', error.response.status);
        console.error('❌ [updateEventInGoogle] Response data:', error.response.data);
      }

      throw error;
    }
  }

  /**
   * Delete event from Google Calendar
   */
  async deleteEventFromGoogle(
    googleCalendarId: string,
    config: GoogleCalendarConfig
  ): Promise<void> {
    this.setCredentials(config.tokens);

    await this.calendar.events.delete({
      calendarId: config.calendarId,
      eventId: googleCalendarId,
    });
  }

  /**
   * Setup webhook for push notifications
   */
  async setupWebhook(
    userId: string,
    calendarId: string,
    tokens: GoogleCalendarTokens
  ): Promise<{ channelId: string; resourceId: string; expiration: number }> {
    this.setCredentials(tokens);

    const channelId = `${userId}-${Date.now()}`;
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/webhook`;

    const response = await this.calendar.events.watch({
      calendarId,
      requestBody: {
        id: channelId,
        type: 'web_hook',
        address: webhookUrl,
      },
    });

    return {
      channelId: response.data.id!,
      resourceId: response.data.resourceId!,
      expiration: parseInt(response.data.expiration!),
    };
  }

  /**
   * Stop webhook
   */
  async stopWebhook(channelId: string, resourceId: string): Promise<void> {
    await this.calendar.channels.stop({
      requestBody: {
        id: channelId,
        resourceId,
      },
    });
  }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService();
