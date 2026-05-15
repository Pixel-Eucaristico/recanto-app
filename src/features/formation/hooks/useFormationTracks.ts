'use client';

import { useEffect, useMemo, useState } from 'react';
import { FormationTrack } from '@/domain/formation/types';
import { formationService } from '@/application/formation/FormationService';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { useUserGrants } from '@/features/content-access/hooks/useUserGrants';
import { evaluateAccess } from '@/shared/content-access/accessGate';

interface State {
  tracks: FormationTrack[];
  loading: boolean;
  error: string | null;
}

export function useFormationTracks() {
  const user = useCurrentUser();
  const [state, setState] = useState<State>({ tracks: [], loading: true, error: null });
  const { grantedIds } = useUserGrants(user?.id, 'track');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    // Carrega todas as published; access gate aplicado em memória pra incluir age+grant
    formationService.getTracksForUser(user.role === 'admin' ? 'admin' : (user.role ?? null))
      .then(tracks => { if (!cancelled) setState({ tracks, loading: false, error: null }); })
      .catch(err => { if (!cancelled) setState({ tracks: [], loading: false, error: err.message }); });

    return () => { cancelled = true; };
  }, [user?.id, user?.role]);

  const accessibleTracks = useMemo(() => {
    if (!user) return state.tracks;
    const accessUser = { uid: user.id, role: user.role, birthdate: user.birthdate };
    return state.tracks.filter(t => evaluateAccess(t, accessUser, grantedIds).allowed);
  }, [state.tracks, user, grantedIds]);

  return { ...state, tracks: accessibleTracks };
}
