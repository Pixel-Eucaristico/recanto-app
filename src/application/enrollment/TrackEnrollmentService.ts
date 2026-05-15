import { trackEnrollmentRepository } from '@/infrastructure/enrollment/TrackEnrollmentRepository';
import { trackRepository } from '@/infrastructure/formation/TrackRepository';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';
import { userService } from '@/services/firebase';
import { notificationService } from '@/application/notifications/NotificationService';
import type { TrackEnrollmentRequest } from '@/domain/enrollment/types';
import type { FormationTrack } from '@/domain/formation/types';

export class TrackEnrollmentService {
  /** Aluno solicita acesso. Idempotente: se já existe pending, retorna o mesmo. */
  async request(userId: string, trackId: string, note?: string): Promise<TrackEnrollmentRequest> {
    const existing = await trackEnrollmentRepository.findByUserAndTrack(userId, trackId);
    if (existing && existing.status === 'pending') return existing;

    const [track, user] = await Promise.all([
      trackRepository.findById(trackId),
      userService.get(userId).catch(() => null),
    ]);
    const created = await trackEnrollmentRepository.create({
      user_id: userId,
      user_name: user?.name ?? user?.email,
      track_id: trackId,
      track_title: track?.title,
      status: 'pending',
      request_note: note,
      requested_at: new Date().toISOString(),
    });

    // Fan-out pra formadores da trilha + admins
    const recipients = new Set<string>(track?.formator_ids ?? []);
    try {
      const admins = await userService.getUsersByRole('admin');
      for (const a of admins) recipients.add(a.id);
    } catch {/* sem admins não trava request */}
    recipients.delete(userId);
    if (recipients.size > 0) {
      await notificationService.notifyMany(Array.from(recipients), {
        kind: 'enrollment_request',
        title: 'Nova solicitação de acesso',
        body: `${user?.name ?? 'Aluno'} pediu acesso à trilha "${track?.title ?? 'trilha'}".`,
        link: '/app/dashboard/formator/approvals',
        meta: { request_id: created.id, user_id: userId, track_id: trackId },
      }).catch(() => {/* notificações best-effort */});
    }

    return created;
  }

  async approve(requestId: string, formatorId: string, note?: string): Promise<TrackEnrollmentRequest | null> {
    return this.decide(requestId, formatorId, 'approved', note);
  }

  async reject(requestId: string, formatorId: string, note?: string): Promise<TrackEnrollmentRequest | null> {
    return this.decide(requestId, formatorId, 'rejected', note);
  }

  private async decide(
    requestId: string,
    formatorId: string,
    status: 'approved' | 'rejected',
    note?: string,
  ): Promise<TrackEnrollmentRequest | null> {
    const formator = await userService.get(formatorId).catch(() => null);
    const updated = await trackEnrollmentRepository.update(requestId, {
      status,
      decided_at: new Date().toISOString(),
      decided_by: formatorId,
      decided_by_name: formator?.name ?? formator?.email,
      decision_note: note,
    });
    if (updated) {
      const verb = status === 'approved' ? 'aprovada' : 'rejeitada';
      await notificationService.notify({
        user_id: updated.user_id,
        kind: 'enrollment_decision',
        title: `Solicitação ${verb}`,
        body: `Sua solicitação de acesso a "${updated.track_title ?? 'trilha'}" foi ${verb}${note ? ` — ${note}` : ''}.`,
        link: `/app/dashboard/formation/${updated.track_id}`,
        meta: { request_id: requestId, status },
      }).catch(() => {});
    }
    return updated;
  }

  /**
   * Aluno tem acesso à trilha quando:
   * - Trilha não exige aprovação, OU
   * - Existe request mais recente com status='approved'
   */
  async isApproved(userId: string, track: FormationTrack): Promise<boolean> {
    if (!track.requires_formator_approval) return true;
    const req = await trackEnrollmentRepository.findByUserAndTrack(userId, track.id);
    return req?.status === 'approved';
  }

  async getRequestStatus(userId: string, trackId: string): Promise<TrackEnrollmentRequest | null> {
    return trackEnrollmentRepository.findByUserAndTrack(userId, trackId);
  }

  /** Pré-requisitos de trilha cumpridos: todas requires_track_ids têm progresses completed. */
  async hasPrerequisitesMet(userId: string, track: FormationTrack): Promise<boolean> {
    const prereqs = track.requires_track_ids ?? [];
    if (prereqs.length === 0) return true;
    const userProgress = await progressRepository.findByUser(userId);
    for (const reqTrackId of prereqs) {
      const reqProgresses = userProgress.filter(p => p.track_id === reqTrackId);
      if (reqProgresses.length === 0) return false;
      const allDone = reqProgresses.every(p => p.status === 'completed');
      if (!allDone) return false;
    }
    return true;
  }

  /** Lista pendentes nas trilhas que o formador é responsável (admin lê todas). */
  async listPendingForFormator(formatorId: string, isAdmin: boolean): Promise<TrackEnrollmentRequest[]> {
    if (isAdmin) {
      const all = await trackRepository.findAll();
      return trackEnrollmentRepository.findPendingByTracks(all.map(t => t.id));
    }
    const tracks = await trackRepository.findByFormator(formatorId);
    if (tracks.length === 0) return [];
    return trackEnrollmentRepository.findPendingByTracks(tracks.map(t => t.id));
  }
}

export const trackEnrollmentService = new TrackEnrollmentService();
