import { BaseRepository } from '@/shared/firebase/BaseRepository';
import { MindMapTemplate } from '@/domain/mind-maps/types';

export interface IMindMapTemplateRepository {
  findById(id: string): Promise<MindMapTemplate | null>;
  findByLesson(lessonId: string): Promise<MindMapTemplate | null>;
  create(data: Omit<MindMapTemplate, 'id'>): Promise<MindMapTemplate>;
  update(id: string, data: Partial<Omit<MindMapTemplate, 'id'>>): Promise<MindMapTemplate | null>;
  remove(id: string): Promise<void>;
}

export class FirebaseMindMapTemplateRepository
  extends BaseRepository<MindMapTemplate>
  implements IMindMapTemplateRepository
{
  constructor() {
    super('mind_map_templates');
  }

  async findById(id: string): Promise<MindMapTemplate | null> {
    return this.get(id);
  }

  async findByLesson(lessonId: string): Promise<MindMapTemplate | null> {
    const results = await this.queryByFilters([{ field: 'lesson_id', operator: '==', value: lessonId }]);
    return results[0] ?? null;
  }

  async remove(id: string): Promise<void> {
    return this.delete(id);
  }
}

export const mindMapTemplateRepository = new FirebaseMindMapTemplateRepository();
