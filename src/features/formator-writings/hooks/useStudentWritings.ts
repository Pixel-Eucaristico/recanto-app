'use client';

import { useCallback, useEffect, useState } from 'react';
import { studentWritingsService } from '@/application/formation/StudentWritingsService';
import type { StudentWriting, WritingsCounts } from '@/domain/formation/writings';

export interface StudentWritingsData {
  writings: StudentWriting[];
  counts: WritingsCounts | null;
  /** Fontes que falharam — exibir sem esconder o que carregou. */
  warnings: string[];
  /** True quando a lista foi cortada pelo teto de exibição. */
  truncated: boolean;
  loading: boolean;
  error: string | null;
  patch: (key: string, changes: Partial<StudentWriting>) => void;
}

/** Escritos de UM aluno, cortados pelas trilhas do viewer. */
export function useStudentWritings(
  viewerId: string | undefined,
  isAdmin: boolean,
  studentId: string,
): StudentWritingsData {
  const [writings, setWritings] = useState<StudentWriting[]>([]);
  const [counts, setCounts] = useState<WritingsCounts | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const patch = useCallback((key: string, changes: Partial<StudentWriting>) => {
    setWritings(prev => prev.map(w => (w.key === key ? { ...w, ...changes } : w)));
  }, []);

  useEffect(() => {
    if (!viewerId || !studentId) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);

    studentWritingsService.listForStudent({ viewerId, isAdmin, studentId })
      .then(result => {
        if (cancelled) return;
        setWritings(result.writings);
        setCounts(result.counts);
        setWarnings(result.warnings);
        setTruncated(result.truncated);
      })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [viewerId, isAdmin, studentId]);

  return { writings, counts, warnings, truncated, loading, error, patch };
}
