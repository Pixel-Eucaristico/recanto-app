'use client';

import { useState } from 'react';
import { BookText, FileText, AlertCircle } from 'lucide-react';
import { Tooltip } from '@/shared/components/Tooltip';
import { auth } from '@/domains/auth/services/firebaseClient';

interface BookExportButtonsProps {
  bookId: string;
  bookTitle: string;
  truncated?: boolean;
  visibleUntil?: string | null;
}

type ExportFormat = 'epub' | 'pdf';

async function downloadBook(bookId: string, bookTitle: string, format: ExportFormat): Promise<void> {
  // Force-refresh token so expired sessions don't cause 401
  const token = await auth.currentUser?.getIdToken(true);
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`/api/library/${bookId}/${format}`, { headers });
  if (!res.ok) throw new Error(`Falha ao gerar ${format.toUpperCase()}`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${bookTitle}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function BookExportButtons({ bookId, bookTitle, truncated, visibleUntil }: BookExportButtonsProps) {
  const [loading, setLoading] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExport(format: ExportFormat) {
    setLoading(format);
    setError(null);
    try {
      await downloadBook(bookId, bookTitle, format);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : `Erro ao exportar ${format.toUpperCase()}`);
    } finally {
      setLoading(null);
    }
  }

  const spoilerBadge = truncated && visibleUntil && (
    <Tooltip tip={`Conteúdo disponível até ${visibleUntil} — conclua as aulas para liberar mais`} position="bottom">
      <span className="badge badge-warning badge-xs gap-1 cursor-help shrink-0">
        <AlertCircle className="w-3 h-3" />
        parcial
      </span>
    </Tooltip>
  );

  return (
    <div className="flex items-center gap-1">
      {spoilerBadge}

      <Tooltip tip="Baixar EPUB (e-readers)" position="bottom">
        <button
          type="button"
          className="btn btn-ghost btn-xs btn-circle min-h-0 h-7 w-7"
          onClick={() => handleExport('epub')}
          disabled={loading !== null}
          aria-label="Exportar EPUB"
        >
          {loading === 'epub'
            ? <span className="loading loading-spinner loading-xs" />
            : <BookText className="w-4 h-4" />}
        </button>
      </Tooltip>

      <Tooltip tip="Baixar PDF" position="bottom">
        <button
          type="button"
          className="btn btn-ghost btn-xs btn-circle min-h-0 h-7 w-7"
          onClick={() => handleExport('pdf')}
          disabled={loading !== null}
          aria-label="Exportar PDF"
        >
          {loading === 'pdf'
            ? <span className="loading loading-spinner loading-xs" />
            : <FileText className="w-4 h-4" />}
        </button>
      </Tooltip>

      {error && (
        <span className="text-error text-[10px] max-w-32 truncate">{error}</span>
      )}
    </div>
  );
}
