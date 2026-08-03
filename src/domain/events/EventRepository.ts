import type { Role } from '@/features/auth/types/user';
import type { Event } from '@/types/firebase-entities';
import type { Repository } from '@/domain/shared/Repository';

export interface EventRepository extends Repository<Event> {
  getEventsByType(type: Event['type']): Promise<Event[]>;
  getEventsByRole(role: Role): Promise<Event[]>;
  getEventsByPeriod(startDate: string, endDate: string): Promise<Event[]>;
  getUpcomingEvents(limit?: number, onlyPublic?: boolean): Promise<Event[]>;
  getPublicEvents(limit?: number): Promise<Event[]>;
  setPublic(eventId: string, isPublic: boolean): Promise<void>;
  createAndSync(event: Event, userId: string): Promise<Event>;
  updateAndSync(eventId: string, updates: Partial<Event>, userId: string): Promise<void>;
  deleteAndSync(eventId: string, userId: string): Promise<void>;
}
