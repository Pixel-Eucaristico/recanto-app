import { reflectionRepository, IReflectionRepository } from '@/infrastructure/spiritual-notebook/ReflectionRepository';
import { ReflectionEntity } from '@/domain/spiritual-notebook/entities/Reflection';
import { Reflection } from '@/domain/spiritual-notebook/types';

export interface SaveDraftInput {
  userId: string;
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  trackId: string;
  trackTitle: string;
  content: string;
}

export interface ReviewInput {
  reflectionId: string;
  reviewerId: string;
  notes: string;
}

export class ReflectionService {
  constructor(private readonly repo: IReflectionRepository = reflectionRepository) {}

  async saveDraft(input: SaveDraftInput): Promise<Reflection> {
    const existing = await this.repo.findByLesson(input.userId, input.lessonId);
    if (existing) {
      if (existing.status === 'reviewed') {
        throw new Error('Reflexão já revisada — edição bloqueada.');
      }
      const updated = await this.repo.update(existing.id, { content: input.content });
      if (!updated) throw new Error('Falha ao atualizar rascunho.');
      return updated;
    }
    const draft = ReflectionEntity.newDraft({
      user_id: input.userId,
      lesson_id: input.lessonId,
      lesson_title: input.lessonTitle,
      module_title: input.moduleTitle,
      track_id: input.trackId,
      track_title: input.trackTitle,
      content: input.content,
    });
    return this.repo.create(draft);
  }

  async submit(reflectionId: string): Promise<Reflection> {
    const existing = await this.repo.findById(reflectionId);
    if (!existing) throw new Error('Reflexão não encontrada.');
    const validation = ReflectionEntity.validate(existing.content);
    if (!validation.valid) throw new Error(validation.errors.join(' '));
    if (!ReflectionEntity.canTransition(existing.status, 'submitted')) {
      throw new Error('Transição de status inválida.');
    }
    const updated = await this.repo.update(reflectionId, {
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    });
    if (!updated) throw new Error('Falha ao enviar reflexão.');
    return updated;
  }

  async listByUser(userId: string): Promise<Reflection[]> {
    return this.repo.findByUser(userId);
  }

  async findByLesson(userId: string, lessonId: string): Promise<Reflection | null> {
    return this.repo.findByLesson(userId, lessonId);
  }

  async listPendingReview(): Promise<Reflection[]> {
    return this.repo.findSubmitted();
  }

  async review(input: ReviewInput): Promise<Reflection> {
    const existing = await this.repo.findById(input.reflectionId);
    if (!existing) throw new Error('Reflexão não encontrada.');
    if (!ReflectionEntity.canTransition(existing.status, 'reviewed')) {
      throw new Error('Transição de status inválida.');
    }
    const updated = await this.repo.update(input.reflectionId, {
      status: 'reviewed',
      reviewed_by: input.reviewerId,
      review_notes: input.notes,
    });
    if (!updated) throw new Error('Falha ao revisar reflexão.');
    return updated;
  }
}

export const reflectionService = new ReflectionService();
