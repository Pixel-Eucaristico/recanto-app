'use client';

import { useEffect, useState } from 'react';
import { TrackWithProgress } from '@/domain/formation/types';
import { formationService } from '@/application/formation/FormationService';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

interface State {
  data: TrackWithProgress | null;
  loading: boolean;
  error: string | null;
}

export function useFormationTrack(trackId: string, userHabitsBlocked = false) {
  const user = useCurrentUser();
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });

  useEffect(() => {
    if (!user || !trackId) return;
    let cancelled = false;

    formationService.getTrackWithProgress(trackId, user.id, userHabitsBlocked)
      .then(data => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch(err => { if (!cancelled) setState({ data: null, loading: false, error: err.message }); });

    return () => { cancelled = true; };
  }, [user?.id, trackId, userHabitsBlocked]);

  return state;
}
