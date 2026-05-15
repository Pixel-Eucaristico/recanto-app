import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { CaseStudy } from '@/domain/case-studies/types';

export interface ICaseStudyRepository {
  findById(id: string): Promise<CaseStudy | null>;
  findByLesson(lessonId: string): Promise<CaseStudy | null>;
  create(data: Omit<CaseStudy, 'id'>): Promise<CaseStudy>;
  update(id: string, data: Partial<Omit<CaseStudy, 'id'>>): Promise<CaseStudy | null>;
  remove(id: string): Promise<void>;
}

export class FirebaseCaseStudyRepository extends BaseRepository<CaseStudy> implements ICaseStudyRepository {
  constructor() {
    super('case_studies');
  }

  async findById(id: string): Promise<CaseStudy | null> {
    return this.get(id);
  }

  async findByLesson(lessonId: string): Promise<CaseStudy | null> {
    const results = await this.queryByFilters([{ field: 'lesson_id', operator: '==', value: lessonId }]);
    return results[0] ?? null;
  }

  async remove(id: string): Promise<void> {
    return this.delete(id);
  }
}

export const caseStudyRepository = new FirebaseCaseStudyRepository();
