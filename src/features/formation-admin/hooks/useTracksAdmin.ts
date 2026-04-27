'use client';

import { useCallback, useEffect, useState } from 'react';
import { formationAdminService, type SaveTrackInput } from '@/application/formation/FormationAdminService';
import type { FormationTrack } from '@/domain/formation/types';

export function useTracksAdmin() {
  const [tracks, setTracks] = useState<FormationTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTracks(await formationAdminService.listTracks());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  async function save(input: SaveTrackInput): Promise<FormationTrack> {
    setSaving(true);
    setError(null);
    try {
      const result = await formationAdminService.saveTrack(input);
      await reload();
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setSaving(false);
    }
  }

  async function remove(trackId: string): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      await formationAdminService.deleteTrack(trackId);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setSaving(false);
    }
  }

  return { tracks, loading, saving, error, reload, save, remove };
}
