import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  QueryConstraint,
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';
import { firestore } from '@/domains/auth/services/firebaseClient';

/**
 * Classe base genérica para serviços Firestore
 *
 * Vantagens sobre Realtime Database:
 * - Queries complexas (múltiplos filtros + ordenação)
 * - Escalabilidade automática
 * - Offline support nativo
 * - 10GB grátis (vs 1GB)
 */
export class BaseFirestoreService<T extends DocumentData> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
   * Cria um novo documento
   */
  async create(data: Omit<T, 'id'>): Promise<T & { id: string }> {
    try {
      const collectionRef = collection(firestore, this.collectionName);

      const dataWithTimestamp = {
        ...data,
        created_at: Timestamp.now(),
      } as DocumentData;

      const docRef = await addDoc(collectionRef, dataWithTimestamp);

      // Atualizar com o ID
      await updateDoc(docRef, { id: docRef.id });

      return {
        ...data,
        id: docRef.id,
        created_at: new Date().toISOString(),
      } as T & { id: string };
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Cria documento com ID customizado
   */
  async createWithId(id: string, data: Omit<T, 'id'>): Promise<T & { id: string }> {
    try {
      const docRef = doc(firestore, this.collectionName, id);

      const dataWithTimestamp = {
        ...data,
        id,
        created_at: Timestamp.now(),
      } as DocumentData;

      await setDoc(docRef, dataWithTimestamp);

      return {
        ...data,
        id,
        created_at: new Date().toISOString(),
      } as T & { id: string };
    } catch (error) {
      console.error(`Error creating ${this.collectionName} with ID:`, error);
      throw error;
    }
  }

  /**
   * Obtém um documento por ID
   */
  async get(id: string): Promise<T | null> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return this.convertTimestamp(docSnap.data()) as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${this.collectionName}/${id}:`, error);
      return null;
    }
  }

  /**
   * Lista todos os documentos
   */
  async list(orderByField?: string, orderDirection: 'asc' | 'desc' = 'asc'): Promise<T[]> {
    try {
      const collectionRef = collection(firestore, this.collectionName);

      let q = query(collectionRef);

      if (orderByField) {
        q = query(collectionRef, orderBy(orderByField, orderDirection));
      }

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc =>
        this.convertTimestamp(doc.data()) as T
      );
    } catch (error) {
      console.error(`Error listing ${this.collectionName}:`, error);
      return [];
    }
  }

  /**
   * Atualiza um documento
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const docRef = doc(firestore, this.collectionName, id);

      const updateData = {
        ...data,
        updated_at: Timestamp.now(),
      } as DocumentData;

      await updateDoc(docRef, updateData);

      return this.get(id);
    } catch (error) {
      console.error(`Error updating ${this.collectionName}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Deleta um documento
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Query por campo específico
   */
  async queryByField(field: string, operator: '==' | '!=' | '<' | '<=' | '>' | '>=', value: any): Promise<T[]> {
    try {
      const collectionRef = collection(firestore, this.collectionName);
      const q = query(collectionRef, where(field, operator, value));

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc =>
        this.convertTimestamp(doc.data()) as T
      );
    } catch (error) {
      console.error(`Error querying ${this.collectionName} by ${field}:`, error);
      return [];
    }
  }

  /**
   * Query complexa (múltiplos filtros + ordenação)
   * IMPOSSÍVEL no Realtime Database! 🚀
   */
  async complexQuery(
    filters: Array<{ field: string; operator: '==' | '!=' | '<' | '<=' | '>' | '>='; value: any }>,
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'asc',
    limitCount?: number
  ): Promise<T[]> {
    try {
      const collectionRef = collection(firestore, this.collectionName);
      const constraints: QueryConstraint[] = [];

      // Adicionar filtros
      filters.forEach(filter => {
        constraints.push(where(filter.field, filter.operator, filter.value));
      });

      // Adicionar ordenação
      if (orderByField) {
        constraints.push(orderBy(orderByField, orderDirection));
      }

      // Adicionar limit
      if (limitCount) {
        constraints.push(limit(limitCount));
      }

      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc =>
        this.convertTimestamp(doc.data()) as T
      );
    } catch (error) {
      console.error(`Error complex query ${this.collectionName}:`, error);
      return [];
    }
  }

  /**
   * Listener em tempo real (real-time updates)
   */
  onSnapshot(callback: (data: T[]) => void): Unsubscribe {
    const collectionRef = collection(firestore, this.collectionName);

    return onSnapshot(collectionRef, (snapshot) => {
      const data = snapshot.docs.map(doc =>
        this.convertTimestamp(doc.data()) as T
      );
      callback(data);
    });
  }

  /**
   * Listener para documento específico
   */
  onDocSnapshot(id: string, callback: (data: T | null) => void): Unsubscribe {
    const docRef = doc(firestore, this.collectionName, id);

    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(this.convertTimestamp(snapshot.data()) as T);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Converte Timestamp do Firestore para ISO string
   */
  private convertTimestamp(data: DocumentData): DocumentData {
    const converted = { ...data };

    Object.keys(converted).forEach(key => {
      if (converted[key] instanceof Timestamp) {
        converted[key] = converted[key].toDate().toISOString();
      }
    });

    return converted;
  }
}
