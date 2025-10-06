import { BaseFirebaseService } from './BaseFirebaseService';
import { Desafio, DesafioRegistro } from '@/types/firebase-entities';

class DesafioService extends BaseFirebaseService<Desafio> {
  constructor() {
    super('desafios');
  }

  /**
   * Busca desafios por categoria
   */
  async getByCategory(category: Desafio['category']): Promise<Desafio[]> {
    return this.queryByField('category', category);
  }

  /**
   * Busca desafios por dificuldade
   */
  async getByDifficulty(difficulty: Desafio['difficulty']): Promise<Desafio[]> {
    return this.queryByField('difficulty', difficulty);
  }
}

class DesafioRegistroService extends BaseFirebaseService<DesafioRegistro> {
  constructor() {
    super('desafio_registros');
  }

  /**
   * Busca registros de um recantiano
   */
  async getByRecantiano(recantianoId: string): Promise<DesafioRegistro[]> {
    return this.queryByField('recantiano_id', recantianoId);
  }

  /**
   * Busca registros de um desafio específico
   */
  async getByDesafio(desafioId: string): Promise<DesafioRegistro[]> {
    return this.queryByField('desafio_id', desafioId);
  }

  /**
   * Busca desafios completados por um recantiano
   */
  async getCompletedByRecantiano(recantianoId: string): Promise<DesafioRegistro[]> {
    const registros = await this.getByRecantiano(recantianoId);
    return registros.filter(r => r.completed);
  }

  /**
   * Verifica se recantiano completou um desafio
   */
  async hasCompleted(recantianoId: string, desafioId: string): Promise<boolean> {
    const registros = await this.getByRecantiano(recantianoId);
    return registros.some(r => r.desafio_id === desafioId && r.completed);
  }

  /**
   * Marca desafio como completo
   */
  async completeDesafio(
    registroId: string,
    reflection?: string
  ): Promise<DesafioRegistro | null> {
    return this.update(registroId, {
      completed: true,
      completion_date: new Date().toISOString(),
      reflection,
    } as Partial<DesafioRegistro>);
  }

  /**
   * Calcula pontuação total de um recantiano
   */
  async getTotalPoints(recantianoId: string, desafioService: DesafioService): Promise<number> {
    const registros = await this.getCompletedByRecantiano(recantianoId);
    let total = 0;

    for (const registro of registros) {
      const desafio = await desafioService.get(registro.desafio_id);
      if (desafio?.points) {
        total += desafio.points;
      }
    }

    return total;
  }
}

export const desafioService = new DesafioService();
export const desafioRegistroService = new DesafioRegistroService();
