'use client';

import { useEffect, useState } from 'react';
import { History, RotateCcw, X, Loader2 } from 'lucide-react';
import { getLessonComponent } from '@/application/lesson/LessonComponentRegistry';
import type { LessonComponentInstance, LessonComponentRuntimeContext, VersionEntry } from '@/domain/lesson-components/types';

interface LessonHistoryDrawerProps {
  instance: LessonComponentInstance;
  ctx: LessonComponentRuntimeContext;
  open: boolean;
  onClose: () => void;
  onRestored?: () => void;
}

export function LessonHistoryDrawer({ instance, ctx, open, onClose, onRestored }: LessonHistoryDrawerProps) {
  const plugin = getLessonComponent(instance.kind);
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !plugin?.getHistory) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    plugin.getHistory(instance.config, ctx)
      .then(vs => { if (!cancelled) setVersions(vs); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, instance.id, ctx.userId, ctx.lessonId]);

  async function handleRestore(versionId: string) {
    if (!plugin?.restoreVersion) return;
    setRestoring(versionId);
    setError(null);
    try {
      await plugin.restoreVersion(instance.config, ctx, versionId);
      onRestored?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRestoring(null);
    }
  }

  if (!open) return null;

  if (!plugin?.getHistory) {
    return (
      <div className="modal modal-open">
        <div className="modal-box max-w-md">
          <h3 className="font-bold text-base mb-2 flex items-center gap-1">
            <History className="w-4 h-4" /> Histórico
          </h3>
          <p className="text-sm text-base-content/60">
            Este componente ({plugin?.label ?? instance.kind}) não suporta histórico.
          </p>
          <div className="modal-action">
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Fechar</button>
          </div>
        </div>
        <div className="modal-backdrop" onClick={onClose} />
      </div>
    );
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-base flex items-center gap-1">
            <History className="w-4 h-4 text-accent" /> Histórico — {plugin.label}
          </h3>
          <button className="btn btn-ghost btn-xs" onClick={onClose} aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && <div className="alert alert-error text-sm mb-2"><span>{error}</span></div>}

        {loading && (
          <div className="text-sm text-base-content/60 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando histórico...
          </div>
        )}

        {!loading && versions.length === 0 && (
          <p className="text-sm text-base-content/60">Sem versões registradas ainda.</p>
        )}

        <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
          {versions.map(v => (
            <li key={v.id} className="card bg-base-100 border border-base-300">
              <div className="card-body p-2 gap-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold truncate">{v.label}</p>
                  <span className="text-[10px] text-base-content/50">{formatDate(v.created_at)}</span>
                </div>
                <details className="text-xs">
                  <summary className="cursor-pointer text-base-content/60">Conteúdo</summary>
                  <pre className="mt-1 text-[11px] bg-base-200 p-2 rounded overflow-x-auto max-h-40">
                    {JSON.stringify(v.payload, null, 2)}
                  </pre>
                </details>
                {plugin.restoreVersion && (
                  <button
                    type="button"
                    className="btn btn-warning btn-xs gap-1 self-end"
                    disabled={restoring === v.id}
                    onClick={() => handleRestore(v.id)}
                  >
                    {restoring === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                    Restaurar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
