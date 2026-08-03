import {
  doc, addDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, serverTimestamp, orderBy, limit,
} from 'firebase/firestore';
import { db } from '@/shared/firebase/firebaseClient';
import { BookComment } from '@/domain/library/types';

const COLLECTION = 'book_comments';

export class BookCommentRepository {
  async add(userId: string, bookId: string, ref: string, text: string): Promise<BookComment> {
    const now = new Date().toISOString();
    const data: Omit<BookComment, 'id'> = { user_id: userId, book_id: bookId, ref, text, created_at: now };
    const docRef = await addDoc(collection(db, COLLECTION), data);
    return { id: docRef.id, ...data };
  }

  async update(id: string, text: string): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { text, updated_at: new Date().toISOString() });
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  }

  async findByUserAndBook(userId: string, bookId: string): Promise<BookComment[]> {
    const q = query(
      collection(db, COLLECTION),
      where('user_id', '==', userId),
      where('book_id', '==', bookId),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BookComment));
  }

  /** Comentários do usuário, mais recentes primeiro. Ver nota de teto em BookHighlightRepository. */
  async findByUser(userId: string, limitCount = 50): Promise<BookComment[]> {
    const q = query(
      collection(db, COLLECTION),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc'),
      limit(limitCount),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BookComment));
  }
}

export const bookCommentRepository = new BookCommentRepository();
