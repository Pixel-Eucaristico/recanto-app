export interface DesafioRegistro {
  id?: string
  recantiano_id: string
  desafio_id: string
  diario?: string
}

export class DesafioRegistro {
  static async list(userId: string): Promise<DesafioRegistro[]> {
    return []
  }

  static async create(data: Partial<DesafioRegistro>): Promise<DesafioRegistro> {
    return { ...data, id: Date.now().toString() } as DesafioRegistro
  }

  static async update(id: string, data: Partial<DesafioRegistro>): Promise<DesafioRegistro> {
    return { ...data, id } as DesafioRegistro
  }
}
