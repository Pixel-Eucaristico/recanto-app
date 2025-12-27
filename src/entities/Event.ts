export interface Event {
  id?: string
  title: string
  description?: string
  date: string
  location?: string
  created_at?: string
}

export class Event {
  static async list(orderBy?: string): Promise<Event[]> {
    return []
  }

  static async create(data: Partial<Event>): Promise<Event> {
    return { ...data, id: Date.now().toString() } as Event
  }

  static async update(id: string, data: Partial<Event>): Promise<Event> {
    return { ...data, id } as Event
  }

  static async delete(id: string): Promise<void> {
  }
}
