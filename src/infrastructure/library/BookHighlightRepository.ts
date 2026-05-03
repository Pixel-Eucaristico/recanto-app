import { doc, addDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/shared/firebase/firebaseClient';
import { BookHighlight, HighlightColor } from '@/domain/library/types';

const COLLECTION = 'book_highlights';

export class BookHighlightRepository {
  async add(
    userId: string,
    bookId: string,
    ref: string,
    color: HighlightColor,
    selectedText?: string,
    occurrenceIndex?: number,
  ): Promise<BookHighlight> {
    const now = new Date().toISOString();
    const data: Omit<BookHighlight, 'id'> = {
      user_id: userId,
      book_id: bookId,
      ref,
      color,
      created_at: now,
      ...(selectedText ? { selected_text: selectedText } : {}),
      ...(occurrenceIndex && occurrenceIndex > 0 ? { occurrence_index: occurrenceIndex } : {}),
    };
    const docRef = await addDoc(collection(db, COLLECTION), data);
    return { id: docRef.id, ...data };
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  }

  async findByUserAndBook(userId: string, bookId: string): Promise<BookHighlight[]> {
    const q = query(
      collection(db, COLLECTION),
      where('user_id', '==', userId),
      where('book_id', '==', bookId),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BookHighlight));
  }

  async findByUser(userId: string): Promise<BookHighlight[]> {
    const q = query(collection(db, COLLECTION), where('user_id', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BookHighlight));
  }
}

export const bookHighlightRepository = new BookHighlightRepository();
