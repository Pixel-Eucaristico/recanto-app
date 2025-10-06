export interface Desafio {
  id?: string
  title: string
  description?: string
  pontos?: number
}

export class Desafio {
  static async list(orderBy?: string): Promise<Desafio[]> {
    return []
  }

  static async create(data: Partial<Desafio>): Promise<Desafio> {
    return { ...data, id: Date.now().toString() } as Desafio
  }

  static async update(id: string, data: Partial<Desafio>): Promise<Desafio> {
    return { ...data, id } as Desafio
  }

  static async delete(id: string): Promise<void> {
  }
}
