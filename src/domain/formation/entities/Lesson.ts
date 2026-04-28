import { FormationLesson } from '@/domain/formation/types';

export class Lesson {
  static validate(data: Partial<FormationLesson>): string[] {
    const errors: string[] = [];
    if (!data.title?.trim()) errors.push('Título é obrigatório');
    if (!data.video_url?.trim()) errors.push('URL do vídeo é obrigatória');
    if (data.min_watch_percent !== undefined && (data.min_watch_percent < 0 || data.min_watch_percent > 100)) {
      errors.push('Percentual mínimo deve ser entre 0 e 100');
    }
    if (data.unlock_after_hours !== undefined && data.unlock_after_hours < 0) {
      errors.push('Horas de time-lock não podem ser negativas');
    }
    return errors;
  }

  static durationLabel(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
    return `${m}:${(seconds % 60).toString().padStart(2, '0')}`;
  }

  static defaults(): Omit<FormationLesson, 'id' | 'title' | 'module_id' | 'created_at'> {
    return {
      description: '',
      order: 0,
      video_url: '',
      video_duration_seconds: 0,
      min_watch_percent: 100,
      unlock_after_hours: 0,
      requires_reflection: true,
      requires_quiz: false,
      requires_forum_post: false,
      apostila_content: '',
      material_ids: [],
      highlight_quotes: [],
      practical_activity: '',
    };
  }
}
