'use client';

import { useEffect, useState } from 'react';
import { reflectionService } from '@/application/spiritual-notebook/ReflectionService';
import { Reflection } from '@/domain/spiritual-notebook/types';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

export function useNotebookHistory() {
  const user = useCurrentUser();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const list = await reflectionService.listByUser(userId);
        if (!cancelled) setReflections(list);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  return { reflections, loading, error };
}
