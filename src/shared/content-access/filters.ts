import { AccessUser, ContentAccess } from '@/shared/types/content-access';
import { evaluateAccess } from './accessGate';

interface ContentWithId extends ContentAccess {
  id: string;
}

export function filterAccessibleContent<T extends ContentWithId>(
  items: T[],
  user: AccessUser | null,
  grantedContentIds: ReadonlySet<string>,
): T[] {
  return items.filter(item => evaluateAccess(item, user, grantedContentIds).allowed);
}
