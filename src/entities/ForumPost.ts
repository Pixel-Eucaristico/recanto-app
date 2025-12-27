export interface ForumPost {
  id?: string
  topic_id: string
  author_id: string
  content: string
  created_at?: string
  updated_at?: string
}

export class ForumPost {
  static async list(topicId: string): Promise<ForumPost[]> {
    return []
  }

  static async create(data: Partial<ForumPost>): Promise<ForumPost> {
    return { ...data, id: Date.now().toString() } as ForumPost
  }
}
