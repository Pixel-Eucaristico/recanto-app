'use client';

import { useCallback, useEffect, useState } from 'react';
import { communityService } from '@/application/community/CommunityService';
import { CommunityKind, CommunityPost, CommunityVisibility } from '@/domain/community/types';

interface Options {
  scope: CommunityVisibility;
  /** Um tipo ou lista. Omite pra incluir todos. */
  kind?: CommunityKind | CommunityKind[];
  /** Se true, agrega posts de TODOS escopos (usado no fórum global). Ignora scope.scope. */
  aggregateAll?: boolean;
}

export function useCommunityFeed({ scope, kind, aggregateAll = false }: Options) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const kindKey = Array.isArray(kind) ? kind.join(',') : kind ?? '';

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = aggregateAll
        ? await communityService.listAllAggregated()
        : await communityService.listByScope(scope);
      const filtered = kindKey
        ? list.filter(p => kindKey.split(',').includes(p.kind))
        : list;
      setPosts(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [scope, kindKey, aggregateAll]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { posts, loading, error, reload };
}
