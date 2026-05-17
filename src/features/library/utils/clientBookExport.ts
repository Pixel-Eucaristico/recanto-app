'use client';

import { libraryService } from '@/application/library/LibraryService';
import { bookPdfGenerator } from '@/application/library/BookPdfGenerator';
import { bookEpubGenerator } from '@/application/library/BookEpubGenerator';
import { BookExportEntity } from '@/domain/library/entities/BookExport';
import { BookSpoilerEngine } from '@/application/library/BookSpoilerEngine';

export type ExportFormat = 'pdf' | 'epub';

async function fetchCover(url: string | undefined): Promise<Buffer | undefined> {
  if (!url) return undefined;
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const arrayBuffer = await res.arrayBuffer();
    // Browser não tem Buffer. Uint8Array é compat com pdf-lib e @react-pdf/Image.
    return new Uint8Array(arrayBuffer) as unknown as Buffer;
  } catch {
    return undefined;
  }
}

function triggerDownload(buffer: Buffer, filename: string, mimeType: string): void {
  const blob = new Blob([new Uint8Array(buffer)], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Gera e baixa PDF/EPUB do livro 100% no browser do cliente.
 * Sem custo Vercel. Sem timeout.
 */
export async function exportBookClientSide(bookId: string, format: ExportFormat): Promise<void> {
  const book = await libraryService.getBook(bookId);
  if (!book) throw new Error('Livro não encontrado.');

  const allChapters = await libraryService.listChapters(bookId);
  const { visible_until } = BookSpoilerEngine.compute(book, []);
  const { chapters, truncatedAt } = BookSpoilerEngine.applyCut(allChapters, visible_until);

  const [coverBuffer, backCoverBuffer] = await Promise.all([
    fetchCover(book.cover_url),
    fetchCover(book.back_cover_url),
  ]);

  const slug = BookExportEntity.bookSlug(book);

  if (format === 'pdf') {
    const buffer = await bookPdfGenerator.generate(book, chapters, coverBuffer, truncatedAt, backCoverBuffer);
    triggerDownload(buffer, `${slug}.pdf`, 'application/pdf');
  } else {
    const buffer = await bookEpubGenerator.generate(book, chapters, coverBuffer);
    triggerDownload(buffer, `${slug}.epub`, 'application/epub+zip');
  }
}
