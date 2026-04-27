'use client';

import { useCallback, useEffect, useState } from 'react';
import { formationAdminService } from '@/application/formation/FormationAdminService';
import type { FormationTrackType } from '@/domain/formation/types';

export function useTrackTypesAdmin() {
  const [types, setTypes] = useState<FormationTrackType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTypes(await formationAdminService.listTrackTypes());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  async function save(input: Parameters<typeof formationAdminService.saveTrackType>[0]): Promise<FormationTrackType> {
    setSaving(true);
    setError(null);
    try {
      const result = await formationAdminService.saveTrackType(input);
      await reload();
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      await formationAdminService.deleteTrackType(id);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setSaving(false);
    }
  }

  return { types, loading, saving, error, reload, save, remove };
}
