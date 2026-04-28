'use client';

import { useCallback, useEffect, useState } from 'react';
import { formationService } from '@/application/formation/FormationService';
import { TrackWithProgress } from '@/domain/formation/types';

interface UseTrackChecklistArgs {
  userId: string | null;
  trackId: string | null;
  userHabitsBlocked?: boolean;
}

export function useTrackChecklist({ userId, trackId, userHabitsBlocked = false }: UseTrackChecklistArgs) {
  const [data, setData] = useState<TrackWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId || !trackId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await formationService.getTrackWithProgress(trackId, userId, userHabitsBlocked);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [userId, trackId, userHabitsBlocked]);

  useEffect(() => {
    reload();
  }, [reload]);

  const percent = data && data.totalLessons > 0
    ? Math.round((data.completedLessons / data.totalLessons) * 100)
    : 0;

  return { data, percent, loading, error, reload };
}
