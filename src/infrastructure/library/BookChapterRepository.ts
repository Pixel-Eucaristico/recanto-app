import {
  doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs,
} from 'firebase/firestore';
import { db } from '@/shared/firebase/firebaseClient';
import { BookChapter } from '@/domain/library/types';

const COLLECTION = 'library_book_chapters';

/** ID determinístico — facilita upsert e leitura ordenada. */
function chapterId(bookId: string, order: number): string {
  return `${bookId}_${String(order).padStart(4, '0')}`;
}

/** Remove undefined recursivamente — Firestore rejeita undefined em qualquer nível (top + nested). */
function deepStripUndefined(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (Array.isArray(value)) {
    return value.map(v => deepStripUndefined(v)).filter(v => v !== undefined);
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const cleaned = deepStripUndefined(v);
      if (cleaned !== undefined) out[k] = cleaned;
    }
    return out;
  }
  return value;
}

export class BookChapterRepository {
  /** Cria/atualiza capítulo. Sempre re-escreve o doc inteiro (blocks gerais). */
  async upsert(chapter: BookChapter): Promise<BookChapter> {
    const id = chapterId(chapter.book_id, chapter.order);
    const payload = deepStripUndefined({
      ...chapter,
      id,
      updated_at: new Date().toISOString(),
    }) as Record<string, unknown>;
    await setDoc(doc(db, COLLECTION, id), payload);
    return { ...chapter, id };
  }

  async get(bookId: string, order: number): Promise<BookChapter | null> {
    const snap = await getDoc(doc(db, COLLECTION, chapterId(bookId, order)));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<BookChapter, 'id'>) };
  }

  async findByBook(bookId: string): Promise<BookChapter[]> {
    const snap = await getDocs(
      query(collection(db, COLLECTION), where('book_id', '==', bookId)),
    );
    const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<BookChapter, 'id'>) }));
    return [...list].sort((a, b) => a.order - b.order);
  }

  async delete(bookId: string, order: number): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, chapterId(bookId, order)));
  }

  async deleteAllByBook(bookId: string): Promise<void> {
    const list = await this.findByBook(bookId);
    await Promise.all(list.map(c => this.delete(bookId, c.order)));
  }
}

export const bookChapterRepository = new BookChapterRepository();
