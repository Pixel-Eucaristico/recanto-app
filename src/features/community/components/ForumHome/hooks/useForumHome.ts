'use client';

import { useMemo, useState } from 'react';
import type { CommunityPost, CommunityVisibility } from '@/domain/community/types';
import { useCommunityFeed } from '@/features/community/hooks/useCommunityFeed';
import { useCategories } from '@/features/community/hooks/useCategories';
import type { ComposerMode, View, CategoryView } from '../types';

interface UseForumHomeOptions {
  scope: CommunityVisibility;
}

export function useForumHome({ scope }: UseForumHomeOptions) {
  const [view, setView] = useState<View>('home');
  const [activeCategory, setActiveCategory] = useState<CategoryView | null>(null);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [composer, setComposer] = useState<ComposerMode>('closed');

  const { categories, loading: loadingCats } = useCategories();
  const aggregateAll = scope.scope === 'global';
  const { posts, loading, reload } = useCommunityFeed({ scope, kind: ['forum', 'poll'], aggregateAll });

  const virtualCourseCategories = useMemo<CategoryView[]>(() => {
    const tracks = new Map<string, number>();
    for (const p of posts) {
      const v = p.visibility;
      if (v.scope === 'global') continue;
      const tid = (v as { track_id?: string }).track_id;
      if (!tid) continue;
      tracks.set(tid, (tracks.get(tid) ?? 0) + 1);
    }
    return Array.from(tracks.entries()).map(([tid]) => ({
      type: 'virtual' as const,
      id: `__course_${tid}__`,
      name: `Curso: ${tid}`,
      description: 'Discussões do curso',
      virtualKind: 'course' as const,
      trackId: tid,
    }));
  }, [posts]);

  const virtualPollsCategory: CategoryView = useMemo(() => ({
    type: 'virtual',
    id: '__polls__',
    name: 'Enquetes',
    description: 'Todas as enquetes abertas',
    virtualKind: 'polls',
  }), []);

  const pollsCount = useMemo(() => posts.filter(p => p.kind === 'poll').length, [posts]);

  const adminCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of posts) {
      if (!p.category_id) continue;
      map.set(p.category_id, (map.get(p.category_id) ?? 0) + 1);
    }
    return map;
  }, [posts]);

  const totalCourseCount = useMemo(
    () => posts.filter(p => p.visibility.scope !== 'global').length,
    [posts],
  );

  function navigateToCategory(cat: CategoryView) {
    setActiveCategory(cat);
    setView('category');
  }

  function navigateToPost(post: CommunityPost) {
    setSelectedPost(post);
    setView('post');
  }

  function closeComposer() {
    setComposer('closed');
    reload();
  }

  return {
    view, setView,
    activeCategory,
    selectedPost,
    composer, setComposer,
    categories, loadingCats,
    posts, loading, reload,
    virtualCourseCategories,
    virtualPollsCategory,
    pollsCount,
    adminCounts,
    totalCourseCount,
    navigateToCategory,
    navigateToPost,
    closeComposer,
  };
}
