export const DARK_THEMES = new Set([
  'dark', 'synthwave', 'halloween', 'forest', 'black', 'luxury', 'dracula',
  'business', 'night', 'coffee', 'dim', 'sunset', 'abyss',
]);

export type MediaKind = 'image' | 'image-left' | 'image-right' | 'youtube' | 'video' | 'audio';

export function detectColorMode(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme && DARK_THEMES.has(theme)) return 'dark';
  if (theme) return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function isYouTube(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

export function buildMediaMarkdown(kind: MediaKind, url: string, alt = 'mídia'): string {
  const u = url.trim();
  if (!u) return '';
  if (kind === 'image') return `\n\n![${alt}](${u})\n\n`;
  if (kind === 'image-left') return `\n\n<img src="${u}" alt="${alt}" style="float:left;max-width:40%;margin:0 1rem 0.5rem 0;border-radius:0.5rem" />\n\nEscreva aqui o texto que vai fluir ao redor da imagem.\n\n<div style="clear:both"></div>\n\n`;
  if (kind === 'image-right') return `\n\n<img src="${u}" alt="${alt}" style="float:right;max-width:40%;margin:0 0 0.5rem 1rem;border-radius:0.5rem" />\n\nEscreva aqui o texto que vai fluir ao redor da imagem.\n\n<div style="clear:both"></div>\n\n`;
  if (kind === 'youtube' || isYouTube(u)) return `\n\n[${alt}](${u})\n\n`;
  if (kind === 'video') return `\n\n<video controls src="${u}" title="${alt}"></video>\n\n`;
  if (kind === 'audio') return `\n\n<audio controls src="${u}" title="${alt}"></audio>\n\n`;
  return `\n\n[${alt}](${u})\n\n`;
}

export const EDITOR_LABELS: Record<string, string> = {
  bold: 'Negrito', italic: 'Itálico', strikethrough: 'Riscado', hr: 'Linha horizontal',
  title: 'Título', title1: 'Título 1', title2: 'Título 2', title3: 'Título 3',
  title4: 'Título 4', title5: 'Título 5', title6: 'Título 6',
  link: 'Link', quote: 'Citação', code: 'Código inline', codeBlock: 'Bloco de código',
  comment: 'Comentário', image: 'Inserir mídia',
  unordered: 'Lista', 'unordered-list': 'Lista',
  ordered: 'Lista numerada', 'ordered-list': 'Lista numerada',
  checked: 'Checklist', 'checked-list': 'Checklist',
  edit: 'Editar', live: 'Editor + preview', preview: 'Preview',
  fullscreen: 'Tela cheia', help: 'Ajuda',
};
