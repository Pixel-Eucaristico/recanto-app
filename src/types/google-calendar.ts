/**
 * Google Calendar API Integration Types
 * Defines types for bidirectional sync between Google Calendar and Firestore
 */

/**
 * Google Calendar OAuth tokens
 */
export interface GoogleCalendarTokens {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

/**
 * Google Calendar configuration for admin user
 */
export interface GoogleCalendarConfig {
  userId: string; // Admin user ID
  calendarId: string; // Primary calendar ID (usually email)
  tokens: GoogleCalendarTokens;
  syncEnabled: boolean;
  lastSync?: string; // ISO timestamp
  webhookChannelId?: string; // For push notifications
  webhookResourceId?: string;
  webhookExpiration?: number;
}

/**
 * Google Calendar Event (from Google API)
 */
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  status?: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink?: string;
  created?: string;
  updated?: string;
  creator?: {
    email?: string;
    displayName?: string;
  };
}

/**
 * Extended Event type with public flag and sync metadata
 */
export interface SyncedEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: string; // ISO timestamp
  end: string; // ISO timestamp
  isPublic: boolean; // Only admin can set to true
  googleCalendarId?: string; // ID in Google Calendar
  lastSyncedAt?: string; // ISO timestamp
  createdBy: string; // User ID
  createdAt: string;
  updatedAt: string;
}

/**
 * Sync operation result
 */
export interface SyncResult {
  success: boolean;
  eventsAdded: number;
  eventsUpdated: number;
  eventsDeleted: number;
  errors: string[];
}

/**
 * Webhook notification from Google Calendar
 */
export interface GoogleCalendarWebhook {
  channelId: string;
  resourceId: string;
  resourceState: 'sync' | 'exists' | 'not_exists';
  resourceUri: string;
  channelExpiration: string;
}
