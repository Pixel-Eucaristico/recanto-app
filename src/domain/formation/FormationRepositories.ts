import type { Role } from '@/shared/types/role';
import type {
  FormationLesson,
  FormationModule,
  FormationTrack,
  FormationTrackType,
  LessonProgress,
} from './types';
import type { Repository } from '@/domain/shared/Repository';

export interface TrackTypeRepositoryContract extends Repository<FormationTrackType> {
  findAll(): Promise<FormationTrackType[]>;
  findById(id: string): Promise<FormationTrackType | null>;
  remove(id: string): Promise<void>;
}

export interface TrackRepositoryContract extends Repository<FormationTrack> {
  findAll(): Promise<FormationTrack[]>;
  findById(id: string): Promise<FormationTrack | null>;
  findPublished(): Promise<FormationTrack[]>;
  findByRole(role: Role): Promise<FormationTrack[]>;
  findByFormator(userId: string): Promise<FormationTrack[]>;
  remove(id: string): Promise<void>;
  updateModuleOrder(trackId: string, moduleIds: string[]): Promise<void>;
}

export interface ModuleRepositoryContract extends Repository<FormationModule> {
  findById(id: string): Promise<FormationModule | null>;
  findByTrack(trackId: string): Promise<FormationModule[]>;
  findByIds(ids: string[]): Promise<FormationModule[]>;
  remove(id: string): Promise<void>;
  updateLessonOrder(moduleId: string, lessonIds: string[]): Promise<void>;
}

export interface LessonRepositoryContract extends Repository<FormationLesson> {
  findById(id: string): Promise<FormationLesson | null>;
  findByModule(moduleId: string): Promise<FormationLesson[]>;
  findByIds(ids: string[]): Promise<FormationLesson[]>;
  remove(id: string): Promise<void>;
}

export interface ProgressRepositoryContract {
  findByUserAndLesson(userId: string, lessonId: string): Promise<LessonProgress | null>;
  findByUserAndTrack(userId: string, trackId: string): Promise<LessonProgress[]>;
  findByUser(userId: string): Promise<LessonProgress[]>;
  findByTrack(trackId: string): Promise<LessonProgress[]>;
  findByTracks(trackIds: string[]): Promise<LessonProgress[]>;
  upsert(
    userId: string,
    lessonId: string,
    data: Partial<Omit<LessonProgress, 'id' | 'user_id' | 'lesson_id'>>,
  ): Promise<LessonProgress>;
  getOrCreate(
    userId: string,
    lessonId: string,
    moduleId: string,
    trackId: string,
  ): Promise<LessonProgress>;
}
