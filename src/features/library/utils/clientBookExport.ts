'use client';

import { auth } from '@/domains/auth/services/firebaseClient';
import { libraryService } from '@/application/library/LibraryService';
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
    return new Uint8Array(arrayBuffer) as unknown as Buffer;
  } catch {
    return undefined;
  }
}

function triggerDownload(blob: Blob, filename: string): void {
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
 * Export híbrido:
 * - PDF → API server-side com Typst chunked (rodapé/footnote correto + sem OOM)
 * - EPUB → 100% browser (lib browser-safe, sem custo Vercel)
 */
export async function exportBookClientSide(bookId: string, format: ExportFormat): Promise<void> {
  if (format === 'pdf') {
    // PDF roda no servidor com Typst (footnote-at-page-bottom nativo).
    // Server faz chunked merge — fits no limite Vercel até pra livros grandes.
    const token = await auth.currentUser?.getIdToken(true);
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`/api/library/${bookId}/pdf?engine=typst`, { headers });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Falha ao gerar PDF (HTTP ${res.status}). ${text}`);
    }
    const blob = await res.blob();
    // Pega nome do header Content-Disposition se houver
    const cd = res.headers.get('Content-Disposition') ?? '';
    const filenameMatch = cd.match(/filename="([^"]+)"/);
    const filename = filenameMatch?.[1] ?? `${bookId}.pdf`;
    triggerDownload(blob, filename);
    return;
  }

  // EPUB: continua client-side (lib é browser-safe + zero custo Vercel)
  const book = await libraryService.getBook(bookId);
  if (!book) throw new Error('Livro não encontrado.');
  const allChapters = await libraryService.listChapters(bookId);
  const { visible_until } = BookSpoilerEngine.compute(book, []);
  const { chapters } = BookSpoilerEngine.applyCut(allChapters, visible_until);
  const coverBuffer = await fetchCover(book.cover_url);
  const slug = BookExportEntity.bookSlug(book);
  const buffer = await bookEpubGenerator.generate(book, chapters, coverBuffer);
  const blob = new Blob([new Uint8Array(buffer)], { type: 'application/epub+zip' });
  triggerDownload(blob, `${slug}.epub`);
}
