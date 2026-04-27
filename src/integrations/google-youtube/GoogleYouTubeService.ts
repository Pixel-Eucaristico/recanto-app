/**
 * Google YouTube Integration Service
 * Handles OAuth, listing user's videos, and resumable upload.
 */

import { google, youtube_v3 } from 'googleapis';
import { OAuth2Client, Credentials } from 'google-auth-library';
import { Readable } from 'stream';
import { encodeState } from '@/integrations/google/oauthState';
import { env } from '@/config/env';

const cleanEnvVar = (value: string | undefined): string =>
  (value || '').replace(/[\r\n]/g, '').trim();

/** Callback unificado já validado pelo zod schema (env.ts). */
function resolveCallbackUri(): string {
  if (env.GOOGLE_OAUTH_CALLBACK_URL) return env.GOOGLE_OAUTH_CALLBACK_URL;
  if (env.NEXT_PUBLIC_APP_URL) return `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/api/google/callback`;
  return 'http://localhost:3000/api/google/callback';
}

export type YouTubeTokens = Credentials;

export interface YouTubeVideoSummary {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  durationSeconds: number;
  privacyStatus: 'public' | 'unlisted' | 'private' | string;
  url: string;
  embedUrl: string;
}

export interface YouTubeUploadInput {
  /** Buffer or stream of the video file */
  body: Buffer | Readable;
  mimeType: string;
  title: string;
  description?: string;
  /** Default unlisted — recommended for course videos. */
  privacy?: 'public' | 'unlisted' | 'private';
  tags?: string[];
}

const TOKENS_COLLECTION = 'google_youtube_tokens';

