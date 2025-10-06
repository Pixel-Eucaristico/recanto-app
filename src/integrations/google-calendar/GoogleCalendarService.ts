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
import { Event } from '@/types/firebase-entities';
import { eventService } from '@/services/firebase';
import { firestore } from '@/domains/auth/services/firebaseAdmin';

/**
 * Google Calendar Service for OAuth and sync operations
 */
export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private calendar;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Force to get refresh token
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
   * Get Google Calendar configuration from Firestore
   */
  async getConfig(userId: string): Promise<GoogleCalendarConfig | null> {
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
    const start =
      googleEvent.start.dateTime || `${googleEvent.start.date}T00:00:00Z`;
    const end = googleEvent.end.dateTime || `${googleEvent.end.date}T23:59:59Z`;

    return {
      title: googleEvent.summary || 'Sem título',
      description: googleEvent.description || '',
      start,
      end,
      location: googleEvent.location,
      google_calendar_id: googleEvent.id,
      last_synced_at: new Date().toISOString(),
      created_by: userId,
      is_public: false, // Default to private, admin can change later
      target_audience: [], // Admin can configure later
      type: 'outro', // Default type
    };
  }

  /**
   * Convert Firestore Event to Google Calendar Event
   */
  private firestoreEventToGoogleEvent(event: Event): Partial<GoogleCalendarEvent> {
    return {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.start,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: event.end,
        timeZone: 'America/Sao_Paulo',
      },
      status: 'confirmed',
    };
  }

  /**
   * Fetch events from Google Calendar
   */
  async fetchGoogleCalendarEvents(
    calendarId: string,
    tokens: GoogleCalendarTokens
  ): Promise<GoogleCalendarEvent[]> {
    this.setCredentials(tokens);

    const response = await this.calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(),
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return (response.data.items || []) as GoogleCalendarEvent[];
  }

  /**
   * Sync events from Google Calendar to Firestore
   */
  async syncFromGoogleCalendar(userId: string): Promise<SyncResult> {
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
        throw new Error('Google Calendar sync not configured or disabled');
      }

      // Refresh token if needed
      let tokens = config.tokens;
      if (tokens.expiry_date && Date.now() >= tokens.expiry_date) {
        tokens = await this.refreshAccessToken(tokens.refresh_token);
        await this.saveConfig(userId, { tokens });
      }

      // Fetch events from Google Calendar
      const googleEvents = await this.fetchGoogleCalendarEvents(
        config.calendarId,
        tokens
      );

      // Get existing events with google_calendar_id
      const existingEvents = await eventService.getAll();
      const existingEventsMap = new Map(
        existingEvents
          .filter((e) => e.google_calendar_id)
          .map((e) => [e.google_calendar_id!, e])
      );

      // Sync each Google event
      for (const googleEvent of googleEvents) {
        try {
          const existingEvent = existingEventsMap.get(googleEvent.id);

          if (existingEvent) {
            // Update existing event
            const updates = this.googleEventToFirestoreEvent(googleEvent, userId);
            await eventService.update(existingEvent.id, updates);
            result.eventsUpdated++;
          } else {
            // Create new event
            const newEvent = this.googleEventToFirestoreEvent(googleEvent, userId);
            await eventService.create(newEvent as Event);
            result.eventsAdded++;
          }
        } catch (error) {
          result.errors.push(
            `Failed to sync event ${googleEvent.id}: ${error}`
          );
        }
      }

      // Update last sync timestamp
      await this.saveConfig(userId, {
        lastSync: new Date().toISOString(),
      });
    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error}`);
    }

    return result;
  }

  /**
   * Create event in Google Calendar
   */
  async createEventInGoogle(
    event: Event,
    config: GoogleCalendarConfig
  ): Promise<string> {
    this.setCredentials(config.tokens);

    const googleEvent = this.firestoreEventToGoogleEvent(event);

    const response = await this.calendar.events.insert({
      calendarId: config.calendarId,
      requestBody: googleEvent as any,
    });

    return response.data.id!;
  }

  /**
   * Update event in Google Calendar
   */
  async updateEventInGoogle(
    event: Event,
    config: GoogleCalendarConfig
  ): Promise<void> {
    if (!event.google_calendar_id) {
      throw new Error('Event does not have google_calendar_id');
    }

    this.setCredentials(config.tokens);

    const googleEvent = this.firestoreEventToGoogleEvent(event);

    await this.calendar.events.update({
      calendarId: config.calendarId,
      eventId: event.google_calendar_id,
      requestBody: googleEvent as any,
    });
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
