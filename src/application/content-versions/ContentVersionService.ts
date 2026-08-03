import { contentVersionRepository } from '@/infrastructure/content-versions/ContentVersionRepository';
import type { ContentVersion } from '@/domain/content-versions/types';

export interface RecordVersionInput {
  target_collection: string;
  target_id: string;
  plugin_kind: string;
  user_id: string;
  lesson_id?: string;
  /** Obrigatório na prática: sem ele o formador não enxerga a versão (ver rules). */
  track_id?: string;
  payload: Record<string, unknown>;
  label?: string;
}

export class ContentVersionService {
  async record(input: RecordVersionInput): Promise<ContentVersion> {
    return contentVersionRepository.create({
      target_collection: input.target_collection,
      target_id: input.target_id,
      plugin_kind: input.plugin_kind,
      user_id: input.user_id,
      lesson_id: input.lesson_id,
      track_id: input.track_id,
      payload: input.payload,
      label: input.label,
      created_at: new Date().toISOString(),
      created_by: input.user_id,
    });
  }

  async listByTarget(target_collection: string, target_id: string): Promise<ContentVersion[]> {
    return contentVersionRepository.findByTarget(target_collection, target_id);
  }

  /** Todas as versões de um usuário — base pra contagem de edições por escrito. */
  async listByUser(userId: string, limitCount = 200): Promise<ContentVersion[]> {
    return contentVersionRepository.findByUser(userId, limitCount);
  }

  async listByTargets(target_collection: string, targetIds: string[]): Promise<ContentVersion[]> {
    return contentVersionRepository.findByTargets(target_collection, targetIds);
  }

  async getById(id: string): Promise<ContentVersion | null> {
    return contentVersionRepository.get(id);
  }
}

export const contentVersionService = new ContentVersionService();
