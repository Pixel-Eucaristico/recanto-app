'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { availableMods } from '@/components/mods';
import DynamicModForm from './DynamicModForm';
import type { CMSBlock } from '@/types/cms-types';
import { ChevronUp, ChevronDown, Trash2, Edit, Check, GripVertical, MoreVertical } from 'lucide-react';

interface BlockEditorProps {
  block: CMSBlock;
  index: number;
  totalBlocks: number;
  onUpdate: (updatedBlock: CMSBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function BlockEditor({
  block,
  index,
  totalBlocks,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown
}: BlockEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const modConfig = availableMods[block.modId];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!modConfig) {
    return (
      <div className="alert alert-error">
        <span>Mod "{block.modId}" não encontrado</span>
      </div>
    );
  }

  const handlePropsChange = (newProps: Record<string, any>) => {
    onUpdate({ ...block, props: newProps });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card bg-base-100 shadow-md border border-base-300"
    >
      {/* Block Header */}
      <div className="card-body p-1.5 md:p-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-base-200 rounded transition-colors"
              title="Arraste para reordenar"
            >
              <GripVertical className="w-5 h-5 text-base-content/40" />
            </button>

            <span className="badge badge-neutral">{index + 1}</span>
            <div>
              <h3 className="font-semibold">{modConfig.name}</h3>
              <p className="text-sm text-base-content/60">{modConfig.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Reorder Buttons */}
            <div className="join">
              <button
                className="btn btn-sm btn-ghost join-item"
                onClick={onMoveUp}
                disabled={index === 0}
                title="Mover para cima"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                className="btn btn-sm btn-ghost join-item"
                onClick={onMoveDown}
                disabled={index === totalBlocks - 1}
                title="Mover para baixo"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Edit Toggle */}
            <button
              className={`btn btn-sm gap-1 ${isExpanded ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <Check className="w-4 h-4" />
                  Fechar
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  Editar
                </>
              )}
            </button>

            {/* Delete Button */}
            <button
              className="btn btn-sm btn-ghost text-error"
              onClick={onDelete}
              title="Remover bloco"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Layout - Compact */}
        <div className="md:hidden flex items-center gap-1.5">
          {/* Drag Handle - Visual */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
          >
            <div className="flex flex-col gap-0.5 p-1.5">
              <div className="w-1 h-1 rounded-full bg-base-content/40"></div>
              <div className="w-1 h-1 rounded-full bg-base-content/40"></div>
              <div className="w-1 h-1 rounded-full bg-base-content/40"></div>
            </div>
          </button>

          {/* Number Badge - Smaller */}
          <span className="badge badge-neutral badge-xs flex-shrink-0">{index + 1}</span>

          {/* Block Name - Truncated */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{modConfig.name}</h3>
          </div>

          {/* Arrow Buttons */}
          <div className="flex flex-col gap-0.5">
            <button
              className="btn btn-xs btn-ghost p-1 min-h-0 h-6"
              onClick={onMoveUp}
              disabled={index === 0}
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <button
              className="btn btn-xs btn-ghost p-1 min-h-0 h-6"
              onClick={onMoveDown}
              disabled={index === totalBlocks - 1}
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Actions Dropdown */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
              <MoreVertical className="w-4 h-4" />
            </label>
            <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300">
              <li>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {isExpanded ? 'Fechar Editor' : 'Editar Bloco'}
                </button>
              </li>
              <li className="divider my-0"></li>
              <li>
                <button
                  onClick={onDelete}
                  className="gap-2 text-error"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Expanded Form */}
        {isExpanded && (
          <div className="mt-2 md:mt-6 pt-2 md:pt-6 border-t border-base-300">
            <h4 className="font-semibold text-sm md:text-base mb-3 md:mb-4">Configurações do Bloco</h4>
            <DynamicModForm
              modId={block.modId}
              propConfigs={modConfig.props || modConfig.fields || []}
              values={block.props}
              onChange={handlePropsChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
