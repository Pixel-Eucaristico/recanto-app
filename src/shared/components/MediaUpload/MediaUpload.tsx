'use client';

import { useState } from 'react';
import { Upload, Image as ImageIcon, Video, Music, CheckCircle2 } from 'lucide-react';
import { mediaService, MAX_MEDIA_BYTES } from '@/application/media/MediaService';
import { MediaAsset, MediaKind } from '@/domain/media/types';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

interface MediaUploadProps {
  accept?: MediaKind | 'all';
  onUploaded: (asset: MediaAsset, reused: boolean) => void;
  folder?: string;
}

const ACCEPT_MAP: Record<MediaKind | 'all', string> = {
  image: 'image/*',
  video: 'video/*',
  audio: 'audio/*',
  all: 'image/*,video/*,audio/*',
};

export function MediaUpload({ accept = 'all', onUploaded, folder = 'media' }: MediaUploadProps) {
  const user = useCurrentUser();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reusedMsg, setReusedMsg] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setError(null);
    setReusedMsg(null);
    setUploading(true);
    try {
      const res = await mediaService.upload({ file, userId: user.id, folder });
      if (res.reused) setReusedMsg('Mesmo arquivo já estava no R2 — reutilizado (sem duplicação).');
      onUploaded(res.asset, res.reused);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  const iconByAccept: Record<MediaKind | 'all', React.ReactNode> = {
    image: <ImageIcon className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    audio: <Music className="w-4 h-4" />,
    all: <Upload className="w-4 h-4" />,
  };

  return (
    <div className="space-y-2">
      <label className="form-control">
        <span className="label-text text-xs mb-1 flex items-center gap-1">
          {iconByAccept[accept]}
          Upload (R2) — máx. {Math.floor(MAX_MEDIA_BYTES / 1024 / 1024)} MB, dedupe por hash
        </span>
        <input
          type="file"
          accept={ACCEPT_MAP[accept]}
          className="file-input file-input-bordered file-input-sm w-full"
          onChange={handleFile}
          disabled={uploading || !user}
        />
      </label>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <span className="loading loading-spinner loading-xs" />
          Enviando / verificando dedupe...
        </div>
      )}
      {reusedMsg && (
        <div className="alert alert-success text-xs items-center py-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{reusedMsg}</span>
        </div>
      )}
      {error && <div className="alert alert-error text-xs"><span>{error}</span></div>}
    </div>
  );
}
