import { BaseFirebaseService } from './BaseFirebaseService';
import { AcompanhamentoRecantiano } from '@/types/firebase-entities';

class AcompanhamentoService extends BaseFirebaseService<AcompanhamentoRecantiano> {
  constructor() {
    super('acompanhamentos');
  }

  /**
   * Busca acompanhamentos de um recantiano
   * OTIMIZADO: Query com filtro + ordenação (impossível no Realtime!)
   */
  async getByRecantiano(recantianoId: string): Promise<AcompanhamentoRecantiano[]> {
    const { collection, query, where, orderBy: firestoreOrderBy, getDocs } = await import('firebase/firestore');
    const { firestore } = await import('@/domains/auth/services/firebaseClient');

    const collectionRef = collection(firestore, this.collectionName);
    const q = query(
      collectionRef,
      where('recantiano_id', '==', recantianoId),
      firestoreOrderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as AcompanhamentoRecantiano);
  }

  /**
   * Busca acompanhamentos feitos por um missionário
   * OTIMIZADO: Query com filtro + ordenação (impossível no Realtime!)
   */
  async getByMissionario(missionarioId: string): Promise<AcompanhamentoRecantiano[]> {
    const { collection, query, where, orderBy: firestoreOrderBy, getDocs } = await import('firebase/firestore');
    const { firestore } = await import('@/domains/auth/services/firebaseClient');

    const collectionRef = collection(firestore, this.collectionName);
    const q = query(
      collectionRef,
      where('missionario_id', '==', missionarioId),
      firestoreOrderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as AcompanhamentoRecantiano);
  }

  /**
   * Busca último acompanhamento de um recantiano
   */
  async getLastAcompanhamento(recantianoId: string): Promise<AcompanhamentoRecantiano | null> {
    const acompanhamentos = await this.getByRecantiano(recantianoId);
    return acompanhamentos.length > 0 ? acompanhamentos[0] : null;
  }

  /**
   * Busca acompanhamentos por tipo
   */
  async getByTipo(tipo: AcompanhamentoRecantiano['tipo']): Promise<AcompanhamentoRecantiano[]> {
    return this.queryByField('tipo', tipo);
  }

  /**
   * Busca acompanhamentos por nível de progresso
   */
  async getByProgresso(progresso: AcompanhamentoRecantiano['progresso']): Promise<AcompanhamentoRecantiano[]> {
    return this.queryByField('progresso', progresso);
  }
}

export const acompanhamentoService = new AcompanhamentoService();
export default acompanhamentoService;
