import { notificationRepository } from '@/infrastructure/notifications/NotificationRepository';
import type { Notification, NotificationKind } from '@/domain/notifications/types';

export interface NotifyInput {
  user_id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  link?: string;
  meta?: Record<string, unknown>;
}

export class NotificationService {
  /** Cria 1 notificação pra 1 destinatário. */
  async notify(input: NotifyInput): Promise<Notification> {
    return notificationRepository.create({
      user_id: input.user_id,
      kind: input.kind,
      title: input.title,
      body: input.body,
      link: input.link,
      meta: input.meta,
      read: false,
      created_at: new Date().toISOString(),
    });
  }

  /** Fan-out: cria 1 doc por destinatário em paralelo. */
  async notifyMany(userIds: string[], payload: Omit<NotifyInput, 'user_id'>): Promise<void> {
    await Promise.all(userIds.map(uid => this.notify({ ...payload, user_id: uid })));
  }

  async list(userId: string, limit?: number): Promise<Notification[]> {
    return notificationRepository.findByUser(userId, limit);
  }

  async listUnread(userId: string): Promise<Notification[]> {
    return notificationRepository.findUnreadByUser(userId);
  }

  async markRead(id: string): Promise<void> {
    return notificationRepository.markRead(id);
  }

  async markAllRead(userId: string): Promise<void> {
    return notificationRepository.markAllRead(userId);
  }
}

export const notificationService = new NotificationService();
