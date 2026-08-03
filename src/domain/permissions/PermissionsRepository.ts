import type { Feature } from '@/config/permissions';
import type { Role } from '@/features/auth/types/user';
import type { ContentGrant, ContentType } from '@/shared/types/content-access';
import type { FirebaseUser } from '@/types/firebase-entities';
import type { Repository } from '@/domain/shared/Repository';

export interface FeaturePermissionRepository {
  getRoleFeatures(role: Role): Promise<Feature[]>;
  setRoleFeatures(role: Role, features: Feature[]): Promise<void>;
  userHasFeature(user: FirebaseUser | null, feature: Feature): Promise<boolean>;
}

export interface ContentGrantRepository extends Repository<ContentGrant> {
  findByUser(userId: string): Promise<ContentGrant[]>;
  findByContent(contentType: ContentType, contentId: string): Promise<ContentGrant[]>;
  findUserGrant(
    userId: string,
    contentType: ContentType,
    contentId: string,
  ): Promise<ContentGrant | null>;
  revoke(id: string): Promise<void>;
}
