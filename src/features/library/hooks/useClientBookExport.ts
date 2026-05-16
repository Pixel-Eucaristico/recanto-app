'use client';

import { useState } from 'react';
import { exportBookClientSide, type ExportFormat } from '@/features/library/utils/clientBookExport';

export type { ExportFormat };
export type ExportPhase = 'idle' | 'working' | 'done' | 'error';

interface ExportState {
  phase: ExportPhase;
  format: ExportFormat | null;
  error: string | null;
}

/**
 * Wrapper com UI state pra exportBookClientSide.
 * Mostra phase loading + erro + reset automático após done.
 */
export function useClientBookExport(bookId: string) {
  const [state, setState] = useState<ExportState>({ phase: 'idle', format: null, error: null });

  async function exportBook(format: ExportFormat): Promise<void> {
    setState({ phase: 'working', format, error: null });
    try {
      await exportBookClientSide(bookId, format);
      setState({ phase: 'done', format, error: null });
      setTimeout(() => setState({ phase: 'idle', format: null, error: null }), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[useClientBookExport]', err);
      setState({ phase: 'error', format, error: message });
    }
  }

  return { state, exportBook };
}
