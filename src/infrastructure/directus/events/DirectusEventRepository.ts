import { DirectusRepository } from '../DirectusRepository';
import type { EventRepository } from '@/domain/events/EventRepository';
import type { Role } from '@/features/auth/types/user';
import type { Event } from '@/types/firebase-entities';

function startOfTodayIso(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

export class DirectusEventRepository
  extends DirectusRepository<Event>
  implements EventRepository
{
  constructor() {
    super('events');
  }

  getEventsByType(type: Event['type']): Promise<Event[]> {
    return this.findManyBy({ type }, 'start');
  }

  async getEventsByRole(role: Role): Promise<Event[]> {
    if (!role) return [];
    const events = await this.list('start', 'asc');
    return events.filter(event => event.target_audience?.includes(role));
  }

  getEventsByPeriod(startDate: string, endDate: string): Promise<Event[]> {
    return this.findManyWhere(
      {
        start: {
          _gte: startDate,
          _lte: endDate,
        },
      },
      { sort: 'start' },
    );
  }

  getUpcomingEvents(limit = 10, onlyPublic = false): Promise<Event[]> {
    return this.findManyWhere(
      {
        start: { _gte: startOfTodayIso() },
        ...(onlyPublic ? { is_public: { _eq: true } } : {}),
      },
      { sort: 'start', limit },
    );
  }

  getPublicEvents(limit = 10): Promise<Event[]> {
    return this.findManyWhere(
      {
        is_public: { _eq: true },
        start: { _gte: new Date().toISOString() },
      },
      { sort: 'start', limit },
    );
  }

  async setPublic(eventId: string, isPublic: boolean): Promise<void> {
    await this.update(eventId, { is_public: isPublic });
  }

  async createAndSync(event: Event): Promise<Event> {
    const { id: _id, ...data } = event;
    return this.create(data);
  }

  async updateAndSync(eventId: string, updates: Partial<Event>): Promise<void> {
    await this.update(eventId, updates);
  }

  async deleteAndSync(eventId: string): Promise<void> {
    await this.delete(eventId);
  }
}

export const directusEventRepository = new DirectusEventRepository();
