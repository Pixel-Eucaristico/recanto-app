'use client';

import type { CaseNode } from '@/domain/case-studies/types';
import { MarkdownField } from '@/shared/components/MarkdownField';

interface CaseMetaFormProps {
  title: string;
  description: string;
  startNodeId: string;
  caseNodes: Record<string, CaseNode>;
  nodeIndexMap: Map<string, number>;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onStartNodeChange: (id: string) => void;
}

export function CaseMetaForm({
  title, description, startNodeId, caseNodes, nodeIndexMap,
  onTitleChange, onDescriptionChange, onStartNodeChange,
}: CaseMetaFormProps) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-3">
        <label className="form-control">
          <span className="label-text text-xs mb-1">Título</span>
          <input
            className="input input-bordered input-sm"
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            placeholder="Ex.: Dilema do jovem rico"
          />
        </label>
        <label className="form-control">
          <span className="label-text text-xs mb-1">Descrição (Markdown)</span>
          <MarkdownField value={description} onChange={onDescriptionChange} height={120} preview="live" />
        </label>
        <label className="form-control max-w-md">
          <span className="label-text text-xs mb-1">Nó de início</span>
          <select
            className="select select-bordered select-sm"
            value={startNodeId}
            onChange={e => onStartNodeChange(e.target.value)}
          >
            {Object.values(caseNodes).map(n => (
              <option key={n.id} value={n.id}>
                Nó {nodeIndexMap.get(n.id)} — {(n.text ?? '').slice(0, 40) || '(vazio)'}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
