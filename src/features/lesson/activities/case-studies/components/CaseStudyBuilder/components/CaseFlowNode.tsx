'use client';

import { Pencil, Trophy, Play, Trash2, ArrowDownToDot } from 'lucide-react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { NodeData } from '../utils/caseStudyFlowUtils';

export function CaseFlowNode({ data }: NodeProps<Node<NodeData>>) {
  const cleaned = data.text.replace(/[#*`>_]/g, '').trim();
  const preview = cleaned.slice(0, 60) || '(clique ✏️ para escrever)';

  return (
    <div
      className={`bg-base-100 border-2 rounded-xl shadow-md min-w-48 max-w-64 ${
        data.is_start ? 'border-primary' : data.is_end ? 'border-success' : 'border-base-300'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-1 flex-wrap">
          {data.is_start && (
            <span className="badge badge-primary badge-xs gap-1">
              <Play className="w-2.5 h-2.5" /> Início
            </span>
          )}
          {data.is_end && (
            <span className="badge badge-success badge-xs gap-1">
              <Trophy className="w-2.5 h-2.5" /> Final
            </span>
          )}
          <span className="badge badge-ghost badge-xs">{data.label}</span>
        </div>
        <p className="text-xs text-base-content line-clamp-3">{preview}</p>
        <div className="flex gap-1 justify-end">
          <button className="btn btn-xs btn-ghost" onClick={data.onEdit} title="Editar">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {!data.is_start && (
            <button
              className={`btn btn-xs btn-ghost ${data.is_end ? 'text-warning' : 'text-info'}`}
              onClick={data.onToggleEnd}
              title={data.is_end ? 'Remover marca final' : 'Marcar como final'}
            >
              {data.is_end ? <Trophy className="w-3.5 h-3.5" /> : <ArrowDownToDot className="w-3.5 h-3.5" />}
            </button>
          )}
          {!data.is_start && (
            <button className="btn btn-xs btn-ghost text-error" onClick={data.onDelete} title="Excluir">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
}

export const nodeTypes = { caseNode: CaseFlowNode };
