import { DirectusRepository } from '../DirectusRepository';
import { Progress } from '@/domain/formation/entities/Progress';
import type {
  FormationLesson,
  FormationModule,
  FormationTrack,
  FormationTrackType,
  LessonProgress,
} from '@/domain/formation/types';
import type {
  LessonRepositoryContract,
  ModuleRepositoryContract,
  ProgressRepositoryContract,
  TrackRepositoryContract,
  TrackTypeRepositoryContract,
} from '@/domain/formation/FormationRepositories';
import type { Role } from '@/shared/types/role';

function progressId(userId: string, lessonId: string): string {
  return `${userId}_${lessonId}`;
}

function normalizeTrack(track: FormationTrack): FormationTrack {
  return {
    ...track,
    required_roles: Array.isArray(track.required_roles) ? track.required_roles : [],
    module_ids: Array.isArray(track.module_ids) ? track.module_ids : [],
    formator_ids: Array.isArray(track.formator_ids) ? track.formator_ids : [],
    age_rating: track.age_rating ?? 'L',
  };
}

export class DirectusTrackTypeRepository
  extends DirectusRepository<FormationTrackType>
  implements TrackTypeRepositoryContract
{
  constructor() {
    super('formation_track_types');
  }

  findAll(): Promise<FormationTrackType[]> {
    return this.list('order', 'asc');
  }

  findById(id: string): Promise<FormationTrackType | null> {
    return this.get(id);
  }

  remove(id: string): Promise<void> {
    return this.delete(id);
  }
}

export class DirectusTrackRepository
  extends DirectusRepository<FormationTrack>
  implements TrackRepositoryContract
{
  constructor() {
    super('formation_tracks');
  }

  async findAll(): Promise<FormationTrack[]> {
    const tracks = await this.list('order', 'asc');
    return tracks.map(normalizeTrack);
  }

  async findById(id: string): Promise<FormationTrack | null> {
    const track = await this.get(id);
    return track ? normalizeTrack(track) : null;
  }

  async findPublished(): Promise<FormationTrack[]> {
    const tracks = await this.findManyBy({ is_published: true }, 'order');
    return tracks.map(normalizeTrack);
  }

  async findByRole(role: Role): Promise<FormationTrack[]> {
    const published = await this.findPublished();
    if (role === 'admin') return published;
    return published.filter(
      track => track.required_roles.length === 0 || track.required_roles.includes(role),
    );
  }

  async findByFormator(userId: string): Promise<FormationTrack[]> {
    const tracks = await this.findAll();
    return tracks.filter(track => track.formator_ids?.includes(userId));
  }

  remove(id: string): Promise<void> {
    return this.delete(id);
  }

  async updateModuleOrder(trackId: string, moduleIds: string[]): Promise<void> {
    await this.update(trackId, { module_ids: moduleIds });
  }
}

export class DirectusModuleRepository
  extends DirectusRepository<FormationModule>
  implements ModuleRepositoryContract
{
  constructor() {
    super('formation_modules');
  }

  findById(id: string): Promise<FormationModule | null> {
    return this.get(id);
  }

  findByTrack(trackId: string): Promise<FormationModule[]> {
    return this.findManyBy({ track_id: trackId }, 'order');
  }

  async findByIds(ids: string[]): Promise<FormationModule[]> {
    if (ids.length === 0) return [];
    const modules = await Promise.all(ids.map(id => this.get(id)));
    return modules.filter((module): module is FormationModule => Boolean(module));
  }

  remove(id: string): Promise<void> {
    return this.delete(id);
  }

  async updateLessonOrder(moduleId: string, lessonIds: string[]): Promise<void> {
    await this.update(moduleId, { lesson_ids: lessonIds });
  }
}

export class DirectusLessonRepository
  extends DirectusRepository<FormationLesson>
  implements LessonRepositoryContract
{
  constructor() {
    super('formation_lessons');
  }

  findById(id: string): Promise<FormationLesson | null> {
    return this.get(id);
  }

  findByModule(moduleId: string): Promise<FormationLesson[]> {
    return this.findManyBy({ module_id: moduleId }, 'order');
  }

  async findByIds(ids: string[]): Promise<FormationLesson[]> {
    if (ids.length === 0) return [];
    const lessons = await Promise.all(ids.map(id => this.get(id)));
    return lessons.filter((lesson): lesson is FormationLesson => Boolean(lesson));
  }

  remove(id: string): Promise<void> {
    return this.delete(id);
  }
}

export class DirectusProgressRepository
  extends DirectusRepository<LessonProgress>
  implements ProgressRepositoryContract
{
  constructor() {
    super('lesson_progress');
  }

  findByUserAndLesson(userId: string, lessonId: string): Promise<LessonProgress | null> {
    return this.get(progressId(userId, lessonId));
  }

  findByUserAndTrack(userId: string, trackId: string): Promise<LessonProgress[]> {
    return this.findManyBy({ user_id: userId, track_id: trackId });
  }

  findByUser(userId: string): Promise<LessonProgress[]> {
    return this.findManyBy({ user_id: userId }, '-updated_at');
  }

  findByTrack(trackId: string): Promise<LessonProgress[]> {
    return this.findManyBy({ track_id: trackId }, '-updated_at');
  }

  async findByTracks(trackIds: string[]): Promise<LessonProgress[]> {
    if (trackIds.length === 0) return [];
    const all = await Promise.all(trackIds.map(trackId => this.findByTrack(trackId)));
    return all.flat();
  }

  async upsert(
    userId: string,
    lessonId: string,
    data: Partial<Omit<LessonProgress, 'id' | 'user_id' | 'lesson_id'>>,
  ): Promise<LessonProgress> {
    const id = progressId(userId, lessonId);
    const existing = await this.get(id);
    const next: LessonProgress = {
      ...(existing ?? {
        id,
        user_id: userId,
        lesson_id: lessonId,
        module_id: data.module_id ?? '',
        track_id: data.track_id ?? '',
        status: 'locked',
        video_watch_percent: 0,
        video_watch_seconds: 0,
        video_last_position_seconds: 0,
        reflection_submitted: false,
        quiz_passed: false,
        forum_post_made: false,
        created_at: new Date().toISOString(),
      }),
      ...data,
      id,
      user_id: userId,
      lesson_id: lessonId,
      updated_at: new Date().toISOString(),
    };

    if (existing) return (await this.update(id, next)) ?? next;
    return this.create(next);
  }

  async getOrCreate(
    userId: string,
    lessonId: string,
    moduleId: string,
    trackId: string,
  ): Promise<LessonProgress> {
    const existing = await this.findByUserAndLesson(userId, lessonId);
    if (existing) return existing;

    const initial = Progress.initial(userId, lessonId, moduleId, trackId);
    return this.create({ id: progressId(userId, lessonId), ...initial } as LessonProgress);
  }
}

export const directusTrackTypeRepository = new DirectusTrackTypeRepository();
export const directusTrackRepository = new DirectusTrackRepository();
export const directusModuleRepository = new DirectusModuleRepository();
export const directusLessonRepository = new DirectusLessonRepository();
export const directusProgressRepository = new DirectusProgressRepository();
