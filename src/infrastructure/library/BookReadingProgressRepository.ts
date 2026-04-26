import { doc, getDoc, setDoc, updateDoc, deleteField, collection, query, where, getDocs, increment } from 'firebase/firestore';
import { db } from '@/shared/firebase/firebaseClient';
import { BookReadingProgress } from '@/domain/library/types';

const COLLECTION = 'book_reading_progress';

export class BookReadingProgressRepository {
  private id(userId: string, bookId: string): string {
    return `${userId}_${bookId}`;
  }

  async get(userId: string, bookId: string): Promise<BookReadingProgress | null> {
    const ref = doc(db, COLLECTION, this.id(userId, bookId));
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as BookReadingProgress;
  }

  async findByUser(userId: string): Promise<BookReadingProgress[]> {
    const q = query(collection(db, COLLECTION), where('user_id', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as BookReadingProgress));
  }

  async upsert(progress: Omit<BookReadingProgress, 'id'>): Promise<BookReadingProgress> {
    const docId = this.id(progress.user_id, progress.book_id);
    const docRef = doc(db, COLLECTION, docId);
    const now = new Date().toISOString();

    // Verifica se doc existe pra setar started_at apenas na primeira vez
    const existing = await getDoc(docRef);
    const isNew = !existing.exists();

    const firestoreData: Record<string, unknown> = {
      user_id: progress.user_id,
      book_id: progress.book_id,
      last_chapter_order: progress.last_chapter_order,
      percent: progress.percent,
      updated_at: now,
      last_ref: progress.last_ref !== undefined ? progress.last_ref : deleteField(),
    };

    if (isNew) {
      firestoreData.started_at = now;
      firestoreData.highlights_count = 0;
      firestoreData.notes_count = 0;
    }

    // Denormaliza título e capa se fornecidos
    if (progress.book_title) firestoreData.book_title = progress.book_title;
    if (progress.book_cover_url) firestoreData.book_cover_url = progress.book_cover_url;

    // Marca conclusão ao atingir 100%
    if (progress.percent >= 100 && !existing.data()?.completed_at) {
      firestoreData.completed_at = now;
    }

    await setDoc(docRef, firestoreData, { merge: true });

    const snap = await getDoc(docRef);
    return { id: docId, ...snap.data() } as BookReadingProgress;
  }

  /** Incrementa/decrementa counter de highlights. Usa setDoc merge pra não quebrar se doc não existe. */
  async updateHighlightCount(userId: string, bookId: string, delta: 1 | -1): Promise<void> {
    const docRef = doc(db, COLLECTION, this.id(userId, bookId));
    await setDoc(docRef, { highlights_count: increment(delta) }, { merge: true });
  }

  /** Incrementa/decrementa counter de comentários. Usa setDoc merge pra não quebrar se doc não existe. */
  async updateNotesCount(userId: string, bookId: string, delta: 1 | -1): Promise<void> {
    const docRef = doc(db, COLLECTION, this.id(userId, bookId));
    await setDoc(docRef, { notes_count: increment(delta) }, { merge: true });
  }
}

export const bookReadingProgressRepository = new BookReadingProgressRepository();
