import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { CaseRun } from '@/domain/case-studies/types';

export interface ICaseRunRepository {
  findById(id: string): Promise<CaseRun | null>;
  findByUserAndCase(userId: string, caseId: string): Promise<CaseRun[]>;
  create(data: Omit<CaseRun, 'id'>): Promise<CaseRun>;
}

export class FirebaseCaseRunRepository extends BaseRepository<CaseRun> implements ICaseRunRepository {
  constructor() {
    super('case_runs');
  }

  async findById(id: string): Promise<CaseRun | null> {
    return this.get(id);
  }

  async findByUserAndCase(userId: string, caseId: string): Promise<CaseRun[]> {
    // Sem orderBy server-side — sort client (não depende de index composto).
    const all = await this.queryByFilters([
      { field: 'user_id', operator: '==', value: userId },
      { field: 'case_id', operator: '==', value: caseId },
    ]);
    return all.sort((a, b) => b.run_at.localeCompare(a.run_at));
  }
}

export const caseRunRepository = new FirebaseCaseRunRepository();
