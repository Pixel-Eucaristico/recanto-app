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
    return this.queryByFilters(
      [
        { field: 'user_id', operator: '==', value: userId },
        { field: 'case_id', operator: '==', value: caseId },
      ],
      { orderByField: 'run_at', direction: 'desc' },
    );
  }
}

export const caseRunRepository = new FirebaseCaseRunRepository();
