import { CommunityPost, CommunityVisibility } from '@/domain/community/types';
import { PollEntity } from '@/domain/community/entities/Poll';

export class CommunityPostEntity {
  static validate(post: CommunityPost): string[] {
    const errors: string[] = [];
    if (!post.title || post.title.trim().length === 0) errors.push('Título vazio.');
    if (!post.body || post.body.trim().length === 0) errors.push('Corpo vazio.');
    if (!post.kind) errors.push('Tipo (forum/poll/wall) vazio.');
    if (!post.visibility) errors.push('Visibilidade não definida.');
    if (post.kind === 'poll') errors.push(...PollEntity.validate(post));
    return errors;
  }

  /** Retorna true se a visibility do post é compatível com o escopo solicitado. */
  static matchesScope(post: CommunityPost, scope: CommunityVisibility): boolean {
    const v = post.visibility;
    if (v.scope === 'global') return true;
    if (v.scope !== scope.scope) return false;
    if (v.scope === 'track' && scope.scope === 'track') {
      return v.track_id === scope.track_id;
    }
    if (v.scope === 'module' && scope.scope === 'module') {
      return v.track_id === scope.track_id && v.module_id === scope.module_id;
    }
    if (v.scope === 'lesson' && scope.scope === 'lesson') {
      return v.track_id === scope.track_id && v.lesson_id === scope.lesson_id;
    }
    return false;
  }
}
