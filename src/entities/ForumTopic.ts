export interface ForumTopic {
  id?: string
  title: string
  description?: string
  author_id: string
  created_at?: string
  updated_at?: string
}

export class ForumTopic {
  static async list(orderBy?: string): Promise<ForumTopic[]> {
    return []
  }

  static async create(data: Partial<ForumTopic>): Promise<ForumTopic> {
    return { ...data, id: Date.now().toString() } as ForumTopic
  }

  static async delete(id: string): Promise<void> {
  }
}