export class GoogleYouTubeService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      cleanEnvVar(process.env.GOOGLE_CLIENT_ID),
      cleanEnvVar(process.env.GOOGLE_CLIENT_SECRET),
      resolveCallbackUri(),
    );
  }

  /**
   * OAuth URL with state encoding `{ integration, uid, returnTo }`.
   * @param returnTo Caminho relativo pra redirecionar após callback.
   */
  getAuthUrl(userId: string, returnTo: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube',
    ];
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: encodeState({ integration: 'youtube', uid: userId, returnTo }),
    });
  }

  async getTokensFromCode(code: string): Promise<YouTubeTokens> {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens as YouTubeTokens;
  }

  async saveTokens(userId: string, tokens: YouTubeTokens): Promise<void> {
    const { firestore } = await import('@/domains/auth/services/firebaseAdmin');
    await firestore.collection(TOKENS_COLLECTION).doc(userId).set({
      ...tokens,
      userId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }

  async getTokens(userId: string): Promise<YouTubeTokens | null> {
    const { firestore } = await import('@/domains/auth/services/firebaseAdmin');
    const doc = await firestore.collection(TOKENS_COLLECTION).doc(userId).get();
    if (!doc.exists) return null;
    return doc.data() as YouTubeTokens;
  }

  async deleteTokens(userId: string): Promise<void> {
    const { firestore } = await import('@/domains/auth/services/firebaseAdmin');
    await firestore.collection(TOKENS_COLLECTION).doc(userId).delete();
  }

  /** Set credentials and refresh if expired. Returns updated tokens for persistence. */
  private async authedClient(userId: string): Promise<{ client: OAuth2Client; tokens: YouTubeTokens }> {
    const tokens = await this.getTokens(userId);
    if (!tokens) throw new Error('YouTube não conectado para este usuário.');

    this.oauth2Client.setCredentials(tokens);

    // Auto-refresh if expired
    if (tokens.expiry_date && tokens.expiry_date < Date.now() + 60_000) {
      if (!tokens.refresh_token) throw new Error('Refresh token ausente — reconecte o YouTube.');
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      const merged: YouTubeTokens = { ...tokens, ...credentials };
      await this.saveTokens(userId, merged);
      this.oauth2Client.setCredentials(merged);
      return { client: this.oauth2Client, tokens: merged };
    }

    return { client: this.oauth2Client, tokens };
  }

  /**
   * List authenticated user's uploaded videos (most recent first).
   * Uses channels().list to find uploads playlist, then playlistItems().list.
   */
  async listMyVideos(userId: string, opts?: { maxResults?: number }): Promise<YouTubeVideoSummary[]> {
    const { client } = await this.authedClient(userId);
    const youtube = google.youtube({ version: 'v3', auth: client });

    // Find user's "uploads" playlist ID via channel
    const channelRes = await youtube.channels.list({
      part: ['contentDetails'],
      mine: true,
    });
    const uploadsId = channelRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsId) return [];

    // Pull playlist items
    const itemsRes = await youtube.playlistItems.list({
      part: ['contentDetails', 'snippet'],
      playlistId: uploadsId,
      maxResults: opts?.maxResults ?? 50,
    });
    const videoIds = (itemsRes.data.items ?? [])
      .map(i => i.contentDetails?.videoId)
      .filter((v): v is string => !!v);

    if (videoIds.length === 0) return [];

    // Fetch full metadata (duration, privacy)
    const videosRes = await youtube.videos.list({
      part: ['snippet', 'contentDetails', 'status'],
      id: videoIds,
      maxResults: 50,
    });

    // Filtra: só vídeos embeddáveis (público ou não listado).
    // Privados não funcionam em iframe externo — não dá pra anexar na aula.
    return (videosRes.data.items ?? [])
      .filter(v => {
        const privacy = v.status?.privacyStatus;
        return privacy === 'public' || privacy === 'unlisted';
      })
      .map(v => ({
        id: v.id ?? '',
        title: v.snippet?.title ?? '(sem título)',
        description: v.snippet?.description ?? '',
        thumbnail: v.snippet?.thumbnails?.medium?.url ?? v.snippet?.thumbnails?.default?.url ?? '',
        publishedAt: v.snippet?.publishedAt ?? '',
        durationSeconds: parseIso8601Duration(v.contentDetails?.duration ?? 'PT0S'),
        privacyStatus: v.status?.privacyStatus ?? 'unlisted',
        url: `https://www.youtube.com/watch?v=${v.id}`,
        embedUrl: `https://www.youtube.com/embed/${v.id}`,
      }));
  }

  /**
   * Creates a resumable upload session at YouTube.
   * Returns the session URL so the BROWSER can upload directly to YouTube
   * (bypasses our server — no body size limit).
   *
   * Reference: https://developers.google.com/youtube/v3/docs/videos/insert#resumable-upload
   */
  async createResumableSession(userId: string, input: {
    title: string;
    description?: string;
    fileSize: number;
    mimeType: string;
    privacy?: 'public' | 'unlisted' | 'private';
    tags?: string[];
  }): Promise<string> {
    const { tokens } = await this.authedClient(userId);
    const accessToken = tokens.access_token;
    if (!accessToken) throw new Error('Access token ausente');

    const metadata = {
      snippet: {
        title: input.title,
        description: input.description ?? '',
        tags: input.tags,
      },
      status: {
        privacyStatus: input.privacy ?? 'unlisted',
        selfDeclaredMadeForKids: false,
      },
    };

    const res = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,contentDetails',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Length': String(input.fileSize),
          'X-Upload-Content-Type': input.mimeType,
        },
        body: JSON.stringify(metadata),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Falha ao criar sessão YouTube: ${res.status} ${text}`);
    }

    const uploadUrl = res.headers.get('location');
    if (!uploadUrl) throw new Error('YouTube não retornou URL da sessão de upload.');
    return uploadUrl;
  }

  /**
   * Upload a video file. Returns the video ID + URL.
   * Privacy default: unlisted (recommended for courses).
   */
  async uploadVideo(userId: string, input: YouTubeUploadInput): Promise<YouTubeVideoSummary> {
    const { client } = await this.authedClient(userId);
    const youtube = google.youtube({ version: 'v3', auth: client });

    const body = input.body instanceof Readable
      ? input.body
      : Readable.from(input.body);

    const res = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: input.title,
          description: input.description ?? '',
          tags: input.tags,
        },
        status: {
          privacyStatus: input.privacy ?? 'unlisted',
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        mimeType: input.mimeType,
        body,
      },
    });

    const v = res.data as youtube_v3.Schema$Video;
    return {
      id: v.id ?? '',
      title: v.snippet?.title ?? input.title,
      description: v.snippet?.description ?? '',
      thumbnail: v.snippet?.thumbnails?.medium?.url ?? '',
      publishedAt: v.snippet?.publishedAt ?? new Date().toISOString(),
      durationSeconds: parseIso8601Duration(v.contentDetails?.duration ?? 'PT0S'),
      privacyStatus: v.status?.privacyStatus ?? 'unlisted',
      url: `https://www.youtube.com/watch?v=${v.id}`,
      embedUrl: `https://www.youtube.com/embed/${v.id}`,
    };
  }
}

/** Parses ISO 8601 duration like 'PT1H2M30S' to seconds. */
function parseIso8601Duration(iso: string): number {
  const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;
  const h = Number(match[1] ?? 0);
  const m = Number(match[2] ?? 0);
  const s = Number(match[3] ?? 0);
  return h * 3600 + m * 60 + s;
}

export const googleYouTubeService = new GoogleYouTubeService();
