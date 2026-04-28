'use client';

import { useCallback, useEffect, useState } from 'react';
import { communityService } from '@/application/community/CommunityService';
import { CommunityCategory } from '@/domain/community/types';

export function useCategories() {
  const [categories, setCategories] = useState<CommunityCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await communityService.listCategories();
      setCategories(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { categories, loading, error, reload };
}
