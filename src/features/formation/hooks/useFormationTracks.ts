'use client';

import { useEffect, useState } from 'react';
import { FormationTrack } from '@/domain/formation/types';
import { formationService } from '@/application/formation/FormationService';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

interface State {
  tracks: FormationTrack[];
  loading: boolean;
  error: string | null;
}

export function useFormationTracks() {
  const user = useCurrentUser();
  const [state, setState] = useState<State>({ tracks: [], loading: true, error: null });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    formationService.getTracksForUser(user.role)
      .then(tracks => { if (!cancelled) setState({ tracks, loading: false, error: null }); })
      .catch(err => { if (!cancelled) setState({ tracks: [], loading: false, error: err.message }); });

    return () => { cancelled = true; };
  }, [user?.id, user?.role]);

  return state;
}
