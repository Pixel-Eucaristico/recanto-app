import { parseVideoSource } from './parseVideoSource';

/**
 * Detecta duração de vídeo em segundos.
 * - MP4/WebM/etc: usa `<video>` element pra ler `duration` (rápido, sem servidor)
 * - YouTube: oEmbed não retorna duration; usuário precisa preencher manualmente
 *   ou conectar à YouTube Data API com chave (não implementado).
 *
 * Retorna null se não conseguir.
 */
export async function detectVideoDuration(url: string): Promise<number | null> {
  const src = parseVideoSource(url);
  if (src.kind === 'youtube') {
    // YouTube precisa de API key — placeholder. Por ora, retorna null.
    return null;
  }
  if (!src.value) return null;

  return new Promise(resolve => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.crossOrigin = 'anonymous';

    let settled = false;
    const finish = (dur: number | null) => {
      if (settled) return;
      settled = true;
      video.remove();
      resolve(dur);
    };

    video.addEventListener('loadedmetadata', () => {
      const d = video.duration;
      finish(Number.isFinite(d) && d > 0 ? Math.round(d) : null);
    });
    video.addEventListener('error', () => finish(null));

    // Timeout 10s
    setTimeout(() => finish(null), 10_000);

    video.src = src.value;
    // Dispara load
    video.load();
  });
}

/** Formata segundos como "MM:SS" ou "HH:MM:SS". */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Parse "1:30:45" ou "5:30" pra segundos. */
export function parseDurationString(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(':').map(p => parseInt(p, 10));
  if (parts.some(p => Number.isNaN(p))) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return null;
}
