import type { CommunityPost } from '@/domain/community/types';

export type ComposerMode = 'closed' | 'forum' | 'poll';
export type View = 'home' | 'courses' | 'category' | 'post' | 'manage';
export type VirtualKind = 'polls' | 'course';

export interface CategoryView {
  type: 'admin' | 'virtual';
  id: string;
  name: string;
  description?: string;
  virtualKind?: VirtualKind;
  trackId?: string;
}
