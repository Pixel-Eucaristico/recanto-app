'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { contentPageService } from '@/services/firebase';
import { availableMods } from '@/components/mods';
import ModsLibrary from '@/components/cms-editor/ModsLibrary';
import BlockEditor from '@/components/cms-editor/BlockEditor';
import { FontFamilyPicker } from '@/components/cms-editor/FontFamilyPicker';
import { BgColorPicker } from '@/components/cms-editor/BgColorPicker';
import type { CMSPage, CMSBlock } from '@/types/cms-types';
import { ArrowLeft, Save, Eye, EyeOff, Edit, X, ArrowDown, Plus, Trash2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import DynamicModForm from '@/components/cms-editor/DynamicModForm';
import {
  DndContext,
  closestCenter,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
  CollisionDetection
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';

// Custom collision detection strategy
const customCollisionDetection: CollisionDetection = (args) => {
  // First, look for pointerWithin (precise hit test)
  const pointerCollisions = pointerWithin(args);
  
  if (pointerCollisions.length > 0) {
    // If we have collisions, prefer distinct "drop:" zones (nested) over generic blocks
    const nestedDrop = pointerCollisions.find(c => String(c.id).startsWith('drop:'));
    if (nestedDrop) return [nestedDrop];
    
    // Otherwise return all pointer collisions (DndContext usually picks the first one)
    return pointerCollisions;
  }
  
  // Fallback to rectIntersection if no pointer collision (e.g. fast movement or gaps)
  return rectIntersection(args);
};

interface PageEditorProps {
  params: Promise<{
    pageId: string;
  }>;
}

interface DroppableBlocksAreaProps {
  blocks: CMSBlock[];
  children: React.ReactNode;
}

function DroppableBlocksArea({ blocks, children }: DroppableBlocksAreaProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'blocks-area',
    data: {
      accepts: ['mod'], // Só aceita mods da biblioteca
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-2 md:space-y-4 min-h-[200px] p-1.5 md:p-4 rounded-lg border-2 transition-colors ${
        isOver
          ? 'bg-primary/10 border-primary border-dashed'
          : 'border-base-300 border-dashed'
      }`}
    >
      {children}
    </div>
  );
}

export default function CMSPageEditor({ params }: PageEditorProps) {
  const { pageId } = use(params);
  const router = useRouter();
  const [page, setPage] = useState<CMSPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [urlType, setUrlType] = useState<'home' | 'custom'>('home');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const selectedBlock = page?.blocks.find(b => b.id === selectedBlockId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const startResizing = React.useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        setSidebarWidth((currentWidth) => {
           const newWidth = mouseMoveEvent.clientX;
           if (newWidth < 320) return 320; 
           if (newWidth > 600) return 600; 
           return newWidth;
        });
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing, isResizing]);

  const toggleCollapse = () => {
     setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    if (selectedBlockId && typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileDrawerOpen(true);
    }
  }, [selectedBlockId]);

  useEffect(() => {
    loadPage();
  }, [pageId]);

  const loadPage = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedPage = await contentPageService.get(pageId);

      // Inicializar urlType baseado no slug
      const isExternal = loadedPage?.slug?.startsWith('http') || false;
      setUrlType(isExternal ? 'custom' : 'home');

      // Remover "/" do início para exibição no input (será adicionado ao salvar)
      if (loadedPage && !isExternal && loadedPage.slug?.startsWith('/')) {
        loadedPage.slug = loadedPage.slug.substring(1);
      }

      setPage(loadedPage);
    } catch (err) {
      console.error('Error loading page:', err);
      setError('Erro ao carregar página');
    } finally {
      setLoading(false);
    }
  };

  const handleSlugChange = (value: string) => {
    if (!page) return;

    // Se for URL externa (começa com http), não formatar
    if (value.startsWith('http')) {
      setPage({ ...page, slug: value });
      return;
    }

    // Auto-format slug interno: remove spaces, convert to lowercase, replace special chars
    let formattedSlug = value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-\/]/g, '')
      .replace(/^\/+/, ''); // Remove barras do início (usuário não precisa digitá-las)

    setPage({ ...page, slug: formattedSlug });
  };

  const handleSave = async () => {
    if (!page) return;

    // Preparar slug final baseado no tipo selecionado
    let finalSlug = page.slug;
    if (urlType === 'home') {
      // Página interna: adicionar "/" se não tiver
      if (!finalSlug.startsWith('/')) {
        finalSlug = `/${finalSlug}`;
      }
    }

    // BLOQUEAR salvamento de páginas em rotas protegidas
    if (finalSlug.startsWith('/app')) {
      alert('Não é permitido criar páginas CMS em /app/* - essa área é reservada para o dashboard');
      return;
    }

    try {
      setSaving(true);
      // Função para limpar undefined recursivamente
      const cleanUndefined = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(cleanUndefined);
        }
        if (obj !== null && typeof obj === 'object') {
          const cleaned: any = {};
          Object.keys(obj).forEach(key => {
            if (obj[key] !== undefined) {
              cleaned[key] = cleanUndefined(obj[key]);
            }
          });
          return cleaned;
        }
        return obj;
      };

      // Preparar dados removendo campos undefined
      const updateData: any = {
        title: page.title,
        slug: finalSlug, // Usar slug final com "/" se for página interna
        blocks: cleanUndefined(page.blocks), // Limpar undefined dos blocos
        is_published: page.is_published,
      };

      // Adicionar campos opcionais apenas se tiverem valor definido
      if (page.description !== undefined && page.description !== null) {
        updateData.description = page.description;
      }
      if (page.font_family !== undefined && page.font_family !== null) {
        updateData.font_family = page.font_family;
      }
      if (page.bg_color !== undefined && page.bg_color !== null) {
        updateData.bg_color = page.bg_color;
      }

      await contentPageService.update(page.id!, updateData);
      alert('Página salva com sucesso!');
    } catch (err) {
      console.error('Error saving page:', err);
      alert('Erro ao salvar página');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMod = (modId: string, insertIndex?: number) => {
    if (!page) return;

    const modConfig = availableMods[modId];
    if (!modConfig) return;

    // Create default props based on mod config
    const defaultProps: Record<string, any> = {};
    // Usar 'props' ou 'fields' (compatibilidade com diferentes formatos)
    const propConfigs = modConfig.props || modConfig.fields || [];
    propConfigs.forEach((propConfig) => {
      const propName = propConfig.name || propConfig.key || '';
      const propDefault = propConfig.default ?? propConfig.defaultValue ?? '';
      if (propName) {
        defaultProps[propName] = propDefault;
      }
    });

    const newBlock: CMSBlock = {
      id: `block-${modId}-${Date.now()}`,
      modId,
      props: defaultProps,
      order: insertIndex !== undefined ? insertIndex : page.blocks.length
    };

    // Insert at specific position or at the end
    let newBlocks: CMSBlock[];
    if (insertIndex !== undefined && insertIndex < page.blocks.length) {
      newBlocks = [
        ...page.blocks.slice(0, insertIndex),
        newBlock,
        ...page.blocks.slice(insertIndex)
      ];
    } else {
      newBlocks = [...page.blocks, newBlock];
    }

    // Update order property
    newBlocks.forEach((block, i) => {
      block.order = i;
    });

    setPage({
      ...page,
      blocks: newBlocks
    });
  };

  const handleUpdateBlock = (index: number, updatedBlock: CMSBlock) => {
    if (!page) return;

    const newBlocks = [...page.blocks];
    newBlocks[index] = updatedBlock;
    setPage({ ...page, blocks: newBlocks });
  };

  const handleDeleteBlock = (index: number) => {
    if (!page) return;
    if (!confirm('Tem certeza que deseja remover este bloco?')) return;

    const newBlocks = page.blocks.filter((_, i) => i !== index);
    // Update order
    newBlocks.forEach((block, i) => {
      block.order = i;
    });
    setPage({ ...page, blocks: newBlocks });
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (!page) return;

    const newBlocks = [...page.blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    // Swap blocks
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];

    // Update order
    newBlocks.forEach((block, i) => {
      block.order = i;
    });

    setPage({ ...page, blocks: newBlocks });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? (over.id as string) : null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Clear drag states
    setActiveId(null);
    setOverId(null);

    // VALIDAÇÃO RIGOROSA: Verificar se over existe
    if (!over) {
      console.log('❌ Drop cancelado: nenhuma área detectada (over=null)');
      return;
    }

    if (!page) {
      console.log('❌ Drop cancelado: página não carregada');
      return;
    }

    // Log detalhado para debug
    console.log('🔍 Drop detectado:', {
      activeId: active.id,
      activeType: active.data.current?.type,
      overId: over.id,
      overType: typeof over.id
    });

    // Check for nested drops (handled by child components)
    if (String(over.id).startsWith('drop:')) {
       console.log('✅ Drop delegada para componente filho:', over.id);
       return;
    }

    // VALIDAÇÃO RIGOROSA: Apenas arrastar MOD da biblioteca
    if (active.data.current?.type === 'mod') {
      const modId = active.data.current.modId;

      // Verificar se o over.id é EXATAMENTE 'blocks-area'
      if (over.id === 'blocks-area') {
        console.log('✅ Drop VÁLIDO: dentro da área de blocos (blocks-area)');
        handleAddMod(modId);
        return;
      }

      // Verificar se o over.id é um bloco existente
      const dropIndex = page.blocks.findIndex(b => b.id === over.id);
      if (dropIndex !== -1) {
        console.log(`✅ Drop VÁLIDO: sobre bloco existente (posição ${dropIndex})`);
        handleAddMod(modId, dropIndex);
        return;
      }

      // Se chegou aqui, o drop foi fora da área válida
      console.log('❌ Drop INVÁLIDO: fora da área de blocos', { overId: over.id });
      return;
    }

    // Reordering existing blocks
    if (active.id === over.id) return;

    const oldIndex = page.blocks.findIndex(b => b.id === active.id);
    const newIndex = page.blocks.findIndex(b => b.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    console.log(`✅ Reordenando: ${oldIndex} → ${newIndex}`);
    const newBlocks = arrayMove(page.blocks, oldIndex, newIndex);

    // Update order
    newBlocks.forEach((block, i) => {
      block.order = i;
    });

    setPage({ ...page, blocks: newBlocks });
  };

  const handleTogglePublish = () => {
    if (!page) return;
    setPage({ ...page, is_published: !page.is_published });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="container mx-auto p-6">
        <div className="alert alert-error">
          <span>{error || 'Página não encontrada'}</span>
        </div>
        <Link href="/app/dashboard/cms" className="btn btn-ghost mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className={`flex h-screen overflow-hidden ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
        {/* Sidebar: Mods Library OR Properties Editor */}
        <div 
           className="hidden lg:flex flex-col bg-base-100 border-r border-base-300 h-full overflow-hidden transition-all duration-300 relative group"
           style={{ width: isCollapsed ? 60 : sidebarWidth, minWidth: isCollapsed ? 60 : undefined }}
        >
             {/* Resize Handle (Only when not collapsed) */}
             {!isCollapsed && (
               <div
                  className="absolute right-0 top-0 bottom-0 w-1 bg-transparent hover:bg-primary cursor-col-resize z-50 transition-colors"
                  onMouseDown={startResizing}
               />
             )}

             {isCollapsed ? (
                /* Collapsed State */
                <div className="flex flex-col items-center h-full py-4 gap-4">
                   <button 
                     onClick={toggleCollapse} 
                     className="btn btn-sm btn-ghost btn-square" 
                     title="Expandir sidebar"
                   >
                      <PanelLeftOpen className="w-5 h-5" />
                   </button>
                   <div className="divider my-0 w-8 self-center"></div>
                   <div className="writing-vertical-rl rotate-180 flex items-center gap-2 text-sm font-bold tracking-wider opacity-50 whitespace-nowrap pt-4">
                      {selectedBlock ? 'EDITANDO BLOCO' : 'BIBLIOTECA'}
                   </div>
                </div>
             ) : (
                /* Expanded State */
                <>
                  {selectedBlock && availableMods[selectedBlock.modId] ? (
                    <div className="flex flex-col h-full animate-slide-in-right">
                      {/* Sidebar Header */}
                      <div className="p-4 border-b border-base-300 flex items-center justify-between bg-base-100/90 backdrop-blur z-10">
                          <div>
                            <h2 className="font-bold text-lg leading-tight">Editar Bloco</h2>
                            <p className="text-xs text-base-content/60 truncate max-w-[150px]">{availableMods[selectedBlock.modId].name}</p>
                          </div>
                          <div className="flex items-center gap-1">
                             <button 
                               onClick={() => setSelectedBlockId(null)}
                               className="btn btn-sm btn-ghost btn-circle"
                               title="Voltar para biblioteca"
                             >
                               <X className="w-5 h-5" />
                             </button>
                             <button 
                               onClick={toggleCollapse}
                               className="btn btn-sm btn-ghost btn-circle"
                               title="Recolher sidebar"
                             >
                                <PanelLeftClose className="w-5 h-5" />
                             </button>
                          </div>
                      </div>
                      
                      {/* Sidebar Content (Scrollable) */}
                      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100">
                          <DynamicModForm
                            modId={selectedBlock.modId}
                            propConfigs={availableMods[selectedBlock.modId].props || availableMods[selectedBlock.modId].fields || []}
                            values={selectedBlock.props}
                            onChange={(newProps) => {
                              const index = page!.blocks.findIndex(b => b.id === selectedBlock.id);
                              if (index !== -1) {
                                handleUpdateBlock(index, { ...selectedBlock, props: newProps });
                              }
                            }}
                            blockId={selectedBlock.id}
                          />
                      </div>
                      
                      {/* Delete Button Footer */}
                      <div className="p-4 border-t border-base-300 bg-base-100">
                          <button 
                            onClick={() => {
                              const index = page!.blocks.findIndex(b => b.id === selectedBlock.id);
                              handleDeleteBlock(index);
                              setSelectedBlockId(null);
                            }}
                            className="btn btn-outline btn-error btn-sm w-full gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir Bloco
                          </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                       {/* Library Header */}
                        <div className="p-4 border-b border-base-300 flex items-center justify-between">
                            <h2 className="font-bold text-lg">Biblioteca</h2>
                            <button 
                               onClick={toggleCollapse}
                               className="btn btn-sm btn-ghost btn-circle"
                               title="Recolher sidebar"
                             >
                                <PanelLeftClose className="w-5 h-5" />
                             </button>
                        </div>
                        {/* Library Content */}
                        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100">
                           <ModsLibrary onAddMod={handleAddMod} />
                        </div>
                    </div>
                  )}
                </>
             )}
        </div>


        {/* Main Editor Area */}
        <div className="flex-1 overflow-y-auto relative">
          <div className="w-full p-1.5 md:p-6 pb-20 md:pb-6">
          {/* Header */}
          <div className="sticky top-0 bg-base-100 z-10 pb-1.5 md:pb-4 mb-2 md:mb-6 border-b border-base-300">
            <div className="flex items-center justify-between mb-1.5 md:mb-4">
              <Link href="/app/dashboard/cms" className="btn btn-ghost btn-sm gap-1 md:gap-2 min-h-[44px]">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Link>

              <div className="flex items-center gap-1 md:gap-2">
                {/* Publish Toggle */}
                <button
                  onClick={handleTogglePublish}
                  className={`btn btn-sm gap-1 md:gap-2 min-h-[44px] ${
                    page.is_published ? 'btn-success' : 'btn-ghost'
                  }`}
                >
                  {page.is_published ? (
                    <>
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Publicada</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span className="hidden sm:inline">Rascunho</span>
                    </>
                  )}
                </button>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  className="btn btn-primary btn-sm md:btn-md gap-1 md:gap-2 min-h-[44px]"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      <span className="hidden sm:inline">Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span className="hidden sm:inline">Salvar Alterações</span>
                      <span className="sm:hidden">Salvar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Page Info - Compact */}
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body p-1.5 md:p-3">
                <div className="flex items-start justify-between gap-2 md:gap-3">
                  {/* Info Display - Compact */}
                  {!isEditingInfo ? (
                    <div className="flex-1 min-w-0">
                      <h1 className="text-lg font-bold truncate">{page.title}</h1>
                      <div className="flex items-center gap-3 mt-1 text-xs text-base-content/60">
                        <span className="flex items-center gap-1">
                          <strong>URL:</strong>
                          <code className="bg-base-200 px-1 rounded">{page.slug}</code>
                          {page.slug === '/' && (
                            <span className="badge badge-info badge-xs ml-1">Home</span>
                          )}
                        </span>
                        {page.description && (
                          <span className="truncate">• {page.description}</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Edit Mode - Full Inputs */
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="text-xs font-medium">Título</label>
                        <input
                          type="text"
                          value={page.title}
                          onChange={(e) => setPage({ ...page, title: e.target.value })}
                          className="input input-bordered input-sm w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Descrição</label>
                        <input
                          type="text"
                          value={page.description || ''}
                          onChange={(e) => setPage({ ...page, description: e.target.value })}
                          className="input input-bordered input-sm w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">URL</label>
                        <div className="join w-full">
                          <select
                            className="select select-bordered select-sm join-item w-20"
                            value={urlType}
                            onChange={(e) => {
                              setUrlType(e.target.value as 'home' | 'custom');
                            }}
                          >
                            <option value="home">/</option>
                            <option value="custom">URL</option>
                          </select>
                          <input
                            type="text"
                            placeholder={urlType === 'home' ? 'sobre-nos' : 'https://exemplo.com'}
                            value={page.slug}
                            onChange={(e) => handleSlugChange(e.target.value)}
                            className="input input-bordered input-sm join-item flex-1"
                          />
                        </div>
                        <label className="label">
                          <span className="label-text-alt text-base-content/60">
                            {urlType === 'home'
                              ? '✓ A barra "/" será adicionada automaticamente. Digite apenas: sobre, contatos, etc.'
                              : 'URL externa completa: "https://exemplo.com"'
                            }
                          </span>
                        </label>
                      </div>

                      {/* Fonte da Página */}
                      <div>
                        <label className="text-xs font-medium">Fonte da Página (Google Fonts)</label>
                        <FontFamilyPicker
                          value={page.font_family || 'Inter'}
                          onChange={(value) => setPage({ ...page, font_family: value })}
                        />
                      </div>

                      {/* Cor de Fundo */}
                      <div>
                        <label className="text-xs font-medium">Cor de Fundo (DaisyUI)</label>
                        <BgColorPicker
                          value={page.bg_color || 'base-100'}
                          onChange={(value) => setPage({ ...page, bg_color: value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Edit Button */}
                  <button
                    onClick={() => setIsEditingInfo(!isEditingInfo)}
                    className={`btn btn-sm btn-circle ${isEditingInfo ? 'btn-ghost' : 'btn-ghost'}`}
                    title={isEditingInfo ? 'Cancelar' : 'Editar informações'}
                  >
                    {isEditingInfo ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <Edit className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Blocks List */}
          <DroppableBlocksArea blocks={page.blocks}>
              {page.blocks.length === 0 ? (
                <div className="card bg-base-200">
                  <div className="card-body items-center text-center">
                    <h2 className="card-title">Nenhum bloco adicionado</h2>
                    <p className="text-base-content/60">
                      Arraste blocos da biblioteca ou clique para adicionar
                    </p>
                  </div>
                </div>
              ) : (
                <SortableContext
                  items={page.blocks.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {page.blocks.map((block, index) => {
                    // Mostrar indicador de inserção ANTES do bloco se estiver sobre ele
                    const showInsertIndicator =
                      activeId?.startsWith('mod-') &&
                      overId === block.id;

                    return (
                      <div key={block.id}>
                        {/* Indicador de Inserção ANTES do bloco */}
                        {showInsertIndicator && (
                          <div className="relative h-4 mb-2 animate-pulse">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t-2 border-primary"></div>
                            </div>
                            <div className="absolute left-0 top-1/2 -translate-y-1/2">
                              <div className="bg-primary text-primary-content px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                                <ArrowDown className="w-3 h-3" />
                                Inserir aqui
                              </div>
                            </div>
                          </div>
                        )}

                        <BlockEditor
                          block={block}
                          index={index}
                          totalBlocks={page.blocks.length}
                          onUpdate={(updatedBlock) => handleUpdateBlock(index, updatedBlock)}
                          onDelete={() => handleDeleteBlock(index)}
                          onMoveUp={() => handleMoveBlock(index, 'up')}
                          onMoveDown={() => handleMoveBlock(index, 'down')}
                          isSelected={selectedBlockId === block.id}
                          onSelect={() => setSelectedBlockId(block.id)}
                        />
                      </div>
                    );
                  })}

                  {/* Indicador ao FINAL da lista se estiver sobre blocks-area */}
                  {activeId?.startsWith('mod-') && overId === 'blocks-area' && (
                    <div className="relative h-4 mt-2 animate-pulse">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-primary"></div>
                      </div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2">
                        <div className="bg-primary text-primary-content px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                          <Plus className="w-3 h-3" />
                          Adicionar ao final
                        </div>
                      </div>
                    </div>
                  )}
                </SortableContext>
              )}
          </DroppableBlocksArea>

          {/* Mobile FAB Button - Fixed at bottom */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden fixed bottom-4 right-4 btn btn-primary btn-circle btn-lg shadow-2xl z-50"
            aria-label="Adicionar bloco"
          >
            <Plus className="w-6 h-6" />
          </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet Modal */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => {
          setMobileDrawerOpen(false);
          setSelectedBlockId(null);
        }}>
          <div
            className="w-full max-w-lg bg-base-100 rounded-t-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-base-300">
              <div className="flex items-center gap-2">
                {selectedBlockId && (
                   <button 
                     onClick={() => setSelectedBlockId(null)}
                     className="btn btn-ghost btn-sm btn-circle"
                     title="Voltar"
                   >
                     <ArrowLeft className="w-5 h-5" />
                   </button>
                )}
                <h2 className="text-lg font-bold">
                   {selectedBlockId ? 'Editar Bloco' : 'Biblioteca de Blocos'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setSelectedBlockId(null);
                }}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedBlock && selectedBlockId ? (
                 <div className="flex flex-col gap-4">
                    <div className="bg-base-200 p-3 rounded-lg text-xs">
                       <p className="font-bold">{availableMods[selectedBlock.modId].name}</p>
                       <p className="opacity-60">{availableMods[selectedBlock.modId].description}</p>
                    </div>
                    
                    <DynamicModForm
                      modId={selectedBlock.modId}
                      propConfigs={availableMods[selectedBlock.modId].props || availableMods[selectedBlock.modId].fields || []}
                      values={selectedBlock.props}
                      onChange={(newProps) => {
                        const index = page!.blocks.findIndex(b => b.id === selectedBlock.id);
                        if (index !== -1) {
                          handleUpdateBlock(index, { ...selectedBlock, props: newProps });
                        }
                      }}
                      blockId={selectedBlock.id}
                    />

                    <div className="divider"></div>

                    <button 
                      onClick={() => {
                        const index = page!.blocks.findIndex(b => b.id === selectedBlock.id);
                        handleDeleteBlock(index);
                        setSelectedBlockId(null);
                      }}
                      className="btn btn-error btn-outline btn-sm w-full gap-2 mb-8"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir Bloco
                    </button>
                 </div>
              ) : (
                <ModsLibrary
                  onAddMod={(modId) => {
                    handleAddMod(modId);
                    // Open form immediately after adding on mobile
                    const lastBlock = page?.blocks[page.blocks.length - 1];
                    // We can't easily wait for state update here, but handleAddMod will trigger it.
                    // Instead, let's just close or keep open.
                    // Actually, if we want to edit immediately:
                    // setSelectedBlockId is better handled inside handleAddMod? No.
                    // For now, let's just let the user click the block in the canvas to edit.
                    setMobileDrawerOpen(false);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Drag Overlay - Visual feedback */}
      <DragOverlay>
        {activeId ? (
          activeId.startsWith('mod-') ? (
            // Dragging a mod from library
            <div className="card bg-primary text-primary-content shadow-xl opacity-90 w-64">
              <div className="card-body p-4">
                <h3 className="font-semibold text-sm">
                  {availableMods[activeId.replace('mod-', '')]?.name || 'Bloco'}
                </h3>
                <p className="text-xs opacity-80">
                  Arraste para a área de blocos
                </p>
              </div>
            </div>
          ) : (
            // Dragging an existing block
            <div className="card bg-base-200 shadow-xl opacity-90 border-2 border-primary w-96">
              <div className="card-body p-4">
                <h3 className="font-semibold">Movendo bloco...</h3>
              </div>
            </div>
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
