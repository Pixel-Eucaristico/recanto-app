'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { availableMods, ModComponents } from '@/components/mods';
import type { CMSBlock } from '@/types/cms-types';
import { Trash2, GripVertical, FileQuestion, ArrowUp, ArrowDown, Edit } from 'lucide-react';
import dynamic from 'next/dynamic';

interface BlockEditorProps {
  block: CMSBlock;
  index: number;
  totalBlocks: number;
  onUpdate: (updatedBlock: CMSBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function BlockEditor({
  block,
  index,
  totalBlocks,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isSelected,
  onSelect
}: BlockEditorProps) {
  const modConfig = availableMods[block.modId];
  // @ts-ignore - ModComponents is a map of components
  const Component = ModComponents[block.modId];

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
    zIndex: isDragging ? 100 : (isSelected ? 50 : 1),
    position: 'relative' as const,
  };

  if (!modConfig || !Component) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="alert alert-error my-4 p-4 flex items-center gap-4"
        onClick={onSelect}
      >
        <FileQuestion className="w-8 h-8" />
        <div>
           <h3 className="font-bold">Bloco Desconhecido</h3>
           <p className="text-sm">O módulo "{block.modId}" não foi encontrado.</p>
        </div>
        <button className="btn btn-sm btn-circle btn-ghost ml-auto" onClick={onDelete}>
           <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative transition-all duration-200 ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100 my-4' : 'hover:ring-1 hover:ring-primary/50 my-1'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      {/* Visual Component Render */}
      <div className={`relative bg-base-100 transition-all min-h-[60px] max-h-[500px] overflow-hidden ${isSelected ? 'shadow-2xl' : 'shadow-sm group-hover:shadow-md'}`}>
         {/* Interaction Blocker - Allows simple selection but prevents links/buttons inside from navigating */}
         <div className="absolute inset-0 z-10 bg-transparent" />

         {/* Preview container with scale for fullscreen components */}
         <div className="boundary-reset origin-top [&_section]:!h-auto [&_section]:!min-h-[200px] [&_section]:!max-h-[480px]">
            {(() => {
              // Corrigir aninhamento incorreto de props (props.props -> props)
              // Alguns mods usam editor "props" que aninha tudo em block.props.props
              const actualProps = (block.props?.props && typeof block.props.props === 'object' && Object.keys(block.props.props).length > 0)
                ? block.props.props
                : block.props;

              return <Component {...actualProps} />;
            })()}
         </div>

         {/* Gradient fade indicator when content is clipped */}
         <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-base-100 to-transparent pointer-events-none" />
      </div>

      {/* Editor Controls Overlay - Always visible when selected, visible on hover otherwise */}
      <div className={`absolute top-0 left-0 right-0 z-20 flex justify-between items-start pointer-events-none opacity-0 transition-opacity duration-200 -mt-3 mx-4 ${isSelected || isDragging ? 'opacity-100' : 'group-hover:opacity-100'}`}>
          
          {/* Left Handle */}
          <div className="flex bg-primary text-primary-content rounded-md shadow-lg overflow-hidden pointer-events-auto scale-90 md:scale-100 origin-top-left">
            <button
               {...attributes}
               {...listeners}
               className="p-1.5 hover:bg-primary-focus cursor-grab active:cursor-grabbing flex items-center gap-2 px-3 transition-colors"
               title="Arraste para mover"
            >
               <GripVertical className="w-4 h-4" />
               <span className="text-xs font-bold font-mono uppercase tracking-wide">{modConfig.name}</span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 bg-base-100 rounded-md shadow-lg border border-base-200 p-1 pointer-events-auto scale-90 md:scale-100 origin-top-right">
             <button 
               onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
               className="btn btn-xs btn-ghost btn-square text-primary"
               title="Editar bloco"
             >
                <Edit className="w-3 h-3" />
             </button>
             
             <div className="w-px h-4 bg-base-300 mx-1" />

             <button 
               onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
               disabled={index === 0}
               className="btn btn-xs btn-ghost btn-square"
               title="Mover para cima"
             >
                <ArrowUp className="w-3 h-3" />
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
               disabled={index === totalBlocks - 1}
               className="btn btn-xs btn-ghost btn-square"
               title="Mover para baixo"
             >
                <ArrowDown className="w-3 h-3" />
             </button>
             
             <div className="w-px h-4 bg-base-300 mx-1" />

             <button
               onClick={(e) => {
                 e.stopPropagation();
                 onDelete();
               }}
               className="btn btn-xs btn-ghost btn-square text-error hover:bg-error/10"
               title="Excluir bloco"
             >
               <Trash2 className="w-3 h-3" />
             </button>
          </div>
      </div>

      {isSelected && (
        <div className="absolute inset-0 border-2 border-primary pointer-events-none z-0" />
      )}
    </div>
  );
}
