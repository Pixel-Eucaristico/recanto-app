import { AccessDecision, AccessUser, ContentAccess } from '@/shared/types/content-access';
import { getAgeRatingInfo, meetsAgeRequirement } from './ageRating';

interface ContentWithId extends ContentAccess {
  id: string;
}

export function evaluateAccess(
  content: ContentWithId,
  user: AccessUser | null,
  grantedContentIds: ReadonlySet<string>,
): AccessDecision {
  if (!user) return { allowed: false, reason: 'not_authenticated' };

  if (user.role === 'admin') return { allowed: true };

  if (grantedContentIds.has(content.id)) return { allowed: true };

  const requiredRoles = content.required_roles ?? [];
  if (requiredRoles.length > 0) {
    if (!user.role || !requiredRoles.includes(user.role)) {
      return { allowed: false, reason: 'role' };
    }
  }

  const rating = content.age_rating ?? 'L';
  const info = getAgeRatingInfo(rating);
  if (info.minAge > 0 && !user.birthdate) {
    return { allowed: false, reason: 'no_birthdate', minAge: info.minAge };
  }
  if (!meetsAgeRequirement(user.birthdate, rating)) {
    return { allowed: false, reason: 'age', minAge: info.minAge };
  }

  return { allowed: true };
}
