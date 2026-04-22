import { mindMapTemplateRepository, IMindMapTemplateRepository } from '@/infrastructure/mind-maps/MindMapTemplateRepository';
import { studentMindMapRepository, IStudentMindMapRepository } from '@/infrastructure/mind-maps/StudentMindMapRepository';
import { MindMapEntity } from '@/domain/mind-maps/entities/MindMap';
import { MindMapTemplate, MindMapState, StudentMindMap } from '@/domain/mind-maps/types';

export class MindMapService {
  constructor(
    private readonly templates: IMindMapTemplateRepository = mindMapTemplateRepository,
    private readonly students: IStudentMindMapRepository = studentMindMapRepository,
  ) {}

  async getTemplateByLesson(lessonId: string): Promise<MindMapTemplate | null> {
    return this.templates.findByLesson(lessonId);
  }

  async getTemplate(id: string): Promise<MindMapTemplate | null> {
    return this.templates.findById(id);
  }

  async saveTemplate(t: MindMapTemplate | (Omit<MindMapTemplate, 'id'> & { id?: string })): Promise<MindMapTemplate> {
    const errors = MindMapEntity.validateTemplate(t);
    if (errors.length > 0) throw new Error(errors.join(' '));
    if ('id' in t && t.id) {
      const { id, ...rest } = t as MindMapTemplate;
      const updated = await this.templates.update(id, rest);
      if (!updated) throw new Error('Falha ao atualizar template.');
      return updated;
    }
    return this.templates.create(t as Omit<MindMapTemplate, 'id'>);
  }

  /**
   * Carrega mapa do aluno; se não existe, retorna clone do template.
   */
  async loadForStudent(userId: string, template: MindMapTemplate): Promise<MindMapState> {
    const existing = await this.students.findByUserAndTemplate(userId, template.id);
    if (existing) {
      return {
        nodes: existing.nodes,
        edges: existing.edges,
        positions: existing.positions,
      };
    }
    return MindMapEntity.cloneForStudent(template);
  }

  async saveStudent(
    userId: string,
    template: MindMapTemplate,
    state: MindMapState,
  ): Promise<StudentMindMap> {
    const existing = await this.students.findByUserAndTemplate(userId, template.id);
    const createdAt = existing?.created_at ?? new Date().toISOString();
    return this.students.upsert({
      user_id: userId,
      template_id: template.id,
      lesson_id: template.lesson_id,
      nodes: state.nodes,
      edges: state.edges,
      positions: state.positions,
      created_at: createdAt,
      updated_at: new Date().toISOString(),
    });
  }
}

export const mindMapService = new MindMapService();
