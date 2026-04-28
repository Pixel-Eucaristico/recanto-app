import { doc, getDoc, setDoc, getDocs, query, where, collection, deleteDoc } from 'firebase/firestore';
import { db } from '@/shared/firebase/firebaseClient';
import { HabitLog } from '@/domain/habits/types';

const COLLECTION = 'habit_logs';

function logId(habitId: string, userId: string, dateKey: string): string {
  return `${habitId}_${userId}_${dateKey}`;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out;
}

export class HabitLogRepository {
  /** Upsert — 1 log por (habit, user, date). Retorna o log. */
  async log(habitId: string, userId: string, dateKey: string): Promise<HabitLog> {
    const id = logId(habitId, userId, dateKey);
    const payload: Omit<HabitLog, 'id'> = {
      user_id: userId,
      habit_id: habitId,
      log_date: dateKey,
      logged_at: new Date().toISOString(),
    };
    await setDoc(doc(db, COLLECTION, id), stripUndefined(payload));
    return { id, ...payload };
  }

  async unlog(habitId: string, userId: string, dateKey: string): Promise<void> {
    const id = logId(habitId, userId, dateKey);
    await deleteDoc(doc(db, COLLECTION, id));
  }

  async findByUserAndHabit(userId: string, habitId: string): Promise<HabitLog[]> {
    const snap = await getDocs(
      query(
        collection(db, COLLECTION),
        where('user_id', '==', userId),
        where('habit_id', '==', habitId),
      ),
    );
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<HabitLog, 'id'>) }));
  }

  async findByUser(userId: string): Promise<HabitLog[]> {
    const snap = await getDocs(
      query(collection(db, COLLECTION), where('user_id', '==', userId)),
    );
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<HabitLog, 'id'>) }));
  }

  async checkLogged(habitId: string, userId: string, dateKey: string): Promise<boolean> {
    const id = logId(habitId, userId, dateKey);
    const snap = await getDoc(doc(db, COLLECTION, id));
    return snap.exists();
  }
}

export const habitLogRepository = new HabitLogRepository();
