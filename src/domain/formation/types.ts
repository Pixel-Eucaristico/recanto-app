import { Role } from '@/shared/types/role';

export type TrackType = 'pre-vocacional' | 'vocacional' | 'etapas' | 'continua';

export type ProgressStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed';

export type UnlockBlocker =
  | 'video'
  | 'time_lock'
  | 'reflection'
  | 'quiz'
  | 'forum'
  | 'habits'
  | 'previous_lesson';

// ─── Entidades de dados ────────────────────────────────────────────────────

export interface FormationTrack {
  id: string;
  title: string;
  description: string;
  type: TrackType;
  required_roles: Role[];
  order: number;
  is_published: boolean;
  module_ids: string[];
  thumbnail_url?: string;
  gallery_images?: string[];
  created_at: string;
  updated_at?: string;
}

export interface FormationModule {
  id: string;
  title: string;
  description: string;
  track_id: string;
  order: number;
  lesson_ids: string[];
  created_at: string;
  updated_at?: string;
}

export interface FormationLesson {
  id: string;
  title: string;
  description: string;
  module_id: string;
  order: number;
  video_url: string;
  video_duration_seconds: number;
  min_watch_percent: number;
  unlock_after_hours: number;
  requires_reflection: boolean;
  requires_quiz: boolean;
  requires_forum_post: boolean;
  apostila_content?: string;
  material_ids: string[];
  quiz_id?: string;
  highlight_quotes: HighlightQuote[];
  practical_activity?: string;
  created_at: string;
  updated_at?: string;
}

export interface HighlightQuote {
  text: string;
  source: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  module_id: string;
  track_id: string;
  status: ProgressStatus;
  video_watch_percent: number;
  video_last_position_seconds: number;
  video_completed_at?: string;
  reflection_submitted: boolean;
  quiz_passed: boolean;
  forum_post_made: boolean;
  unlocked_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at?: string;
}

// ─── Value objects / resultados ────────────────────────────────────────────

export interface UnlockResult {
  isUnlocked: boolean;
  blockedBy: UnlockBlocker[];
  timeRemainingSeconds?: number;
}

export interface TrackWithProgress {
  track: FormationTrack;
  modules: ModuleWithProgress[];
  completedLessons: number;
  totalLessons: number;
}

export interface ModuleWithProgress {
  module: FormationModule;
  lessons: LessonWithProgress[];
  completedCount: number;
}

export interface LessonWithProgress {
  lesson: FormationLesson;
  progress: LessonProgress | null;
  unlockResult: UnlockResult;
}
