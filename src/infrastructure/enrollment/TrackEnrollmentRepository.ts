import { BaseRepository } from '@/shared/firebase/BaseRepository';
import type { TrackEnrollmentRequest } from '@/domain/enrollment/types';

export class TrackEnrollmentRepository extends BaseRepository<TrackEnrollmentRequest> {
  constructor() {
    super('track_enrollment_requests');
  }

  async findByUserAndTrack(userId: string, trackId: string): Promise<TrackEnrollmentRequest | null> {
    const list = await this.queryByFilters([
      { field: 'user_id', operator: '==', value: userId },
      { field: 'track_id', operator: '==', value: trackId },
    ]);
    // Pega mais recente (decisões anteriores podem existir)
    return [...list].sort((a, b) => b.requested_at.localeCompare(a.requested_at))[0] ?? null;
  }

  async findPendingByTracks(trackIds: string[]): Promise<TrackEnrollmentRequest[]> {
    if (trackIds.length === 0) return [];
    // Firestore `in` max 30 — batches
    const batches: string[][] = [];
    for (let i = 0; i < trackIds.length; i += 30) batches.push(trackIds.slice(i, i + 30));
    const out: TrackEnrollmentRequest[] = [];
    for (const batch of batches) {
      const list = await this.queryByFilters([
        { field: 'status', operator: '==', value: 'pending' },
        { field: 'track_id', operator: 'in', value: batch },
      ]);
      out.push(...list);
    }
    return out.sort((a, b) => a.requested_at.localeCompare(b.requested_at));
  }

  async findByUser(userId: string): Promise<TrackEnrollmentRequest[]> {
    return this.queryByFilters(
      [{ field: 'user_id', operator: '==', value: userId }],
      { orderByField: 'requested_at', direction: 'desc' },
    );
  }
}

export const trackEnrollmentRepository = new TrackEnrollmentRepository();
