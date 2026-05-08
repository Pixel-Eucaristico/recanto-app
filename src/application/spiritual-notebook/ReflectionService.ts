import { reflectionRepository, IReflectionRepository } from '@/infrastructure/spiritual-notebook/ReflectionRepository';
import { ReflectionEntity } from '@/domain/spiritual-notebook/entities/Reflection';
import { Reflection } from '@/domain/spiritual-notebook/types';
import { contentVersionService } from '@/application/content-versions/ContentVersionService';

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
      // Snapshot da versão anterior antes de sobrescrever (se conteúdo mudou)
      if (existing.content !== input.content) {
        contentVersionService.record({
          target_collection: 'spiritual_reflections',
          target_id: existing.id,
          plugin_kind: 'reflection',
          user_id: input.userId,
          lesson_id: input.lessonId,
          payload: { content: existing.content, status: existing.status },
          label: 'Rascunho anterior',
        }).catch(() => {});
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
    // Marca submissão como versão (snapshot do que foi enviado)
    contentVersionService.record({
      target_collection: 'spiritual_reflections',
      target_id: reflectionId,
      plugin_kind: 'reflection',
      user_id: existing.user_id,
      lesson_id: existing.lesson_id,
      payload: { content: updated.content, status: 'submitted' },
      label: 'Submissão',
    }).catch(() => {});
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

  async addPostReviewNote(reflectionId: string, userId: string, content: string): Promise<Reflection> {
    const trimmed = content.trim();
    if (trimmed.length === 0) throw new Error('Nota vazia.');
    const existing = await this.repo.findById(reflectionId);
    if (!existing) throw new Error('Reflexão não encontrada.');
    if (existing.user_id !== userId) throw new Error('Sem permissão.');
    if (existing.status !== 'reviewed') throw new Error('Notas só após revisão.');
    const note: import('@/domain/spiritual-notebook/types').PostReviewNote = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    const notes = [...(existing.post_review_notes ?? []), note];
    const updated = await this.repo.update(reflectionId, { post_review_notes: notes });
    if (!updated) throw new Error('Falha ao adicionar nota.');
    return updated;
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
