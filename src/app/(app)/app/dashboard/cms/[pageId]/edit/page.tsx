'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { contentPageService } from '@/services/firebase';
import { availableMods } from '@/components/mods';
import ModsLibrary from '@/components/cms-editor/ModsLibrary';
import BlockEditor from '@/components/cms-editor/BlockEditor';
import { FontFamilyPicker } from '@/components/cms-editor/FontFamilyPicker';
import { BgColorPicker } from '@/components/cms-editor/BgColorPicker';
import type { CMSPage, CMSBlock } from '@/types/cms-types';
import { ArrowLeft, Save, Eye, EyeOff, Edit, X, ArrowDown, Plus } from 'lucide-react';
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
  DragStartEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';

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
      className={`space-y-4 min-h-[200px] p-4 rounded-lg border-2 transition-colors ${
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadPage();
  }, [pageId]);

  const loadPage = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedPage = await contentPageService.get(pageId);
      setPage(loadedPage);
    } catch (err) {
      console.error('Error loading page:', err);
      setError('Erro ao carregar página');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!page) return;

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
        slug: page.slug,
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
    modConfig.props.forEach((propConfig) => {
      defaultProps[propConfig.name] = propConfig.default ?? '';
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
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-screen overflow-hidden">
        {/* Mods Library Sidebar */}
        <ModsLibrary onAddMod={handleAddMod} />

        {/* Main Editor Area */}
        <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-5xl">
          {/* Header */}
          <div className="sticky top-0 bg-base-100 z-10 pb-4 mb-6 border-b border-base-300">
            <div className="flex items-center justify-between mb-4">
              <Link href="/app/dashboard/cms" className="btn btn-ghost btn-sm gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>

              <div className="flex items-center gap-2">
                {/* Publish Toggle */}
                <button
                  onClick={handleTogglePublish}
                  className={`btn btn-sm gap-2 ${
                    page.is_published ? 'btn-success' : 'btn-ghost'
                  }`}
                >
                  {page.is_published ? (
                    <>
                      <Eye className="w-4 h-4" />
                      Publicada
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Rascunho
                    </>
                  )}
                </button>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  className="btn btn-primary gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Page Info - Compact */}
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body p-3">
                <div className="flex items-start justify-between gap-3">
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
                        <label className="text-xs font-medium">URL (slug)</label>
                        {page.slug === '/' ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={page.slug}
                              disabled
                              className="input input-bordered input-sm flex-1"
                            />
                            <span className="badge badge-info badge-sm">Home</span>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={page.slug}
                            onChange={(e) => setPage({ ...page, slug: e.target.value })}
                            className="input input-bordered input-sm w-full"
                          />
                        )}
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
        </div>
      </div>
      </div>

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
