import { doc, getDoc, setDoc, getDocs, query, where, collection } from 'firebase/firestore';
import { db } from '@/shared/firebase/firebaseClient';
import { PollVote } from '@/domain/community/types';
import { PollEntity } from '@/domain/community/entities/Poll';

const COLLECTION = 'community_poll_votes';

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out;
}

export class PollVoteRepository {
  /** Upsert — 1 voto por (poll, user). Chamar novamente troca a opção. */
  async castVote(pollId: string, userId: string, optionId: string): Promise<PollVote> {
    const id = PollEntity.voteId(pollId, userId);
    const payload: Omit<PollVote, 'id'> = {
      poll_id: pollId,
      option_id: optionId,
      user_id: userId,
      voted_at: new Date().toISOString(),
    };
    await setDoc(doc(db, COLLECTION, id), stripUndefined(payload));
    return { id, ...payload };
  }

  async findByUser(pollId: string, userId: string): Promise<PollVote | null> {
    const id = PollEntity.voteId(pollId, userId);
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<PollVote, 'id'>) };
  }

  async listByPoll(pollId: string): Promise<PollVote[]> {
    const snap = await getDocs(
      query(collection(db, COLLECTION), where('poll_id', '==', pollId)),
    );
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<PollVote, 'id'>) }));
  }
}

export const pollVoteRepository = new PollVoteRepository();
