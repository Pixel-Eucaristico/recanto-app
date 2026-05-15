import {
  prayerIntentionRepository,
  prayerLogRepository,
} from '@/infrastructure/prayer/PrayerRepository';
import { userService } from '@/services/firebase';
import { notificationService } from '@/application/notifications/NotificationService';
import type { PrayerIntention, PrayerIntentionKind } from '@/domain/prayer/types';

export interface CreateIntentionInput {
  user_id: string;
  body: string;
  kind: PrayerIntentionKind;
  anonymous?: boolean;
}

export class PrayerService {
  async list(limit?: number): Promise<PrayerIntention[]> {
    return prayerIntentionRepository.listRecent(limit);
  }

  async listMine(userId: string): Promise<PrayerIntention[]> {
    return prayerIntentionRepository.listByUser(userId);
  }

  async create(input: CreateIntentionInput): Promise<PrayerIntention> {
    if (!input.body.trim()) throw new Error('Intenção vazia.');
    const user = await userService.get(input.user_id).catch(() => null);
    return prayerIntentionRepository.create({
      body: input.body.trim(),
      kind: input.kind,
      anonymous: Boolean(input.anonymous),
      created_by: input.user_id,
      created_by_name: user?.name ?? user?.email,
      prayed_count: 0,
      answered: false,
      created_at: new Date().toISOString(),
    });
  }

  /** Idempotente: 1 log por user por intenção. Incrementa contador denormalizado. */
  async pray(userId: string, intentionId: string): Promise<{ alreadyPrayed: boolean; intention: PrayerIntention | null }> {
    const existing = await prayerLogRepository.findByUserAndIntention(userId, intentionId);
    if (existing) {
      const intention = await prayerIntentionRepository.get(intentionId);
      return { alreadyPrayed: true, intention };
    }
    await prayerLogRepository.create({
      intention_id: intentionId,
      user_id: userId,
      prayed_at: new Date().toISOString(),
    });
    const current = await prayerIntentionRepository.get(intentionId);
    if (!current) return { alreadyPrayed: false, intention: null };
    const updated = await prayerIntentionRepository.update(intentionId, {
      prayed_count: (current.prayed_count ?? 0) + 1,
    });
    // Notifica autor (se não anônimo pra si mesmo)
    if (current.created_by !== userId) {
      notificationService.notify({
        user_id: current.created_by,
        kind: 'generic',
        title: 'Alguém orou pela sua intenção',
        body: current.body.slice(0, 80),
        link: '/app/dashboard/prayer',
        meta: { intention_id: intentionId },
      }).catch(() => {});
    }
    return { alreadyPrayed: false, intention: updated };
  }

  async markAnswered(intentionId: string, userId: string): Promise<PrayerIntention | null> {
    const cur = await prayerIntentionRepository.get(intentionId);
    if (!cur || cur.created_by !== userId) throw new Error('Apenas o autor pode marcar como respondida.');
    return prayerIntentionRepository.update(intentionId, {
      answered: true,
      answered_at: new Date().toISOString(),
    });
  }

  async hasUserPrayed(userId: string, intentionId: string): Promise<boolean> {
    const log = await prayerLogRepository.findByUserAndIntention(userId, intentionId);
    return Boolean(log);
  }
}

export const prayerService = new PrayerService();
