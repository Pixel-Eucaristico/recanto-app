import type { CommunityPost } from '@/domain/community/types';
import type { CategoryView } from '../types';

export function filterByCategory(posts: CommunityPost[], cat: CategoryView): CommunityPost[] {
  if (cat.type === 'admin') return posts.filter(p => p.category_id === cat.id);
  if (cat.virtualKind === 'polls') return posts.filter(p => p.kind === 'poll');
  if (cat.virtualKind === 'course' && cat.trackId) {
    return posts.filter(p => {
      const v = p.visibility;
      if (v.scope === 'global') return false;
      return (v as { track_id?: string }).track_id === cat.trackId;
    });
  }
  return [];
}
