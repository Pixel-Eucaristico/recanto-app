export interface Material {
  id?: string
  title: string
  description?: string
  type: 'pdf' | 'video' | 'text'
  file_url?: string
  category?: string
  authorized_roles?: string[]
}

export class Material {
  static async list(orderBy?: string): Promise<Material[]> {
    // TODO: Implementar integração com backend
    return []
  }

  static async get(id: string): Promise<Material | null> {
    // TODO: Implementar integração com backend
    return null
  }

  static async create(data: Partial<Material>): Promise<Material> {
    // TODO: Implementar integração com backend
    return { ...data, id: Date.now().toString() } as Material
  }

  static async update(id: string, data: Partial<Material>): Promise<Material> {
    // TODO: Implementar integração com backend
    return { ...data, id } as Material
  }

  static async delete(id: string): Promise<void> {
    // TODO: Implementar integração com backend
  }
}
