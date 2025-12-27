export interface Acompanhamento {
  id?: string
  recantiano_id: string
  missionario_id: string
  message?: string
  created_at?: string
}

export class Acompanhamento {
  static async list(orderBy?: string): Promise<Acompanhamento[]> {
    return []
  }

  static async create(data: Partial<Acompanhamento>): Promise<Acompanhamento> {
    return { ...data, id: Date.now().toString() } as Acompanhamento
  }
}
