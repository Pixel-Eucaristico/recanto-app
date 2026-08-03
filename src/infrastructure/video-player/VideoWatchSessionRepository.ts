import {
  doc, addDoc, updateDoc, getDocs, getCountFromServer, query, where, collection,
} from 'firebase/firestore';
import { db } from '@/shared/firebase/firebaseClient';
import { VideoWatchSession } from '@/domain/video-player/types';

const COLLECTION = 'video_watch_sessions';

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out;
}

export class VideoWatchSessionRepository {
  async start(input: Omit<VideoWatchSession, 'id' | 'ended_at'>): Promise<VideoWatchSession> {
    const ref = await addDoc(collection(db, COLLECTION), stripUndefined({ ...input }));
    return { id: ref.id, ...input };
  }

  async update(id: string, patch: Partial<Omit<VideoWatchSession, 'id'>>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), stripUndefined(patch));
  }

  async end(id: string, finalState: { max_position_seconds: number; seconds_watched: number }): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
      ...finalState,
      ended_at: new Date().toISOString(),
    });
  }

  async findByUserAndLesson(userId: string, lessonId: string): Promise<VideoWatchSession[]> {
    const snap = await getDocs(
      query(
        collection(db, COLLECTION),
        where('user_id', '==', userId),
        where('lesson_id', '==', lessonId),
      ),
    );
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<VideoWatchSession, 'id'>) }));
  }

  /** Todas as sessões de vídeo do aluno — histórico do formador. */
  async findByUser(userId: string): Promise<VideoWatchSession[]> {
    const snap = await getDocs(
      query(collection(db, COLLECTION), where('user_id', '==', userId)),
    );
    const all = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<VideoWatchSession, 'id'>) }));
    return all.sort((a, b) => b.started_at.localeCompare(a.started_at));
  }

  async countByUserAndLesson(userId: string, lessonId: string): Promise<number> {
    const snap = await getCountFromServer(
      query(
        collection(db, COLLECTION),
        where('user_id', '==', userId),
        where('lesson_id', '==', lessonId),
      ),
    );
    return snap.data().count;
  }
}

export const videoWatchSessionRepository = new VideoWatchSessionRepository();
