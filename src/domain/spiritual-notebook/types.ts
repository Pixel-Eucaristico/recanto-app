export type ReflectionStatus = 'draft' | 'submitted' | 'reviewed';

export interface PostReviewNote {
  id: string;
  content: string;
  created_at: string;
}

export interface Reflection {
  id: string;
  user_id: string;
  lesson_id: string;
  lesson_title: string;
  module_title: string;
  track_id: string;
  track_title: string;
  content: string;
  status: ReflectionStatus;
  submitted_at?: string;
  reviewed_by?: string;
  review_notes?: string;
  post_review_notes?: PostReviewNote[];
  created_at: string;
  updated_at?: string;
}

export interface ReflectionValidation {
  valid: boolean;
  errors: string[];
}
