export interface Donation {
  id?: string
  value: number
  method: 'pix' | 'transferencia' | 'outro'
  donor_name: string
  donor_email: string
  date: string
  status: 'pendente' | 'confirmado'
  notes?: string
}

export class Donation {
  static async list(orderBy?: string): Promise<Donation[]> {
    return []
  }

  static async create(data: Partial<Donation>): Promise<Donation> {
    return { ...data, id: Date.now().toString() } as Donation
  }

  static async update(id: string, data: Partial<Donation>): Promise<Donation> {
    return { ...data, id } as Donation
  }

  static async delete(id: string): Promise<void> {
  }
}
