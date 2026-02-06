'use client';

import { Plus, Trash2, GripVertical, Link as LinkIcon, Box, X, Upload } from 'lucide-react';
import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { useDroppable, useDndMonitor } from '@dnd-kit/core';
import { AnimationPicker } from './AnimationPicker';
import { availableMods } from '@/components/mods'; // Import registry
import ModsLibrary from '@/components/cms-editor/ModsLibrary';
import { ModPropConfig } from '@/types/cms-types';

interface Pillar {
  icon: string;
  lottie?: string;
  title: string;
  description: string;
  iconColor: string;
  buttonText?: string;
  // Action System
  actionType?: 'url' | 'modal_block'; 
  buttonLink?: string;
  // Generic Block Config
  modalBlock?: {
    modId: string;
    props: Record<string, any>;
  };
}

interface PillarsEditorProps {
  value: Pillar[];
  onChange: (value: Pillar[]) => void;
  blockId?: string;
  onOpenLibrary?: (callback: (modId: string) => void) => void;
}

// Lista dos ícones mais comuns para pilares/features
const COMMON_ICONS = [
  { name: 'Book', label: 'Livro' },
  { name: 'Heart', label: 'Coração' },
  { name: 'Users', label: 'Pessoas' },
  { name: 'Handshake', label: 'Aperto de Mão' },
  { name: 'Church', label: 'Igreja' },
  { name: 'Cross', label: 'Cruz' },
  { name: 'Sparkles', label: 'Brilho' },
  { name: 'HandHeart', label: 'Mão com Coração' },
  { name: 'Target', label: 'Alvo' },
  { name: 'Award', label: 'Prêmio' },
  { name: 'Shield', label: 'Escudo' },
  { name: 'Star', label: 'Estrela' },
  { name: 'Home', label: 'Casa' },
  { name: 'MessageCircle', label: 'Mensagem' },
  { name: 'Compass', label: 'Bússola' },
  { name: 'Globe', label: 'Globo' },
  { name: 'Music', label: 'Música' },
  { name: 'Sun', label: 'Sol' },
  { name: 'Moon', label: 'Lua' },
  { name: 'Zap', label: 'Raio' },
  { name: 'QrCode', label: 'QR Code' },
];

const COLOR_OPTIONS = [
  { value: 'primary', label: 'Principal', class: 'text-primary' },
  { value: 'secondary', label: 'Secundário', class: 'text-secondary' },
  { value: 'accent', label: 'Destaque', class: 'text-accent' },
  { value: 'info', label: 'Informação', class: 'text-info' },
  { value: 'success', label: 'Sucesso', class: 'text-success' },
  { value: 'warning', label: 'Aviso', class: 'text-warning' },
  { value: 'error', label: 'Erro', class: 'text-error' },
];

// Helper to render Icons
const renderIcon = (iconName: string, className: string = '') => {
  const IconComponent = (LucideIcons as any)[iconName];
  if (!IconComponent) return <LucideIcons.HelpCircle className={className} />;
  return <IconComponent className={className} />;
};

interface PillarItemEditorProps {
   pillar: Pillar;
   index: number;
   blockId?: string;
   isOnlyItem: boolean;
   onUpdate: (updatedPillar: Pillar) => void;
   onRemove: () => void;
   onOpenLibrary: (callback: (modId: string) => void) => void;
}

