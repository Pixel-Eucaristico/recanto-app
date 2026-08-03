'use client';

import { useEffect, useState } from 'react';
import { History, Loader2, X } from 'lucide-react';
import { studentWritingsService } from '@/application/formation/StudentWritingsService';
import type { StudentWriting, WritingVersion } from '@/domain/formation/writings';
import { TextDiff } from '../TextDiff/TextDiff';

interface WritingHistoryModalProps {
  writing: StudentWriting;
  onClose: () => void;
}

type ViewMode = 'diff' | 'full';

/**
 * Histórico de edições de um escrito — SOMENTE LEITURA.
 *
 * Diferente do `LessonHistoryDrawer` (usado pelo próprio aluno), aqui não existe
 * "Restaurar": reverter o texto de outra pessoa é destrutivo e não é papel do
 * formador. O topo da linha do tempo é o conteúdo atual, porque um escrito nunca
 * editado tem zero versões e ainda assim precisa ser lido.
 */
export function WritingHistoryModal({ writing, onClose }: WritingHistoryModalProps) {
  const [versions, setVersions] = useState<WritingVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>('diff');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    studentWritingsService.loadVersions(writing.kind, writing.doc_id)
      .then(list => { if (!cancelled) setVersions(list); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [writing.kind, writing.doc_id]);

  // Linha do tempo: atual primeiro, depois as versões da mais recente pra mais antiga.
  const timeline: Array<{ id: string; label: string; date: string; text: string }> = [
    {
      id: 'current',
      label: 'Versão atual',
      date: writing.updated_at ?? writing.created_at,
      text: writing.content,
    },
    ...versions.map(v => ({ id: v.id, label: v.label, date: v.created_at, text: v.text })),
  ];

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-bold text-base flex items-center gap-1">
            <History className="w-4 h-4 text-accent" /> Histórico de edições
          </h3>
          <button type="button" className="btn btn-ghost btn-xs" onClick={onClose} aria-label="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-base-content/50 mb-3 truncate">
          {writing.student_name} · {writing.track_title}
          {writing.lesson_title ? ` · ${writing.lesson_title}` : ''}
        </p>

        {error && <div className="alert alert-error text-sm mb-2"><span>{error}</span></div>}

        {loading && (
          <div className="text-sm text-base-content/60 flex items-center gap-2 py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando histórico...
          </div>
        )}

        {!loading && versions.length === 0 && (
          <div className="alert alert-info text-sm mb-3">
            <span>Nenhuma edição registrada — este é o texto original.</span>
          </div>
        )}

        {!loading && versions.length > 0 && (
          <div role="tablist" className="tabs tabs-bordered mb-3">
            <button
              role="tab"
              className={`tab tab-sm ${mode === 'diff' ? 'tab-active' : ''}`}
              onClick={() => setMode('diff')}
            >
              Ver mudanças
            </button>
            <button
              role="tab"
              className={`tab tab-sm ${mode === 'full' ? 'tab-active' : ''}`}
              onClick={() => setMode('full')}
            >
              Ver texto completo
            </button>
          </div>
        )}

        {!loading && (
          <ol className="relative border-l-2 border-base-300 ml-2 pl-4 space-y-3 max-h-[55vh] overflow-y-auto">
            {timeline.map((entry, i) => {
              const older = timeline[i + 1];
              const showDiff = mode === 'diff' && older !== undefined;
              return (
                <li key={entry.id} className="relative">
                  <span className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-base-100 border-2 border-primary" />
                  <div className="card bg-base-200/50 border border-base-300">
                    <div className="card-body p-3 gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold truncate">{entry.label}</p>
                        <span className="text-[10px] text-base-content/50 shrink-0">
                          {formatDateTime(entry.date)}
                        </span>
                      </div>
                      {showDiff
                        ? <TextDiff before={older.text} after={entry.text} />
                        : <p className="text-sm whitespace-pre-wrap leading-relaxed">{entry.text || '(sem texto)'}</p>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <div className="modal-action">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Fechar</button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
