import { mediaRegistryRepository, IMediaRegistryRepository } from '@/infrastructure/media/MediaRegistryRepository';
import { MediaAsset, MediaKind } from '@/domain/media/types';

/**
 * Limite máximo de bytes por upload. Configurável via env `NEXT_PUBLIC_MEDIA_MAX_MB`.
 * Default 10 MB.
 */
const MAX_MB = Number(process.env.NEXT_PUBLIC_MEDIA_MAX_MB) || 10;
export const MAX_MEDIA_BYTES = MAX_MB * 1024 * 1024;

export interface UploadMediaInput {
  file: File;
  userId: string;
  folder?: string;
}

export interface UploadMediaResult {
  asset: MediaAsset;
  reused: boolean;
}

function kindFromMime(mime: string): MediaKind {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'image';
}

async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export class MediaService {
  constructor(private readonly repo: IMediaRegistryRepository = mediaRegistryRepository) {}

  async upload(input: UploadMediaInput): Promise<UploadMediaResult> {
    if (input.file.size > MAX_MEDIA_BYTES) {
      throw new Error(`Arquivo maior que ${Math.floor(MAX_MEDIA_BYTES / 1024 / 1024)} MB.`);
    }

    const hash = await hashFile(input.file);
    const existing = await this.repo.findByHash(hash);
    if (existing) {
      return { asset: existing, reused: true };
    }

    // Upload novo: POST para /api/upload/r2 (existente)
    const formData = new FormData();
    formData.append('file', input.file);
    formData.append('folder', input.folder || 'media');

    const res = await fetch('/api/upload/r2', { method: 'POST', body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload falhou' }));
      throw new Error(err.error || 'Upload falhou');
    }
    const { url } = await res.json();

    const asset = await this.repo.create({
      hash,
      url,
      kind: kindFromMime(input.file.type),
      mime: input.file.type || 'application/octet-stream',
      size: input.file.size,
      name: input.file.name,
      uploaded_by: input.userId,
      created_at: new Date().toISOString(),
    });
    return { asset, reused: false };
  }

  async listRecent(limit = 30): Promise<MediaAsset[]> {
    return this.repo.findRecent(limit);
  }

  async search(query: string): Promise<MediaAsset[]> {
    return this.repo.searchByName(query);
  }
}

export const mediaService = new MediaService();
