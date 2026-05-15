/**
 * Server-side only — uses Firebase Admin SDK (bypasses security rules).
 * Used only by API routes that already verified auth via verifySession().
 */
import { firestore } from '@/domains/auth/services/firebaseAdmin';
import type { Book, BookChapter } from '@/domain/library/types';
import { BookEntity } from '@/domain/library/entities/Book';

export async function adminGetBook(bookId: string): Promise<Book | null> {
  const snap = await firestore.collection('library_books').doc(bookId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as Book;
}

export async function adminListChapters(bookId: string): Promise<BookChapter[]> {
  const snap = await firestore
    .collection('library_book_chapters')
    .where('book_id', '==', bookId)
    .get();
  const chapters = snap.docs.map(d => ({ id: d.id, ...d.data() }) as BookChapter);
  // Ordena por grupo (front → body → back) + order dentro do grupo
  return BookEntity.sortChapters(chapters);
}
