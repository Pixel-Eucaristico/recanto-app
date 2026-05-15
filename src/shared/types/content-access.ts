import { Role } from './role';

export type AgeRating = 'L' | '10' | '12' | '14' | '16' | '18';

export type ContentType = 'book' | 'track';

export interface ContentAccess {
  required_roles: Role[];
  age_rating: AgeRating;
}

export interface ContentGrant {
  id: string;
  user_id: string;
  content_id: string;
  content_type: ContentType;
  granted_at: string;
  granted_by: string;
  expires_at?: string;
}

export type AccessReason = 'role' | 'age' | 'no_birthdate' | 'not_authenticated';

export interface AccessDecision {
  allowed: boolean;
  reason?: AccessReason;
  minAge?: number;
}

export interface AccessUser {
  uid: string;
  role: Role;
  birthdate?: string;
}
