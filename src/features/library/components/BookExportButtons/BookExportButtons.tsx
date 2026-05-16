'use client';

import { BookText, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Tooltip } from '@/shared/components/Tooltip';
import { useClientBookExport, type ExportFormat } from '@/features/library/hooks/useClientBookExport';

interface BookExportButtonsProps {
  bookId: string;
  bookTitle: string;
  truncated?: boolean;
  visibleUntil?: string | null;
}

export function BookExportButtons({ bookId, truncated, visibleUntil }: BookExportButtonsProps) {
  const { state, exportBook } = useClientBookExport(bookId);
  const busy = state.phase === 'working';

  function isLoading(format: ExportFormat): boolean {
    return busy && state.format === format;
  }

  function statusLabel(): string | null {
    if (state.phase === 'working') return 'Gerando...';
    if (state.phase === 'done') return 'Pronto!';
    return null;
  }

  const spoilerBadge = truncated && visibleUntil && (
    <Tooltip tip={`Conteúdo disponível até ${visibleUntil} — conclua as aulas para liberar mais`} position="bottom">
      <span className="badge badge-warning badge-xs gap-1 cursor-help shrink-0">
        <AlertCircle className="w-3 h-3" />
        parcial
      </span>
    </Tooltip>
  );

  const label = statusLabel();

  return (
    <div className="flex items-center gap-1">
      {spoilerBadge}

      <Tooltip tip="Baixar EPUB (gera no navegador)" position="bottom">
        <button
          type="button"
          className="btn btn-ghost btn-xs btn-circle min-h-0 h-7 w-7"
          onClick={() => exportBook('epub')}
          disabled={busy}
          aria-label="Exportar EPUB"
        >
          {isLoading('epub')
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <BookText className="w-4 h-4" />}
        </button>
      </Tooltip>

      <Tooltip tip="Baixar PDF (gera no navegador)" position="bottom">
        <button
          type="button"
          className="btn btn-ghost btn-xs btn-circle min-h-0 h-7 w-7"
          onClick={() => exportBook('pdf')}
          disabled={busy}
          aria-label="Exportar PDF"
        >
          {isLoading('pdf')
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <FileText className="w-4 h-4" />}
        </button>
      </Tooltip>

      {label && (
        <span className="text-[10px] text-base-content/60">{label}</span>
      )}
      {state.error && (
        <span className="text-error text-[10px] max-w-32 truncate" title={state.error}>{state.error}</span>
      )}
    </div>
  );
}
