import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/shared/firebase/firebaseClient';
import { LessonProgress } from '@/domain/formation/types';
import { Progress } from '@/domain/formation/entities/Progress';

export interface IProgressRepository {
  findByUserAndLesson(userId: string, lessonId: string): Promise<LessonProgress | null>;
  findByUserAndTrack(userId: string, trackId: string): Promise<LessonProgress[]>;
  findByUser(userId: string): Promise<LessonProgress[]>;
  upsert(userId: string, lessonId: string, data: Partial<Omit<LessonProgress, 'id' | 'user_id' | 'lesson_id'>>): Promise<LessonProgress>;
  getOrCreate(userId: string, lessonId: string, moduleId: string, trackId: string): Promise<LessonProgress>;
}

function progressId(userId: string, lessonId: string): string {
  return `${userId}_${lessonId}`;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export class FirebaseProgressRepository implements IProgressRepository {
  private readonly collectionName = 'formation_progress';

  private docRef(userId: string, lessonId: string) {
    return doc(db, this.collectionName, progressId(userId, lessonId));
  }

  async findByUserAndLesson(userId: string, lessonId: string): Promise<LessonProgress | null> {
    const snap = await getDoc(this.docRef(userId, lessonId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as LessonProgress;
  }

  async findByUserAndTrack(userId: string, trackId: string): Promise<LessonProgress[]> {
    const q = query(
      collection(db, this.collectionName),
      where('user_id', '==', userId),
      where('track_id', '==', trackId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LessonProgress));
  }

  async findByUser(userId: string): Promise<LessonProgress[]> {
    const q = query(collection(db, this.collectionName), where('user_id', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as LessonProgress));
  }

  async upsert(
    userId: string,
    lessonId: string,
    data: Partial<Omit<LessonProgress, 'id' | 'user_id' | 'lesson_id'>>
  ): Promise<LessonProgress> {
    const ref = this.docRef(userId, lessonId);
    const payload = stripUndefined({ ...data, updated_at: new Date().toISOString() });
    await updateDoc(ref, payload).catch(async () => {
      await setDoc(ref, { user_id: userId, lesson_id: lessonId, ...payload });
    });
    const snap = await getDoc(ref);
    return { id: snap.id, ...snap.data() } as LessonProgress;
  }

  async getOrCreate(
    userId: string,
    lessonId: string,
    moduleId: string,
    trackId: string
  ): Promise<LessonProgress> {
    const existing = await this.findByUserAndLesson(userId, lessonId);
    if (existing) return existing;

    const initial = Progress.initial(userId, lessonId, moduleId, trackId);
    const ref = this.docRef(userId, lessonId);
    await setDoc(ref, initial);
    return { id: progressId(userId, lessonId), ...initial };
  }
}

export const progressRepository = new FirebaseProgressRepository();
