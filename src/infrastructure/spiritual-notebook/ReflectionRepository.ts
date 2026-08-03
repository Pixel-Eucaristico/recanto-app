import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { Reflection, ReflectionStatus } from '@/domain/spiritual-notebook/types';

/**
 * Opções das consultas multi-trilha (visão de formador/admin).
 *
 * ⚠️ `batchSize` NÃO é otimização — é requisito de segurança. As Firestore rules
 * chamam `isTrackFormator(track_id)`, que faz `exists()` + `get()` por trilha
 * distinta na query. O Firestore permite no máximo 20 access-calls por query, então
 * um `in` grande derruba a consulta inteira com `permission-denied` (sem indicar a
 * causa). Formador precisa de `batchSize: 1`; admin pode usar 30 porque o `isAdmin()`
 * curto-circuita antes do `isTrackFormator`. Ver StudentWritingsService.
 */
export interface TrackQueryOptions {
  batchSize?: number;
  limitCount?: number;
}

export interface IReflectionRepository {
  findById(id: string): Promise<Reflection | null>;
  findByUser(userId: string): Promise<Reflection[]>;
  findByLesson(userId: string, lessonId: string): Promise<Reflection | null>;
  findByTracks(trackIds: string[], opts?: TrackQueryOptions): Promise<Reflection[]>;
  findByTracksAndStatus(trackIds: string[], status: ReflectionStatus, opts?: TrackQueryOptions): Promise<Reflection[]>;
  create(data: Omit<Reflection, 'id'>): Promise<Reflection>;
  update(id: string, data: Partial<Omit<Reflection, 'id'>>): Promise<Reflection | null>;
  remove(id: string): Promise<void>;
}

export class FirebaseReflectionRepository
  extends BaseRepository<Reflection>
  implements IReflectionRepository
{
  constructor() {
    super('spiritual_reflections');
  }

  async findById(id: string): Promise<Reflection | null> {
    return this.get(id);
  }

  async findByUser(userId: string): Promise<Reflection[]> {
    return this.queryByFilters(
      [{ field: 'user_id', operator: '==', value: userId }],
      { orderByField: 'created_at', direction: 'desc' }
    );
  }

  async findByLesson(userId: string, lessonId: string): Promise<Reflection | null> {
    const results = await this.queryByFilters([
      { field: 'user_id', operator: '==', value: userId },
      { field: 'lesson_id', operator: '==', value: lessonId },
    ]);
    return results[0] ?? null;
  }

  /** Reflexões de várias trilhas (todos os alunos). Usado por formador/admin. */
  async findByTracks(trackIds: string[], opts?: TrackQueryOptions): Promise<Reflection[]> {
    return this.queryByTrackBatches(trackIds, [], 'created_at', opts);
  }

  /** Reflexões de várias trilhas filtradas por status — fila de revisão. */
  async findByTracksAndStatus(
    trackIds: string[],
    status: ReflectionStatus,
    opts?: TrackQueryOptions,
  ): Promise<Reflection[]> {
    return this.queryByTrackBatches(
      trackIds,
      [{ field: 'status', operator: '==' as const, value: status }],
      'submitted_at',
      opts,
    );
  }

  private async queryByTrackBatches(
    trackIds: string[],
    extraFilters: Array<{ field: string; operator: '=='; value: unknown }>,
    orderByField: string,
    opts?: TrackQueryOptions,
  ): Promise<Reflection[]> {
    if (trackIds.length === 0) return [];
    const batchSize = Math.max(1, Math.min(opts?.batchSize ?? 30, 30));

    const batches: string[][] = [];
    for (let i = 0; i < trackIds.length; i += batchSize) {
      batches.push(trackIds.slice(i, i + batchSize));
    }

    const results: Reflection[] = [];
    for (const batch of batches) {
      const trackFilter = batch.length === 1
        ? { field: 'track_id', operator: '==' as const, value: batch[0] }
        : { field: 'track_id', operator: 'in' as const, value: batch };
      const page = await this.queryByFilters(
        [trackFilter, ...extraFilters],
        { orderByField, direction: 'desc', limitCount: opts?.limitCount },
      );
      results.push(...page);
    }

    // Ordena entre batches e reaplica o teto — cada batch respeita o limite isolado.
    results.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));
    return opts?.limitCount ? results.slice(0, opts.limitCount) : results;
  }

  async remove(id: string): Promise<void> {
    return this.delete(id);
  }
}

export const reflectionRepository = new FirebaseReflectionRepository();
