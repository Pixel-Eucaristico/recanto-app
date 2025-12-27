'use client';

import { useState, useMemo } from 'react';
import { availableMods } from '@/components/mods';
import { Plus, Filter, GripVertical, Search, Eye, X } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { ModComponents } from '@/components/mods'; // Import ModComponents for preview

interface ModsLibraryProps {
  onAddMod: (modId: string) => void;
  disableDrag?: boolean;
}

interface DraggableModItemProps {
  modId: string;
  modConfig: any;
  onAddMod: (modId: string) => void;
  onPreview: (modId: string) => void;
  disableDrag?: boolean;
}

function DraggableModItem({ modId, modConfig, onAddMod, onPreview, disableDrag = false }: DraggableModItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = !disableDrag 
    ? useDraggable({
        id: `mod-${modId}`,
        data: { type: 'mod', modId }
      })
    : { attributes: {}, listeners: {}, setNodeRef: undefined, isDragging: false };

  return (
    <div
      ref={disableDrag ? undefined : setNodeRef}
      {...(disableDrag ? {} : attributes)}
      {...(disableDrag ? {} : listeners)}
      className={`card bg-base-100 hover:bg-base-300 transition-all select-none border border-base-200 ${
        isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      <div className="card-body p-3 md:p-4">
        <div className="flex items-start gap-3">
          {/* Content */}
          <div className="flex-1" onClick={(e) => {
             onAddMod(modId); 
          }}>
            <div className="flex items-center gap-2 mb-1">
               {!disableDrag && <GripVertical className="w-4 h-4 text-base-content/40" />}
               <h3 className="font-semibold text-sm">{modConfig.name}</h3>
            </div>
            
            <p className="text-xs text-base-content/60 mt-1 line-clamp-2">
              {modConfig.description}
            </p>
            {modConfig.category && (
              <span className="badge badge-sm badge-ghost mt-2 font-normal text-xs">
                {modConfig.category}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            {/* Preview Icon */}
            <button
               onClick={(e) => {
                 e.stopPropagation();
                 onPreview(modId);
               }}
               className="btn btn-circle btn-sm btn-ghost flex-shrink-0 text-info hover:bg-info/10"
               title="Visualizar"
               onPointerDown={(e) => e.stopPropagation()} 
            >
               <Eye className="w-4 h-4" />
            </button>

            {/* Add Icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddMod(modId);
              }}
              className="btn btn-circle btn-sm btn-ghost flex-shrink-0 text-primary hover:bg-primary/10"
              title="Adicionar"
              onPointerDown={(e) => e.stopPropagation()} 
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ModsLibrary({ onAddMod, disableDrag = false }: ModsLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewModId, setPreviewModId] = useState<string | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    Object.values(availableMods).forEach((mod) => {
      if (mod.category) cats.add(mod.category);
    });
    return ['all', ...Array.from(cats).sort()];
  }, []);

  // Filter mods by category and search query
  const filteredMods = useMemo(() => {
    let filtered = Object.entries(availableMods);

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        ([, modConfig]) => modConfig.category === selectedCategory
      );
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(([modId, modConfig]) => {
        const name = modConfig.name?.toLowerCase() || '';
        const description = modConfig.description?.toLowerCase() || '';
        const category = modConfig.category?.toLowerCase() || '';
        return (
          name.includes(query) ||
          description.includes(query) ||
          category.includes(query) ||
          modId.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  // Category labels (Portuguese)
  const categoryLabels: Record<string, string> = {
    all: 'Todos',
    hero: 'Hero',
    content: 'Conteúdo',
    testimonial: 'Depoimentos',
    form: 'Formulários',
    gallery: 'Galerias',
    chart: 'Gráficos',
    cta: 'Call-to-Action',
    other: 'Outros'
  };

  const handlePreview = (modId: string) => {
    setPreviewModId(modId);
  };

  const closePreview = () => {
    setPreviewModId(null);
  };
  
  // @ts-ignore
  const PreviewComponent = previewModId ? ModComponents[previewModId] : null;
  const previewConfig = previewModId ? availableMods[previewModId] : null;

  // Generate default props for preview with better fallbacks
  const defaultPreviewProps = useMemo(() => {
     if (!previewConfig) return {};
     
     // Start with defaultProps if they exist in the config
     const props: Record<string, any> = { ...(previewConfig.defaultProps || {}) };
     
     const configs = previewConfig.props || previewConfig.fields || [];
     
     configs.forEach((c: any) => {
        const name = c.name || c.key;
        if (!name) return;
        
        // If already has a value from defaultProps, skip unless it's empty
        if (props[name] !== undefined && props[name] !== null && props[name] !== '') return;
        
        let val = c.default ?? c.defaultValue;
        
        // Fallback logic
        if (val === undefined || val === null || val === '') {
           if (c.placeholder) {
              val = c.placeholder;
           } else if (c.type === 'text' || c.type === 'textarea' || c.type === 'string') {
              val = c.label || name;
           } else if (c.type === 'url' || name.toLowerCase().includes('image') || name.toLowerCase().includes('avatar')) {
              val = 'https://images.unsplash.com/photo-1541913057-0bc87e596773?auto=format&fit=crop&q=80&w=1000';
           } else if (name.toLowerCase().includes('lottie') || name.toLowerCase().includes('animation')) {
              val = '/animations/glurtr-anmation.json';
           } else if (c.type === 'boolean' || c.type === 'checkbox') {
              val = (name.startsWith('show') || name.startsWith('is')) ? true : false;
           } else if (c.type === 'number') {
              val = 1;
           } else if (c.type === 'pillars-editor') {
              val = [
                { icon: 'Heart', title: 'Amor Misericordioso', description: 'Nossa missão principal.', iconColor: 'primary' },
                { icon: 'Users', title: 'Comunidade', description: 'Vida em fraternidade.', iconColor: 'secondary' },
                { icon: 'Sun', title: 'Esperança', description: 'Transformando vidas.', iconColor: 'accent' }
              ];
           } else if (c.type === 'testimonials-editor') {
              val = [
                { id: 1, name: 'Exemplo da Silva', role: 'Membro', comment: 'Este é um depoimento de exemplo para o preview.', avatar: 'https://randomuser.me/api/portraits/men/1.jpg', date: 'Dez 2024' }
              ];
           } else if (c.type === 'formation-stages-editor') {
              val = [
                { title: 'Etapa 1', description: 'Descrição da primeira etapa.', lottieUrl: '/animations/glurtr-anmation.json' },
                { title: 'Etapa 2', description: 'Descrição da segunda etapa.', lottieUrl: '/animations/glurtr-anmation.json' }
              ];
           } else if (c.type === 'actions-grid-editor') {
              val = [
                { title: 'Ação 1', description: 'Descrição da ação.', imageUrl: 'https://images.unsplash.com/photo-1541913057-0bc87e596773?w=500' },
                { title: 'Ação 2', description: 'Descrição da ação.', imageUrl: 'https://images.unsplash.com/photo-1541913057-0bc87e596773?w=500' }
              ];
           } else if (c.type === 'sections-editor') {
              val = [
                { icon: 'Heart', title: 'Nossa História', content: 'Fundada com amor e devoção.', iconColor: 'primary' },
                { icon: 'Users', title: 'Comunidade', content: 'Um lar para todos.', iconColor: 'secondary' }
              ];
           } else if (name.toLowerCase().includes('url') && (name.toLowerCase().includes('insta') || name.toLowerCase().includes('face') || name.toLowerCase().includes('social'))) {
              val = 'https://instagram.com/recantodoamormisericordioso';
           } else if (c.type === 'list' || c.type.includes('editor')) {
              val = [];
           } else {
              val = '';
           }
        }
        
        props[name] = val;
     });
     
     // Special defaults for common keys if still empty
     if (!props.title) props.title = "Título de Exemplo";
     if (!props.subtitle && props.subtitle !== undefined) props.subtitle = "Adicione um texto descritivo aqui para preencher o espaço.";
     
     return props;
  }, [previewConfig]);

  return (
    <div className="w-full min-w-[320px] bg-base-200 p-4 overflow-y-auto flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Biblioteca de Blocos</h2>
        <p className="text-sm text-base-content/60">
          Clique {disableDrag ? 'para selecionar' : 'ou arraste para adicionar'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <Search className="w-4 h-4" />
          Pesquisar Blocos
        </label>
        <input
          type="text"
          placeholder="Digite para buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered input-sm w-full"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-base-content/60 hover:text-base-content mt-1 underline"
          >
            Limpar busca
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filtrar por Categoria
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="select select-bordered select-sm w-full"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {categoryLabels[cat] || cat}
            </option>
          ))}
        </select>
      </div>

      {/* Mods Count */}
      <div className="text-xs text-base-content/50 mb-3">
        {filteredMods.length} {filteredMods.length === 1 ? 'bloco' : 'blocos'}
      </div>

      {/* Mods List */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {filteredMods.length === 0 ? (
          <div className="card bg-base-100">
            <div className="card-body p-8 text-center">
              <p className="text-sm text-base-content/60">
                {searchQuery
                  ? `Nenhum bloco encontrado para "${searchQuery}"`
                  : 'Nenhum bloco nesta categoria'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn btn-sm btn-ghost mt-2"
                >
                  Limpar busca
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredMods.map(([modId, modConfig]) => (
            <DraggableModItem
              key={modId}
              modId={modId}
              modConfig={modConfig}
              onAddMod={onAddMod}
              onPreview={handlePreview}
              disableDrag={disableDrag}
            />
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewModId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="relative w-full max-w-6xl h-[90vh] bg-base-100 rounded-xl shadow-2xl overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-base-200 bg-base-100">
                 <div>
                    <h3 className="font-bold text-lg">{previewConfig?.name}</h3>
                    <p className="text-sm opacity-60">Visualização (Preview)</p>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => onAddMod(previewModId)} className="btn btn-primary btn-sm gap-2">
                       <Plus className="w-4 h-4" /> Adicionar
                    </button>
                    <button onClick={closePreview} className="btn btn-circle btn-sm btn-ghost">
                       <X className="w-5 h-5" />
                    </button>
                 </div>
              </div>
              
              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto bg-base-200/50 p-4 md:p-12 flex items-start justify-center">
                 <div className="w-full bg-base-100 shadow-2xl rounded-lg min-h-[400px] overflow-hidden">
                    {/* Render Component */}
                    {PreviewComponent ? (
                       <PreviewComponent {...defaultPreviewProps} />
                    ) : (
                       <div className="p-20 text-center flex flex-col items-center justify-center gap-4 h-full">
                          <span className="loading loading-spinner loading-lg text-primary"></span>
                          <p className="opacity-60 font-medium">Renderizando bloco...</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>
           
           {/* Close overlay click */}
           <div className="absolute inset-0 -z-10" onClick={closePreview} />
        </div>
      )}
    </div>
  );
}
