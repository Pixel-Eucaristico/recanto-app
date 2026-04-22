'use client';

import { useCallback, useEffect, useState } from 'react';
import { communityService } from '@/application/community/CommunityService';
import { CommunityKind, CommunityPost, CommunityVisibility } from '@/domain/community/types';

interface Options {
  scope: CommunityVisibility;
  kind?: CommunityKind;
}

export function useCommunityFeed({ scope, kind }: Options) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await communityService.listByScope(scope);
      const filtered = kind ? list.filter(p => p.kind === kind) : list;
      setPosts(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [scope, kind]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { posts, loading, error, reload };
}
