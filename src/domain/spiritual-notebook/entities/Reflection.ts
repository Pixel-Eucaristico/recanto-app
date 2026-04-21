import { Reflection, ReflectionStatus, ReflectionValidation } from '@/domain/spiritual-notebook/types';

export const REFLECTION_MIN_LENGTH = 100;
export const REFLECTION_MAX_LENGTH = 5000;

export class ReflectionEntity {
  static validate(content: string): ReflectionValidation {
    const errors: string[] = [];
    const trimmed = content.trim();
    if (trimmed.length < REFLECTION_MIN_LENGTH) {
      errors.push(`Reflexão deve ter ao menos ${REFLECTION_MIN_LENGTH} caracteres.`);
    }
    if (trimmed.length > REFLECTION_MAX_LENGTH) {
      errors.push(`Reflexão deve ter no máximo ${REFLECTION_MAX_LENGTH} caracteres.`);
    }
    return { valid: errors.length === 0, errors };
  }

  static canSubmit(content: string): boolean {
    return ReflectionEntity.validate(content).valid;
  }

  static canTransition(current: ReflectionStatus, next: ReflectionStatus): boolean {
    if (current === 'draft') return next === 'draft' || next === 'submitted';
    if (current === 'submitted') return next === 'submitted' || next === 'reviewed';
    if (current === 'reviewed') return next === 'reviewed';
    return false;
  }

  static statusLabel(status: ReflectionStatus): string {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'submitted': return 'Enviada';
      case 'reviewed': return 'Revisada';
    }
  }

  static preview(content: string, maxChars = 200): string {
    const trimmed = content.trim();
    return trimmed.length > maxChars ? `${trimmed.slice(0, maxChars)}…` : trimmed;
  }

  static newDraft(
    params: Omit<Reflection, 'id' | 'status' | 'created_at'>
  ): Omit<Reflection, 'id'> {
    return {
      ...params,
      status: 'draft',
      created_at: new Date().toISOString(),
    };
  }
}
