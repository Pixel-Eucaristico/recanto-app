import { BaseRepository } from '@/shared/firebase/BaseRepository';
import type { Notification } from '@/domain/notifications/types';

export class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super('notifications');
  }

  async findByUser(userId: string, limitCount = 30): Promise<Notification[]> {
    return this.queryByFilters(
      [{ field: 'user_id', operator: '==', value: userId }],
      { orderByField: 'created_at', direction: 'desc', limitCount },
    );
  }

  async findUnreadByUser(userId: string): Promise<Notification[]> {
    return this.queryByFilters(
      [
        { field: 'user_id', operator: '==', value: userId },
        { field: 'read', operator: '==', value: false },
      ],
      { orderByField: 'created_at', direction: 'desc', limitCount: 50 },
    );
  }

  async markRead(id: string): Promise<void> {
    await this.update(id, { read: true } as Partial<Omit<Notification, 'id'>>);
  }

  async markAllRead(userId: string): Promise<void> {
    const unread = await this.findUnreadByUser(userId);
    await Promise.all(unread.map(n => this.markRead(n.id)));
  }
}

export const notificationRepository = new NotificationRepository();
