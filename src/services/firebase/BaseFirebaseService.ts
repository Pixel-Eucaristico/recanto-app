import { firestore } from '@/domains/auth/services/firebaseClient';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Query,
  DocumentData,
  QueryConstraint,
  Timestamp
} from 'firebase/firestore';

/**
 * Remove undefined values from an object (Firestore doesn't accept undefined)
 */
function removeUndefinedValues<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    if (result[key] === undefined) {
      delete result[key];
    } else if (result[key] !== null && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      result[key] = removeUndefinedValues(result[key]);
    }
  }
  return result;
}

/**
 * Classe base genérica para serviços Firestore
 * Migrado do Realtime Database para Firestore com queries poderosas
 */
export class BaseFirebaseService<T extends { id: string }> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
   * Cria um novo registro
   */
  async create(data: Omit<T, 'id'>): Promise<T & { id: string }> {
    try {
      console.log(`🔥 [${this.collectionName}] Iniciando criação...`);
      console.log(`📦 Dados a serem salvos:`, data);

      const collectionRef = collection(firestore, this.collectionName);
      // Remove undefined values as Firestore doesn't accept them
      const sanitizedData = removeUndefinedValues(data as Record<string, any>);
      const dataWithTimestamp = {
        ...sanitizedData,
        created_at: new Date().toISOString()
      };

      console.log(`🔥 [${this.collectionName}] Chamando addDoc...`);
      const docRef = await addDoc(collectionRef, dataWithTimestamp);
      console.log(`✅ [${this.collectionName}] addDoc OK, ID:`, docRef.id);

      // Atualiza o documento com o ID
      const dataWithId = { ...dataWithTimestamp, id: docRef.id };
      console.log(`🔥 [${this.collectionName}] Chamando setDoc...`);
      await setDoc(docRef, dataWithId);
      console.log(`✅ [${this.collectionName}] setDoc OK`);

      console.log(`🎉 [${this.collectionName}] Criação completa!`, dataWithId);
      return dataWithId as unknown as T & { id: string };
    } catch (error) {
      console.error(`❌ Error creating ${this.collectionName}:`, error);
      console.error(`❌ Error details:`, JSON.stringify(error, null, 2));
      throw error;
    }
  }

  /**
   * Obtém um registro por ID
   * @throws Error se houver problema de conexão (não confundir com "não encontrado")
   */
  async get(id: string): Promise<T | null> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data() as T;
        return { ...data, id: snapshot.id };
      }
      // Documento realmente não existe
      return null;
    } catch (error: any) {
      // IMPORTANTE: Propagar erro de conexão para não confundir com "não encontrado"
      console.error(`Error getting ${this.collectionName}/${id}:`, error);

      // Re-throw para que o chamador saiba que houve erro de conexão
      // e não assuma que o documento não existe
      throw new Error(`Firestore offline ou erro de conexão: ${error.message}`);
    }
  }

  /**
   * Lista todos os registros com ordenação opcional
   */
  async list(orderByField?: string, direction: 'asc' | 'desc' = 'asc'): Promise<T[]> {
    try {
      const collectionRef = collection(firestore, this.collectionName);

      let q;
      if (orderByField) {
        q = query(collectionRef, orderBy(orderByField, direction));
      } else {
        q = collectionRef;
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
    } catch (error) {
      console.error(`Error listing ${this.collectionName}:`, error);
      return [];
    }
  }

  /**
   * Atualiza um registro
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const docRef = doc(firestore, this.collectionName, id);
      // Remove undefined values as Firestore doesn't accept them
      const sanitizedData = removeUndefinedValues(data as Record<string, any>);
      const updateData = {
        ...sanitizedData,
        updated_at: new Date().toISOString()
      };

      await updateDoc(docRef, updateData as any);
      return this.get(id);
    } catch (error) {
      console.error(`Error updating ${this.collectionName}/${id}:`, error);
      throw error;
    }
  }

  /**
   * Deleta um registro
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
  async queryByField(field: string, value: any): Promise<T[]> {
    try {
      const collectionRef = collection(firestore, this.collectionName);
      const q = query(collectionRef, where(field, '==', value));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
    } catch (error) {
      console.error(`Error querying ${this.collectionName} by ${field}:`, error);
      return [];
    }
  }

  /**
   * Query avançada com múltiplos filtros
   * NOVO: Impossível no Realtime Database!
   */
  async queryWithFilters(filters: { field: string; operator: any; value: any }[]): Promise<T[]> {
    try {
      const collectionRef = collection(firestore, this.collectionName);
      const constraints: QueryConstraint[] = filters.map(f =>
        where(f.field, f.operator, f.value)
      );

      const q = query(collectionRef, ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
    } catch (error) {
      console.error(`Error querying ${this.collectionName} with filters:`, error);
      return [];
    }
  }

  /**
   * Query com ordenação e limite
   * NOVO: Queries compostas impossíveis no Realtime Database!
   */
  async queryWithOrder(
    orderByField: string,
    direction: 'asc' | 'desc' = 'desc',
    limitCount?: number
  ): Promise<T[]> {
    try {
      const collectionRef = collection(firestore, this.collectionName);
      const constraints: QueryConstraint[] = [orderBy(orderByField, direction)];

      if (limitCount) {
        const { limit } = await import('firebase/firestore');
        constraints.push(limit(limitCount));
      }

      const q = query(collectionRef, ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
    } catch (error) {
      console.error(`Error querying ${this.collectionName} with order:`, error);
      return [];
    }
  }

  /**
   * Listener em tempo real (mantém compatibilidade com a API antiga)
   */
  onValueChange(callback: (data: T[]) => void): () => void {
    const collectionRef = collection(firestore, this.collectionName);

    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
      callback(items);
    }, (error) => {
      console.error(`❌ [${this.collectionName}] Erro no onSnapshot:`, error.message);
      if (error.code === 'permission-denied') {
        console.warn(`🛑 [${this.collectionName}] Acesso negado. Verifique as regras do Firestore para esta coleção.`);
      }
      callback([]);
    });

    return unsubscribe;
  }

  /**
   * Listener em tempo real com query personalizada
   * NOVO: Real-time com filtros complexos!
   */
  onQueryChange(
    filters: { field: string; operator: any; value: any }[],
    callback: (data: T[]) => void
  ): () => void {
    const collectionRef = collection(firestore, this.collectionName);
    const constraints: QueryConstraint[] = filters.map(f =>
      where(f.field, f.operator, f.value)
    );

    const q = query(collectionRef, ...constraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
      callback(items);
    }, (error) => {
      console.error(`❌ [${this.collectionName}] Erro no onQueryChange:`, error.message);
      if (error.code === 'permission-denied') {
        console.warn(`🛑 [${this.collectionName}] Query negada por falta de permissão ou índice ausente.`);
      }
      callback([]);
    });

    return unsubscribe;
  }
}