function PillarItemEditor({ 
  pillar, 
  index, 
  blockId, 
  isOnlyItem, 
  onUpdate, 
  onRemove,
  onOpenLibrary
}: PillarItemEditorProps) {
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  // Configure Droppable Zone
  const droppableId = blockId ? `drop:pillar:${blockId}:${index}` : undefined;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId || `temp-drop-${index}`,
    disabled: !blockId
  });

  const handleChange = (field: keyof Pillar, value: any) => {
    onUpdate({ ...pillar, [field]: value });
  };

   const handleBlockPropChange = (propName: string, propValue: any) => {
      const currentBlock = pillar.modalBlock || { modId: 'PixMod', props: {} };
      onUpdate({
         ...pillar,
         modalBlock: {
            ...currentBlock,
            props: { ...currentBlock.props, [propName]: propValue }
         }
      });
   };

    // Nested Form Renderer
    const renderNestedBlockForm = () => {
       if (!pillar.modalBlock) return null;
       const config = availableMods[pillar.modalBlock.modId];
       if (!config) return <div className="text-error text-xs">Mod {pillar.modalBlock.modId} não encontrado.</div>;
       const props = config.props || config.fields || [];

       return (
          <div className="space-y-2 mt-2">
             {props.map((prop: ModPropConfig) => {
                const propName = prop.name || (prop as any).key;
                if (['pillars-editor', 'sections-editor', 'testimonials-editor'].includes(prop.type)) return null;
                const value = pillar.modalBlock!.props[propName] ?? prop.default ?? '';

                return (
                   <div key={propName} className="form-control">
                      <label className="label pt-0 pb-1">
                         <span className="label-text text-xs font-semibold">{prop.label}</span>
                      </label>
                      {prop.type === 'select' && (
                         <select 
                            className="select select-bordered select-sm w-full"
                            value={value}
                            onChange={(e) => handleBlockPropChange(propName, e.target.value)}
                         >
                            {prop.options?.map((opt: any) => (
                               <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
                                  {typeof opt === 'string' ? opt : opt.label}
                               </option>
                            ))}
                         </select>
                      )}
                      {(prop.type === 'text' || prop.type === 'url' || prop.type === 'string') && (
                         <input 
                            type="text"
                            className="input input-bordered input-sm w-full"
                            placeholder={prop.placeholder}
                            value={value}
                            onChange={(e) => handleBlockPropChange(propName, e.target.value)}
                         />
                      )}
                      {prop.type === 'number' && (
                         <input 
                            type="number"
                            className="input input-bordered input-sm w-full"
                            placeholder={prop.placeholder}
                            value={value}
                            onChange={(e) => handleBlockPropChange(propName, e.target.value)}
                         />
                      )}
                   </div>
                );
             })}
          </div>
       );
    };

  return (
    <div className="card bg-base-200 shadow-sm border border-base-300">
      <div className="card-body p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-base-content/40 cursor-move" />
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/60">
              Item {index + 1}
            </span>
             {pillar.actionType === 'modal_block' && (
               <span className="badge badge-info badge-xs gap-1">
                  <Box className="w-3 h-3"/> Modal
               </span>
            )}
           </div>
          <button
            type="button"
            onClick={onRemove}
            className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
            title="Remover Item"
            disabled={isOnlyItem}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Visuals Row */}
          <div className="space-y-3">
             <div className="p-3 bg-base-100/50 rounded-lg border border-base-300">
                <span className="text-[10px] font-bold uppercase text-base-content/50 block mb-2">Ícone & Animação</span>
                
                {/* Icon Selection */}
                <div className="form-control mb-3">
                  <button
                    type="button"
                    onClick={() => setIconPickerOpen(!iconPickerOpen)}
                    className="btn btn-outline btn-sm justify-start gap-2 w-full"
                  >
                    {renderIcon(pillar.icon, 'w-4 h-4')}
                    <span className="truncate">{COMMON_ICONS.find(i => i.name === pillar.icon)?.label || pillar.icon}</span>
                  </button>
                   {iconPickerOpen && (
                    <div className="mt-2 p-2 bg-base-100 rounded-lg border border-base-300 shadow-xl absolute z-50 w-64 max-h-60 overflow-y-auto grid grid-cols-5 gap-1">
                      {COMMON_ICONS.map((iconOption) => (
                        <button
                          key={iconOption.name}
                          type="button"
                          onClick={() => {
                             handleChange('icon', iconOption.name);
                             setIconPickerOpen(false);
                          }}
                          className={`btn btn-sm btn-square ${pillar.icon === iconOption.name ? 'btn-primary' : 'btn-ghost'}`}
                          title={iconOption.label}
                        >
                          {renderIcon(iconOption.name, 'w-4 h-4')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                 <div className="form-control mb-3">
                    <select
                       className="select select-bordered select-xs w-full"
                       value={pillar.iconColor}
                       onChange={(e) => handleChange('iconColor', e.target.value)}
                    >
                       {COLOR_OPTIONS.map((color) => (
                       <option key={color.value} value={color.value}>{color.label}</option>
                       ))}
                    </select>
                 </div>
                 <div className="divider my-1 text-[10px]">OU</div>
                 <AnimationPicker
                    value={pillar.lottie || 'none'}
                    onChange={(val) => handleChange('lottie', val)}
                 />
             </div>
          </div>

           {/* Content Section */}
          <div className="space-y-3">
            <input
                type="text"
                className="input input-bordered input-sm font-bold w-full"
                placeholder="Título Principal"
                value={pillar.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
              <textarea
                className="textarea textarea-bordered textarea-sm leading-tight min-h-[5rem] w-full"
                placeholder="Descrição do item..."
                rows={2}
                value={pillar.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />

              {/* ACTION CONFIGURATION */}
              <div className="bg-base-100 rounded-lg border border-base-300 overflow-hidden">
                  <div className="bg-base-200/50 px-3 py-2 border-b border-base-300 flex items-center justify-between">
                     <span className="text-xs font-bold uppercase text-base-content/60">Botão de Ação</span>
                     <div className="join">
                        <button 
                           type="button"
                           className={`join-item btn btn-xs ${pillar.actionType !== 'modal_block' ? 'btn-active btn-neutral' : ''}`}
                           onClick={() => handleChange('actionType', 'url')}
                         >
                           <LinkIcon className="w-3 h-3 mr-1"/> Link
                         </button>
                         <button 
                           type="button"
                           className={`join-item btn btn-xs ${pillar.actionType === 'modal_block' ? 'btn-active btn-primary text-white' : ''}`}
                           onClick={() => handleChange('actionType', 'modal_block')}
                         >
                           <Box className="w-3 h-3 mr-1"/> Modal
                         </button>
                     </div>
                  </div>
                  
                  <div className="p-3">
                    <div className="form-control mb-3">
                       <label className="label pt-0 pb-1"><span className="label-text text-xs">Texto do Botão</span></label>
                       <input
                         type="text"
                         className="input input-bordered input-sm"
                         placeholder="Ex: Saiba Mais"
                         value={pillar.buttonText || ''}
                         onChange={(e) => handleChange('buttonText', e.target.value)}
                       />
                     </div>

                    {pillar.actionType === 'modal_block' ? (
                       <div className="animate-in fade-in slide-in-from-top-2 duration-300 border border-base-200 bg-base-50 rounded-lg p-3">
                             <span className="label-text text-xs font-bold flex items-center gap-2 mb-2">
                                <Box className="w-3 h-3"/> Conteúdo do Modal (Bloco)
                             </span>
                             
                             {/* DROP ZONE / SELECTION UI */}
                             {!pillar.modalBlock?.modId ? (
                                <div 
                                   ref={setNodeRef}
                                   className={`
                                      border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group
                                      ${isOver 
                                         ? 'border-primary bg-primary/10 scale-[1.02]' 
                                         : 'border-base-300 hover:border-primary/50 hover:bg-base-100'
                                      }
                                   `}
                                   onClick={() => {
                                      onOpenLibrary((modId) => {
                                         onUpdate({
                                            ...pillar,
                                            modalBlock: { modId, props: {} }
                                         });
                                      });
                                   }}
                                >
                                   <div className="flex flex-col items-center gap-2 pointer-events-none">
                                      <div className={`p-3 rounded-full ${isOver ? 'bg-primary text-white' : 'bg-base-200 text-base-content/40 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                         {isOver ? <Upload className="w-6 h-6 animate-bounce"/> : <Plus className="w-6 h-6"/>}
                                      </div>
                                      <div>
                                         <p className="font-semibold text-sm">
                                            {isOver ? 'Solte o bloco aqui!' : 'Arraste um bloco aqui'}
                                         </p>
                                         <p className="text-xs text-base-content/50">
                                            ou clique para selecionar
                                         </p>
                                      </div>
                                   </div>
                                </div>
                             ) : (
                                <div className="space-y-3">
                                   {/* Selected Block Info */}
                                   <div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg border border-base-200 shadow-sm relative group">
                                      {/* Block Icon/Preview */}
                                      <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
                                         {availableMods[pillar.modalBlock.modId]?.name?.[0] || 'B'}
                                      </div>
                                      
                                      <div className="flex-1 min-w-0">
                                         <h4 className="font-semibold text-sm truncate">
                                            {availableMods[pillar.modalBlock.modId]?.name || pillar.modalBlock.modId}
                                         </h4>
                                         <p className="text-[10px] text-base-content/60 truncate">
                                            Bloco configurado
                                         </p>
                                      </div>

                                      {/* Remove Action */}
                                      <button
                                         onClick={() => {
                                            onUpdate({ ...pillar, modalBlock: undefined });
                                         }}
                                         className="btn btn-sm btn-ghost btn-square text-error hover:bg-error/10"
                                         title="Remover Bloco"
                                      >
                                         <Trash2 className="w-4 h-4"/>
                                      </button>
                                   </div>

                                   {/* Config Form */}
                                   <div className="pl-2 border-l-2 border-primary/20">
                                      <h5 className="text-[10px] font-bold uppercase text-base-content/40 mb-1">
                                         Configurar Bloco
                                      </h5>
                                      {renderNestedBlockForm()}
                                   </div>
                                </div>
                             )}
                          </div>
                    ) : (
                       <div className="form-control animate-in fade-in slide-in-from-top-2 duration-300">
                         <label className="label pt-0 pb-1"><span className="label-text text-xs">URL de Destino</span></label>
                         <input
                           type="text"
                           className="input input-bordered input-sm"
                           placeholder="Ex: /contato ou https://..."
                           value={pillar.buttonLink || ''}
                           onChange={(e) => handleChange('buttonLink', e.target.value)}
                         />
                       </div>
                    )}
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PillarsEditor({ value = [], onChange, blockId, onOpenLibrary }: PillarsEditorProps) {
  
  const normalizeValue = (val: any): Pillar[] => {
    const defaultPillar: Pillar = {
      icon: 'Book',
      lottie: 'none',
      title: '',
      description: '',
      iconColor: 'primary',
      actionType: 'url',
      // modalBlock starts undefined to show empty state!
    };

    if (Array.isArray(val) && val.length > 0) {
      return val.map(p => ({
        ...defaultPillar,
        ...p,
        // Ensure modalBlock exists if converting from old format... 
        // actually if we want empty state, we should let it be undefined if invalid
      }));
    }
    
    return [defaultPillar];
  };

  const [pillars, setPillars] = useState<Pillar[]>(normalizeValue(value));
  const [libraryModalOpen, setLibraryModalOpen] = useState<number | null>(null);

  const handleUpdate = (newPillars: Pillar[]) => {
    setPillars(newPillars);
    onChange(newPillars);
  };

  // Monitor DND events
  useDndMonitor({
    onDragEnd(event) {
       const { active, over } = event;
       if (!over || !active.data.current || active.data.current.type !== 'mod') return;
       
       const overId = String(over.id);
       // Pattern: drop:pillar:{blockId}:{index}
       if (overId.startsWith(`drop:pillar:${blockId}:`)) {
          const indexStr = overId.split(':').pop();
          const index = parseInt(indexStr || '', 10);
          
          if (!isNaN(index) && pillars[index]) {
             const modId = active.data.current.modId;
             console.log(`Dropped ${modId} onto pillar ${index}`);
             
             // Update logic
             const newPillars = [...pillars];
             newPillars[index] = {
                ...newPillars[index],
                modalBlock: { modId, props: {} }
             };
             handleUpdate(newPillars);
          }
       }
    }
 });

  const handleAdd = () => {
    const newPillars = [
      ...pillars,
      {
        icon: 'Book',
        lottie: 'none',
        title: '',
        description: '',
        iconColor: 'primary',
        actionType: 'url' as const,
        // Start empty
      }
    ];
    handleUpdate(newPillars);
  };

  const handleRemove = (index: number) => {
    if (pillars.length === 1) return;
    const newPillars = pillars.filter((_, i) => i !== index);
    handleUpdate(newPillars);
  };

  const handlePillarUpdate = (index: number, updatedPillar: Pillar) => {
     const newPillars = [...pillars];
     newPillars[index] = updatedPillar;
     handleUpdate(newPillars);
  };

  return (
    <div className="space-y-4">
      {pillars.map((pillar, index) => (
         <PillarItemEditor 
            key={index}
            index={index}
            pillar={pillar}
            blockId={blockId}
            isOnlyItem={pillars.length === 1}
            onUpdate={(p) => handlePillarUpdate(index, p)}
            onRemove={() => handleRemove(index)}
            onOpenLibrary={(cb) => {
               if (onOpenLibrary) {
                  onOpenLibrary(cb);
               } else {
                  setLibraryModalOpen(index);
               }
            }}
         />
      ))}

      <button
        type="button" // Prevent form submission
        onClick={(e) => { e.preventDefault(); handleAdd(); }}
        className="btn btn-outline btn-sm gap-2 w-full border-dashed"
      >
        <Plus className="w-4 h-4" />
        Adicionar Item
      </button>

       <div className="text-center text-xs text-base-content/40 mt-2">
         {pillars.length} itens configurados
      </div>

      {/* Library Selection Modal (Fallback/Internal) */}
      {libraryModalOpen !== null && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-base-100 rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
               <button 
                  onClick={() => setLibraryModalOpen(null)} 
                  className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10"
               >
                  <LucideIcons.X className="w-5 h-5"/>
               </button>
               <div className="flex-1 overflow-hidden">
                  <ModsLibrary 
                     onAddMod={(modId) => {
                         const newPillars = [...pillars];
                         newPillars[libraryModalOpen] = {
                           ...newPillars[libraryModalOpen],
                           modalBlock: { modId, props: {} }
                         };
                         handleUpdate(newPillars);
                         setLibraryModalOpen(null);
                     }} 
                     disableDrag={true} 
                  />
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
