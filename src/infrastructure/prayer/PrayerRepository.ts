import { BaseRepository } from '@/shared/firebase/BaseRepository';
import type { PrayerIntention, PrayerLog } from '@/domain/prayer/types';

export class PrayerIntentionRepository extends BaseRepository<PrayerIntention> {
  constructor() {
    super('prayer_intentions');
  }

  async listRecent(limitCount = 30): Promise<PrayerIntention[]> {
    return this.queryByFilters([], { orderByField: 'created_at', direction: 'desc', limitCount });
  }

  async listByUser(userId: string): Promise<PrayerIntention[]> {
    return this.queryByFilters(
      [{ field: 'created_by', operator: '==', value: userId }],
      { orderByField: 'created_at', direction: 'desc' },
    );
  }
}

export class PrayerLogRepository extends BaseRepository<PrayerLog> {
  constructor() {
    super('prayer_logs');
  }

  async findByUserAndIntention(userId: string, intentionId: string): Promise<PrayerLog | null> {
    const list = await this.queryByFilters([
      { field: 'user_id', operator: '==', value: userId },
      { field: 'intention_id', operator: '==', value: intentionId },
    ]);
    return list[0] ?? null;
  }
}

export const prayerIntentionRepository = new PrayerIntentionRepository();
export const prayerLogRepository = new PrayerLogRepository();
