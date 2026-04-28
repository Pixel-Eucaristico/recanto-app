'use client';

import type { CaseNode } from '@/domain/case-studies/types';
import { MarkdownField } from '@/shared/components/MarkdownField';
import { RichContent } from '@/shared/components/RichContent';
import { EditableCard } from '@/shared/components/EditableCard';

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
    <EditableCard
      badge={
        <>
          <span className="badge badge-secondary badge-sm">Caso</span>
          {title.trim() && <span className="font-semibold text-sm truncate">{title}</span>}
        </>
      }
      preview={
        <div className="space-y-1">
          {!title.trim() && (
            <p className="text-sm italic text-base-content/40">(sem título — clique no lápis)</p>
          )}
          {description.trim() ? (
            <RichContent markdown={description} className="text-sm" />
          ) : (
            <p className="text-xs italic text-base-content/40">(sem descrição)</p>
          )}
        </div>
      }
      editor={
        <div className="space-y-3">
          <div>
            <span className="label-text text-xs mb-1 block">Título</span>
            <input
              className="input input-bordered input-sm w-full"
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              placeholder="Ex.: Dilema do jovem rico"
            />
          </div>
          <div>
            <span className="label-text text-xs mb-1 block">Descrição (Markdown)</span>
            <MarkdownField value={description} onChange={onDescriptionChange} height={120} preview="edit" />
          </div>
          <div>
            <span className="label-text text-xs mb-1 block">Nó de início</span>
            <select
              className="select select-bordered select-sm w-full"
              value={startNodeId}
              onChange={e => onStartNodeChange(e.target.value)}
            >
              {Object.values(caseNodes).map(n => (
                <option key={n.id} value={n.id}>
                  Nó {nodeIndexMap.get(n.id)} — {(n.text ?? '').slice(0, 40) || '(vazio)'}
                </option>
              ))}
            </select>
          </div>
        </div>
      }
    />
  );
}
