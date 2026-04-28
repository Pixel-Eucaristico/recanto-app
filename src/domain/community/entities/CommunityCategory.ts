import { CommunityCategory, CommunityVisibility } from '@/domain/community/types';

export class CommunityCategoryEntity {
  static validate(c: CommunityCategory): string[] {
    const errors: string[] = [];
    if (!c.name || c.name.trim().length === 0) errors.push('Nome vazio.');
    if (!c.slug || !/^[a-z0-9-]+$/.test(c.slug)) errors.push('Slug precisa ter só letras minúsculas, números e hífen.');
    return errors;
  }

  /** Gera slug a partir do nome (normaliza acentos + minúsculas + hífens). */
  static slugify(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Retorna a categoria "natural" do contexto (se houver).
   * Prioridade: lesson > track > nenhuma.
   */
  static findForScope(
    categories: CommunityCategory[],
    visibility: CommunityVisibility,
  ): CommunityCategory | null {
    if (visibility.scope === 'lesson') {
      const match = categories.find(
        c => c.course_track_id === visibility.track_id && c.course_lesson_id === visibility.lesson_id,
      );
      if (match) return match;
    }
    if (visibility.scope === 'track' || visibility.scope === 'lesson' || visibility.scope === 'module') {
      const trackId = visibility.scope === 'track' ? visibility.track_id : visibility.track_id;
      const match = categories.find(c => c.course_track_id === trackId && !c.course_lesson_id);
      if (match) return match;
    }
    return null;
  }
}
