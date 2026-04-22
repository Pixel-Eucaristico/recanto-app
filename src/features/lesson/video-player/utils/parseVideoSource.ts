export type VideoSourceKind = 'youtube' | 'file';

export interface VideoSource {
  kind: VideoSourceKind;
  /** Para youtube: video ID. Para file: URL bruta. */
  value: string;
}

const YT_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com']);

/**
 * Extrai ID do YouTube de formas comuns:
 * - https://www.youtube.com/watch?v=ID
 * - https://youtu.be/ID
 * - https://www.youtube.com/embed/ID
 * - https://www.youtube.com/shorts/ID
 */
export function parseVideoSource(input: string): VideoSource {
  const raw = (input || '').trim();
  if (!raw) return { kind: 'file', value: '' };

  try {
    const url = new URL(raw);
    if (YT_HOSTS.has(url.hostname)) {
      // youtu.be/<id>
      if (url.hostname === 'youtu.be') {
        const id = url.pathname.replace(/^\//, '').split('/')[0];
        if (id) return { kind: 'youtube', value: id };
      }
      // watch?v=<id>
      const v = url.searchParams.get('v');
      if (v) return { kind: 'youtube', value: v };
      // /embed/<id> or /shorts/<id>
      const parts = url.pathname.split('/').filter(Boolean);
      if ((parts[0] === 'embed' || parts[0] === 'shorts') && parts[1]) {
        return { kind: 'youtube', value: parts[1] };
      }
    }
  } catch {
    // fall through — treat as file URL
  }

  return { kind: 'file', value: raw };
}
