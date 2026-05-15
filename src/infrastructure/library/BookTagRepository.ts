import { doc, addDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/shared/firebase/firebaseClient';
import { BookTag, TagColor } from '@/domain/library/types';

const COLLECTION = 'book_tags';

export class BookTagRepository {
  async add(
    userId: string,
    bookId: string,
    chapterOrder: number,
    text: string,
    color: TagColor,
    ref?: string,
  ): Promise<BookTag> {
    const now = new Date().toISOString();
    const data: Omit<BookTag, 'id'> = {
      user_id: userId,
      book_id: bookId,
      chapter_order: chapterOrder,
      text,
      color,
      created_at: now,
      ...(ref ? { ref } : {}),
    };
    const docRef = await addDoc(collection(db, COLLECTION), data);
    return { id: docRef.id, ...data };
  }

  async update(id: string, text: string, color: TagColor): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), { text, color });
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  }

  async findByUserAndBook(userId: string, bookId: string): Promise<BookTag[]> {
    const q = query(
      collection(db, COLLECTION),
      where('user_id', '==', userId),
      where('book_id', '==', bookId),
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as BookTag))
      .sort((a, b) => {
        if (a.chapter_order !== b.chapter_order) return a.chapter_order - b.chapter_order;
        return a.created_at.localeCompare(b.created_at);
      });
  }
}

export const bookTagRepository = new BookTagRepository();
