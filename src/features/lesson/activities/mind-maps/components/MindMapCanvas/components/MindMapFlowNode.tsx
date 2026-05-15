'use client';

import { Pencil, Star, Trash2 } from 'lucide-react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { MindMapNode } from '@/domain/mind-maps/types';

export interface NodeData extends Record<string, unknown> {
  label: string;
  is_root?: boolean;
  color?: MindMapNode['color'];
  onEdit: () => void;
  onDelete: () => void;
  onToggleRoot?: () => void;
}

const colorClass: Record<string, string> = {
  secondary: 'border-secondary',
  accent: 'border-accent',
  info: 'border-info',
  success: 'border-success',
  warning: 'border-warning',
};

export function MindMapFlowNode({ data }: NodeProps<Node<NodeData>>) {
  const label = data.label?.trim() || '(clique ✏️)';
  const borderClass = data.color ? (colorClass[data.color] ?? 'border-primary') : 'border-primary';

  return (
    <div className={`bg-base-100 border-2 rounded-full shadow-md px-4 py-2 min-w-32 text-center ${
      data.is_root ? 'border-warning ring-2 ring-warning/30' : borderClass
    }`}>
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div className="flex items-center justify-center gap-1 text-sm font-medium text-base-content">
        {data.is_root && <Star className="w-3.5 h-3.5 text-warning flex-shrink-0" />}
        <span className="truncate">{label}</span>
      </div>
      <div className="flex gap-1 justify-center mt-1">
        <button className="btn btn-xs btn-ghost" onClick={data.onEdit} title="Editar">
          <Pencil className="w-3 h-3" />
        </button>
        {data.onToggleRoot && (
          <button
            className={`btn btn-xs btn-ghost ${data.is_root ? 'text-warning' : ''}`}
            onClick={data.onToggleRoot}
            title={data.is_root ? 'Remover raiz' : 'Marcar como raiz'}
          >
            <Star className="w-3 h-3" />
          </button>
        )}
        {!data.is_root && (
          <button className="btn btn-xs btn-ghost text-error" onClick={data.onDelete} title="Excluir">
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
}

export const nodeTypes = { mindMapNode: MindMapFlowNode };
