import {
  doc, getDoc, setDoc, deleteDoc, addDoc, collection, query, where, getDocs,
} from 'firebase/firestore';
import { db } from '@/shared/firebase/firebaseClient';
import { BookChapter } from '@/domain/library/types';

const COLLECTION = 'library_book_chapters';

/**
 * ID determinístico — usado APENAS pra lookups legados.
 * Criação nova usa addDoc (auto-ID) pra evitar colisões após migration de orders.
 */
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
  /**
   * Cria/atualiza capítulo.
   * - Update: re-usa `chapter.id` (preserva ID após migration de orders)
   * - Create: usa `addDoc` (Firestore gera ID único — sem colisão com docs existentes)
   */
  async upsert(chapter: BookChapter): Promise<BookChapter> {
    const now = new Date().toISOString();

    if (chapter.id && chapter.id.length > 0) {
      // UPDATE: ID existente, preserva
      const payload = deepStripUndefined({
        ...chapter,
        updated_at: now,
      }) as Record<string, unknown>;
      await setDoc(doc(db, COLLECTION, chapter.id), payload);
      return { ...chapter };
    }

    // CREATE: Firestore gera ID auto — evita colisão com IDs determinísticos legados
    const { id: _omit, ...rest } = chapter;
    const payload = deepStripUndefined({
      ...rest,
      updated_at: now,
    }) as Record<string, unknown>;
    const docRef = await addDoc(collection(db, COLLECTION), payload);
    // Atualiza o doc com seu próprio id (mantém consistência: data.id === doc.id)
    await setDoc(doc(db, COLLECTION, docRef.id), { ...payload, id: docRef.id }, { merge: true });
    return { ...chapter, id: docRef.id };
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

  /**
   * Apaga capítulo pelo `(book_id, order)` atual.
   * Procura o doc real via query — IDs são determinísticos com order ANTIGO,
   * que pode ter sido alterado por migration. Buscar o doc atual pelo campo `order`
   * é mais seguro que recomputar o ID.
   */
  async delete(bookId: string, order: number): Promise<void> {
    // Tenta primeiro pelo ID determinístico (caso comum: order original)
    const determId = chapterId(bookId, order);
    const determSnap = await getDoc(doc(db, COLLECTION, determId));
    if (determSnap.exists() && (determSnap.data() as { order?: number }).order === order) {
      await deleteDoc(doc(db, COLLECTION, determId));
      return;
    }
    // Fallback: query por book_id + order (caso ID dessincronizou após migration)
    const snap = await getDocs(
      query(collection(db, COLLECTION), where('book_id', '==', bookId), where('order', '==', order)),
    );
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  }

  /** Apaga capítulo pelo ID do documento (mais confiável quando ID conhecido). */
  async deleteById(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  }

  async deleteAllByBook(bookId: string): Promise<void> {
    const snap = await getDocs(
      query(collection(db, COLLECTION), where('book_id', '==', bookId)),
    );
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  }
}

export const bookChapterRepository = new BookChapterRepository();
