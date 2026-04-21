import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  WhereFilterOp,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/shared/firebase/firebaseClient';

export interface WithId {
  id: string;
}

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export interface QueryFilter {
  field: string;
  operator: WhereFilterOp;
  value: unknown;
}

export interface IBaseRepository<T extends WithId> {
  create(data: Omit<T, 'id'>): Promise<T>;
  get(id: string): Promise<T | null>;
  list(): Promise<T[]>;
  update(id: string, data: Partial<Omit<T, 'id'>>): Promise<T | null>;
  delete(id: string): Promise<void>;
  queryByFilters(filters: QueryFilter[]): Promise<T[]>;
}

export class BaseRepository<T extends WithId> implements IBaseRepository<T> {
  protected readonly collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected col() {
    return collection(db, this.collectionName);
  }

  protected docRef(id: string) {
    return doc(db, this.collectionName, id);
  }

  protected serialize(data: Omit<T, 'id'>): Record<string, unknown> {
    return stripUndefined({ ...data, updated_at: new Date().toISOString() });
  }

  protected deserialize(id: string, data: Record<string, unknown>): T {
    return { id, ...data } as T;
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const payload = this.serialize(data);
    const ref = await addDoc(this.col(), payload);
    return this.deserialize(ref.id, payload);
  }

  async get(id: string): Promise<T | null> {
    const snap = await getDoc(this.docRef(id));
    if (!snap.exists()) return null;
    return this.deserialize(snap.id, snap.data() as Record<string, unknown>);
  }

  async list(orderByField?: string, direction: 'asc' | 'desc' = 'asc'): Promise<T[]> {
    const constraints: QueryConstraint[] = orderByField
      ? [orderBy(orderByField, direction)]
      : [];
    const snap = await getDocs(query(this.col(), ...constraints));
    return snap.docs.map(d => this.deserialize(d.id, d.data() as Record<string, unknown>));
  }

  async update(id: string, data: Partial<Omit<T, 'id'>>): Promise<T | null> {
    const ref = this.docRef(id);
    const payload = stripUndefined({ ...data, updated_at: new Date().toISOString() });
    await updateDoc(ref, payload);
    return this.get(id);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(this.docRef(id));
  }

  async queryByFilters(filters: QueryFilter[], opts?: { orderByField?: string; direction?: 'asc' | 'desc'; limitCount?: number }): Promise<T[]> {
    const constraints: QueryConstraint[] = filters.map(f => where(f.field, f.operator, f.value));
    if (opts?.orderByField) constraints.push(orderBy(opts.orderByField, opts.direction ?? 'asc'));
    if (opts?.limitCount) constraints.push(limit(opts.limitCount));
    const snap = await getDocs(query(this.col(), ...constraints));
    return snap.docs.map(d => this.deserialize(d.id, d.data() as Record<string, unknown>));
  }

  onSnapshot(callback: (items: T[]) => void, filters?: QueryFilter[]): () => void {
    const constraints: QueryConstraint[] = (filters ?? []).map(f =>
      where(f.field, f.operator, f.value)
    );
    return onSnapshot(query(this.col(), ...constraints), snap => {
      callback(snap.docs.map(d => this.deserialize(d.id, d.data() as Record<string, unknown>)));
    });
  }
}
