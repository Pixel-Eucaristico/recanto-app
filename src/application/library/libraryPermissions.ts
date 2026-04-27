/**
 * Library permission helpers — pure logic, server-friendly.
 */

interface UserClaims {
  uid?: string;
  role?: string | null;
  features?: string[];
}

export function hasFeature(user: UserClaims, feature: string): boolean {
  if (user.role === 'admin') return true;
  const f = user.features ?? [];
  return f.includes('*') || f.includes(feature);
}

export function canManageLibrary(user: UserClaims): boolean {
  return hasFeature(user, 'manage:library');
}

export function canReadLibrary(user: UserClaims): boolean {
  return canManageLibrary(user) || hasFeature(user, 'read:library');
}

export function canDownloadLibrary(user: UserClaims): boolean {
  return canManageLibrary(user) || hasFeature(user, 'download:library');
}

/**
 * Check if user has reading progress on the given book (course-unlocked access).
 * Caller passes the result of bookReadingProgressRepository.get() / has-doc check.
 */
export function hasUnlockedViaProgress(hasProgress: boolean): boolean {
  return hasProgress;
}
