import type { Book } from '@/domain/library/types';

function normalizeFilenamePart(value: string): string {
  return value
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function asciiFallback(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '_')
    .replace(/"/g, "'");
}

export function buildBookDownloadFilename(book: Book): string {
  const title = normalizeFilenamePart(book.title) || book.id;
  const author = normalizeFilenamePart(book.author ?? '');
  return author ? `${title} - ${author}` : title;
}

export function buildAttachmentDisposition(book: Book, extension: 'pdf' | 'epub'): string {
  const rawName = buildBookDownloadFilename(book);
  const fallbackName = asciiFallback(rawName);
  const encodedName = encodeURIComponent(rawName);
  return `attachment; filename="${fallbackName}.${extension}"; filename*=UTF-8''${encodedName}.${extension}`;
}
