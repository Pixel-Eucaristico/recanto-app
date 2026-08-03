'use client';

import { useCallback, useEffect, useState } from 'react';
import { studentWritingsService } from '@/application/formation/StudentWritingsService';
import type { FormationTrack } from '@/domain/formation/types';
import type { StudentWriting, WritingsCounts } from '@/domain/formation/writings';

export interface ScopeWritingsData {
  tracks: FormationTrack[];
  writings: StudentWriting[];
  counts: WritingsCounts | null;
  truncated: boolean;
  /** Fontes que falharam — exibir sem esconder o que carregou. */
  warnings: string[];
  loading: boolean;
  error: string | null;
  /** Substitui um escrito na lista após revisão, sem refetch. */
  patch: (key: string, changes: Partial<StudentWriting>) => void;
  reload: () => void;
}

/** Escritos de todos os alunos das trilhas do viewer (admin = todas). */
export function useScopeWritings(viewerId: string | undefined, isAdmin: boolean): ScopeWritingsData {
  const [tracks, setTracks] = useState<FormationTrack[]>([]);
  const [writings, setWritings] = useState<StudentWriting[]>([]);
  const [counts, setCounts] = useState<WritingsCounts | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey(k => k + 1), []);

  const patch = useCallback((key: string, changes: Partial<StudentWriting>) => {
    setWritings(prev => prev.map(w => (w.key === key ? { ...w, ...changes } : w)));
  }, []);

  useEffect(() => {
    if (!viewerId) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);

    studentWritingsService.listForScope({ viewerId, isAdmin })
      .then(result => {
        if (cancelled) return;
        setTracks(result.tracks);
        setWritings(result.writings);
        setCounts(result.counts);
        setTruncated(result.truncated);
        setWarnings(result.warnings);
      })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [viewerId, isAdmin, reloadKey]);

  return { tracks, writings, counts, truncated, warnings, loading, error, patch, reload };
}
