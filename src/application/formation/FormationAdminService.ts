/**
 * FormationAdminService — operações de criação/edição/remoção de tracks/módulos/aulas.
 * Cuida dos relacionamentos: ao criar módulo adiciona ao track.module_ids, etc.
 */

import { trackRepository } from '@/infrastructure/formation/TrackRepository';
import { moduleRepository } from '@/infrastructure/formation/ModuleRepository';
import { lessonRepository } from '@/infrastructure/formation/LessonRepository';
import type { FormationTrack, FormationModule, FormationLesson } from '@/domain/formation/types';

// ─── Track ────────────────────────────────────────────────────────────────────

export interface SaveTrackInput {
  id?: string;
  title: string;
  description: string;
  type: FormationTrack['type'];
  required_roles: FormationTrack['required_roles'];
  order: number;
  is_published: boolean;
  thumbnail_url?: string;
  gallery_images?: string[];
}

export class FormationAdminService {
  // ─── Tracks ──────────────────────────────────────────────────────────────
  async listTracks(): Promise<FormationTrack[]> {
    return trackRepository.findAll();
  }

  async getTrack(id: string): Promise<FormationTrack | null> {
    return trackRepository.findById(id);
  }

  async saveTrack(input: SaveTrackInput): Promise<FormationTrack> {
    if (!input.title.trim()) throw new Error('Título da trilha vazio.');
    if (input.id) {
      const updated = await trackRepository.update(input.id, {
        title: input.title.trim(),
        description: input.description,
        type: input.type,
        required_roles: input.required_roles,
        order: input.order,
        is_published: input.is_published,
        thumbnail_url: input.thumbnail_url,
        gallery_images: input.gallery_images,
        updated_at: new Date().toISOString(),
      });
      if (!updated) throw new Error('Trilha não encontrada.');
      return updated;
    }
    return trackRepository.create({
      title: input.title.trim(),
      description: input.description,
      type: input.type,
      required_roles: input.required_roles,
      order: input.order,
      is_published: input.is_published,
      module_ids: [],
      thumbnail_url: input.thumbnail_url,
      gallery_images: input.gallery_images,
      created_at: new Date().toISOString(),
    });
  }

  async deleteTrack(trackId: string): Promise<void> {
    const track = await trackRepository.findById(trackId);
    if (!track) return;
    // Cascade delete: modules → lessons
    for (const moduleId of track.module_ids) {
      await this.deleteModule(moduleId, { skipTrackUpdate: true });
    }
    await trackRepository.remove(trackId);
  }

  // ─── Modules ─────────────────────────────────────────────────────────────
  async listModulesByTrack(trackId: string): Promise<FormationModule[]> {
    const track = await trackRepository.findById(trackId);
    if (!track) return [];
    const mods = await moduleRepository.findByIds(track.module_ids);
    return mods.sort((a, b) => a.order - b.order);
  }

  async saveModule(input: {
    id?: string;
    track_id: string;
    title: string;
    description: string;
    order: number;
  }): Promise<FormationModule> {
    if (!input.title.trim()) throw new Error('Título do módulo vazio.');
    if (input.id) {
      const updated = await moduleRepository.update(input.id, {
        title: input.title.trim(),
        description: input.description,
        order: input.order,
        updated_at: new Date().toISOString(),
      });
      if (!updated) throw new Error('Módulo não encontrado.');
      return updated;
    }
    const mod = await moduleRepository.create({
      title: input.title.trim(),
      description: input.description,
      track_id: input.track_id,
      order: input.order,
      lesson_ids: [],
      created_at: new Date().toISOString(),
    });
    // Add to track.module_ids
    const track = await trackRepository.findById(input.track_id);
    if (track) {
      await trackRepository.updateModuleOrder(input.track_id, [...track.module_ids, mod.id]);
    }
    return mod;
  }

  async deleteModule(moduleId: string, opts?: { skipTrackUpdate?: boolean }): Promise<void> {
    const mod = await moduleRepository.findById(moduleId);
    if (!mod) return;
    // Cascade: delete lessons
    for (const lessonId of mod.lesson_ids) {
      await lessonRepository.remove(lessonId);
    }
    // Remove from track.module_ids
    if (!opts?.skipTrackUpdate) {
      const track = await trackRepository.findById(mod.track_id);
      if (track) {
        await trackRepository.updateModuleOrder(mod.track_id, track.module_ids.filter(id => id !== moduleId));
      }
    }
    await moduleRepository.remove(moduleId);
  }

  // ─── Lessons ─────────────────────────────────────────────────────────────
  async listLessonsByModule(moduleId: string): Promise<FormationLesson[]> {
    const mod = await moduleRepository.findById(moduleId);
    if (!mod) return [];
    const lessons = await lessonRepository.findByIds(mod.lesson_ids);
    return lessons.sort((a, b) => a.order - b.order);
  }

  async saveLesson(input: {
    id?: string;
    module_id: string;
    title: string;
    description: string;
    order: number;
    video_url?: string;
    video_duration_seconds?: number;
    min_watch_percent?: number;
    unlock_after_hours?: number;
    requires_reflection?: boolean;
    requires_quiz?: boolean;
    requires_forum_post?: boolean;
    apostila_content?: string;
    quiz_id?: string;
    book_citations?: FormationLesson['book_citations'];
    forum_prompt?: string;
    practical_activity?: string;
    practical_required?: boolean;
    practical_permanent?: boolean;
    practical_deadline_days?: number;
    highlight_quotes?: FormationLesson['highlight_quotes'];
    material_ids?: string[];
  }): Promise<FormationLesson> {
    if (!input.title.trim()) throw new Error('Título da aula vazio.');

    const base = {
      title: input.title.trim(),
      description: input.description,
      module_id: input.module_id,
      order: input.order,
      video_url: input.video_url ?? '',
      video_duration_seconds: input.video_duration_seconds ?? 0,
      min_watch_percent: input.min_watch_percent ?? 80,
      unlock_after_hours: input.unlock_after_hours ?? 0,
      requires_reflection: input.requires_reflection ?? false,
      requires_quiz: input.requires_quiz ?? false,
      requires_forum_post: input.requires_forum_post ?? false,
      apostila_content: input.apostila_content,
      quiz_id: input.quiz_id,
      book_citations: input.book_citations,
      forum_prompt: input.forum_prompt,
      practical_activity: input.practical_activity,
      practical_required: input.practical_required,
      practical_permanent: input.practical_permanent,
      practical_deadline_days: input.practical_deadline_days,
      highlight_quotes: input.highlight_quotes ?? [],
      material_ids: input.material_ids ?? [],
      updated_at: new Date().toISOString(),
    };

    if (input.id) {
      const updated = await lessonRepository.update(input.id, base);
      if (!updated) throw new Error('Aula não encontrada.');
      return updated;
    }

    const lesson = await lessonRepository.create({
      ...base,
      created_at: new Date().toISOString(),
    });

    // Add to module.lesson_ids
    const mod = await moduleRepository.findById(input.module_id);
    if (mod) {
      await moduleRepository.updateLessonOrder(input.module_id, [...mod.lesson_ids, lesson.id]);
    }
    return lesson;
  }

  async deleteLesson(lessonId: string): Promise<void> {
    const lesson = await lessonRepository.findById(lessonId);
    if (!lesson) return;
    const mod = await moduleRepository.findById(lesson.module_id);
    if (mod) {
      await moduleRepository.updateLessonOrder(lesson.module_id, mod.lesson_ids.filter(id => id !== lessonId));
    }
    await lessonRepository.remove(lessonId);
  }
}

export const formationAdminService = new FormationAdminService();
