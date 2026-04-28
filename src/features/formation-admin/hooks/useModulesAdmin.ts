'use client';

import { useCallback, useEffect, useState } from 'react';
import { formationAdminService } from '@/application/formation/FormationAdminService';
import type { FormationModule } from '@/domain/formation/types';

export function useModulesAdmin(trackId: string | null) {
  const [modules, setModules] = useState<FormationModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!trackId) { setModules([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      setModules(await formationAdminService.listModulesByTrack(trackId));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  useEffect(() => { reload(); }, [reload]);

  async function save(input: Parameters<typeof formationAdminService.saveModule>[0]): Promise<FormationModule> {
    setSaving(true);
    setError(null);
    try {
      const result = await formationAdminService.saveModule(input);
      await reload();
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setSaving(false);
    }
  }

  async function remove(moduleId: string): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      await formationAdminService.deleteModule(moduleId);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      throw e;
    } finally {
      setSaving(false);
    }
  }

  return { modules, loading, saving, error, reload, save, remove };
}
