'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { contentPageService } from '@/services/firebase';
import type { CMSPage } from '@/types/cms-types';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Home,
  GripVertical,
  Menu as MenuIcon,
  Star,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  closestCorners
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as LucideIcons from 'lucide-react';
import { PageMenuConfig } from '@/components/cms-editor/PageMenuConfig';
import { ConfirmModal, PromptModal, AlertModal } from '@/components/ui/modals';

export default function CMSPagesListPage() {
  const router = useRouter();
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [expandedContainers, setExpandedContainers] = useState<Set<string>>(new Set());

  // Modals state
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'info' as 'success' | 'error' | 'warning' | 'info' });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const allPages = await contentPageService.getAll();

      // Garantir que a home page sempre tenha menu_order = 0
      const homePage = allPages.find(p => p.slug === '/');
      if (homePage && homePage.menu_order !== 0) {
        await contentPageService.update(homePage.id!, { menu_order: 0 });
        homePage.menu_order = 0;
      }

      // Ordenar por menu_order
      const sorted = allPages.sort((a, b) => {
        const orderA = a.menu_order ?? 999;
        const orderB = b.menu_order ?? 999;
        return orderA - orderB;
      });

      setPages(sorted);
    } catch (err) {
      console.error('Error loading pages:', err);
      setError('Erro ao carregar páginas');
    } finally {
      setLoading(false);
    }
  };

  const createMenuContainer = async (title: string) => {
    try {
      const maxOrder = Math.max(...pages.map(p => p.menu_order ?? -1), -1);
      await contentPageService.create({
        title,
        slug: `#${title.toLowerCase().replace(/\s+/g, '-')}`,
        description: 'Container de menu',
        blocks: [],
        is_published: true,
        show_in_menu: true,
        menu_order: maxOrder + 1,
        is_menu_container: true,
        theme_light: 'recanto-light',
        theme_dark: 'recanto-dark',
        bg_color: 'base-100',
        created_at: new Date().toISOString(),
      });
      await loadPages();
      setAlertConfig({
        title: 'Container criado!',
        message: `Container "${title}" foi criado com sucesso.`,
        type: 'success'
      });
      setShowAlert(true);
    } catch (err) {
      console.error('Error creating container:', err);
      setAlertConfig({
        title: 'Erro ao criar container',
        message: 'Não foi possível criar o container. Tente novamente.',
        type: 'error'
      });
      setShowAlert(true);
    }
  };

  const createChildPage = async (parentId: string) => {
    try {
      // Criar nova página filha
      const timestamp = Date.now();
      const newSlug = `pagina-${timestamp}`;

      // Contar páginas filhas existentes para definir a ordem
      const siblings = pages.filter(p => p.menu_parent_id === parentId);
      const maxOrder = siblings.length > 0 ? Math.max(...siblings.map(p => p.menu_order ?? 0)) : -1;

      const newPage = await contentPageService.create({
        title: 'Nova Página',
        slug: newSlug,
        description: 'Descrição da nova página',
        blocks: [],
        is_published: false,
        show_in_menu: true,
        menu_parent_id: parentId,
        menu_order: maxOrder + 1,
        theme_light: 'recanto-light',
        theme_dark: 'recanto-dark',
        bg_color: 'base-100',
        created_at: new Date().toISOString(),
      });

      await loadPages();

      // Redirecionar para editar a nova página
      router.push(`/app/dashboard/cms/${newPage.id}/edit`);
    } catch (err) {
      console.error('Error creating child page:', err);
      setAlertConfig({
        title: 'Erro ao criar página',
        message: 'Não foi possível criar a página filha. Tente novamente.',
        type: 'error'
      });
      setShowAlert(true);
    }
  };


  const handleDeleteClick = (pageId: string, pageTitle: string) => {
    setDeleteTarget({ id: pageId, title: pageTitle });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      // Remover menu_parent_id dos filhos
      const children = pages.filter(p => p.menu_parent_id === deleteTarget.id);
      await Promise.all(
        children.map(child =>
          contentPageService.update(child.id!, { menu_parent_id: null })
        )
      );

      await contentPageService.delete(deleteTarget.id);
      await loadPages();
      setAlertConfig({
        title: 'Página excluída!',
        message: `"${deleteTarget.title}" foi excluída com sucesso.`,
        type: 'success'
      });
      setShowAlert(true);
    } catch (err) {
      console.error('Error deleting page:', err);
      setAlertConfig({
        title: 'Erro ao excluir',
        message: 'Não foi possível excluir a página. Tente novamente.',
        type: 'error'
      });
      setShowAlert(true);
    }
  };

  const handleTogglePublish = async (page: CMSPage) => {
    try {
      await contentPageService.update(page.id!, {
        is_published: !page.is_published
      });
      setPages(pages.map(p =>
        p.id === page.id ? { ...p, is_published: !p.is_published } : p
      ));
    } catch (err) {
      console.error('Error toggling publish status:', err);
      alert('Erro ao alterar status de publicação');
    }
  };

  const handleToggleMenu = async (page: CMSPage) => {
    try {
      const newShowInMenu = !page.show_in_menu;
      const updates: Partial<CMSPage> = {
        show_in_menu: newShowInMenu
      };

      // Se está ativando no menu, define ordem automática
      if (newShowInMenu && page.menu_order === undefined) {
        const maxOrder = Math.max(...pages.map(p => p.menu_order ?? -1), -1);
        updates.menu_order = maxOrder + 1;
      }

      await contentPageService.update(page.id!, updates);
      setPages(pages.map(p =>
        p.id === page.id ? { ...p, ...updates } : p
      ));
    } catch (err) {
      console.error('Error toggling menu:', err);
      alert('Erro ao alterar menu');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over?.id as string | null);
  };


  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activePage = pages.find(p => p.id === activeId);
    const overPage = pages.find(p => p.id === overId);

    if (!activePage || !overPage) return;

    // Não permitir mover a home page
    if (activePage.slug === '/') {
      setAlertConfig({
        title: 'Ação não permitida',
        message: 'A página inicial não pode ser reordenada.',
        type: 'warning'
      });
      setShowAlert(true);
      return;
    }

    // Detectar se a página ativa é filha de um container
    const isActiveChildOfContainer = !!activePage.menu_parent_id;
    const isOverChildOfContainer = !!overPage.menu_parent_id;

    // CASO 1: Arrastar sobre uma página FILHA de um container
    // Isso significa que quer entrar no mesmo container ou reordenar dentro dele
    if (isOverChildOfContainer) {
      const targetParentId = overPage.menu_parent_id;

      // Se já é filho desse mesmo container, apenas reordenar (não implementado)
      if (activePage.menu_parent_id === targetParentId) {
        return; // Reordenação dentro do mesmo container (não implementado)
      }

      // Tornar filho desse container
      try {
        const siblings = pages.filter(p => p.menu_parent_id === targetParentId);
        await contentPageService.update(activeId, {
          menu_parent_id: targetParentId,
          menu_order: siblings.length // Colocar no final
        });
        loadPages();
      } catch (err) {
        console.error('Error moving to container:', err);
        setAlertConfig({
          title: 'Erro ao mover',
          message: 'Não foi possível mover a página para o container.',
          type: 'error'
        });
        setShowAlert(true);
      }
      return;
    }

    // CASO 2: Arrastar página filha para FORA do container (sobre uma página raiz)
    if (isActiveChildOfContainer && !overPage.menu_parent_id) {
      try {
        // Remover do container, tornando página raiz
        const topLevelCount = pages.filter(p => !p.menu_parent_id).length;
        await contentPageService.update(activeId, {
          menu_parent_id: null,
          menu_order: topLevelCount // Colocar no final das páginas raiz
        });
        loadPages();
      } catch (err) {
        console.error('Error removing from container:', err);
        setAlertConfig({
          title: 'Erro ao remover',
          message: 'Não foi possível remover a página do container.',
          type: 'error'
        });
        setShowAlert(true);
      }
      return;
    }

    // CASO 3: Reordenar no mesmo nível (páginas raiz)
    if (!isActiveChildOfContainer && !overPage.menu_parent_id) {
      const oldIndex = pages.findIndex(p => p.id === activeId);
      const newIndex = pages.findIndex(p => p.id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const newPages = arrayMove(pages, oldIndex, newIndex);

      // Atualizar menu_order
      const updates = newPages.map((page, index) => ({
        id: page.id!,
        menu_order: index
      }));

      setPages(newPages);

      try {
        await Promise.all(
          updates.map(update =>
            contentPageService.update(update.id, { menu_order: update.menu_order })
          )
        );
      } catch (err) {
        console.error('Error updating order:', err);
        setAlertConfig({
          title: 'Erro ao reordenar',
          message: 'Não foi possível salvar a nova ordem das páginas.',
          type: 'error'
        });
        setShowAlert(true);
        loadPages();
      }
    }
  };

  const toggleContainer = (id: string) => {
    const newExpanded = new Set(expandedContainers);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedContainers(newExpanded);
  };

  // Separar páginas em top-level e children
  const topLevelPages = pages.filter(p => !p.menu_parent_id);
  const getChildren = (parentId: string) => pages.filter(p => p.menu_parent_id === parentId);

  const menuPages = pages.filter(p => p.show_in_menu);
  const activePage = pages.find(p => p.id === activeId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Site</h1>
          <p className="text-base-content/60 mt-1">
            Arraste páginas para containers para criar submenus
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPrompt(true)} className="btn btn-outline btn-primary gap-2">
            <Folder className="w-5 h-5" />
            Novo Container
          </button>
          <Link href="/app/dashboard/cms/new" className="btn btn-primary gap-2">
            <Plus className="w-5 h-5" />
            Nova Página
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {/* Info sobre menu */}
      <div className="alert alert-info mb-6">
        <MenuIcon className="w-5 h-5" />
        <div>
          <h3 className="font-semibold">Como criar submenus:</h3>
          <ol className="text-sm list-decimal list-inside">
            <li>Clique em "Novo Container" para criar agrupador (ex: "Institucional")</li>
            <li>Arraste páginas sobre o container para criar subitens</li>
            <li>Configure ícones e descrições em cada subitem</li>
          </ol>
        </div>
      </div>

      {/* Pages List */}
      {pages.length === 0 ? (
        <div className="card bg-base-200">
          <div className="card-body items-center text-center">
            <h2 className="card-title">Nenhuma página criada ainda</h2>
            <p className="text-base-content/60">
              Comece criando sua primeira página CMS
            </p>
            <Link href="/app/dashboard/cms/new" className="btn btn-primary mt-4 gap-2">
              <Plus className="w-5 h-5" />
              Criar Primeira Página
            </Link>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pages.map(p => p.id!)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {topLevelPages.map((page) => {
                const children = getChildren(page.id!);
                const isExpanded = expandedContainers.has(page.id!);
                const isContainer = page.is_menu_container;

                return (
                  <div key={page.id}>
                    <SortablePageRow
                      page={page}
                      onDelete={handleDeleteClick}
                      onTogglePublish={handleTogglePublish}
                      onToggleMenu={handleToggleMenu}
                      onUpdateMenuConfig={async (page, updates) => {
                        await contentPageService.update(page.id!, updates);
                        setPages(pages.map(p => p.id === page.id ? { ...p, ...updates } : p));
                      }}
                      onCreateChildPage={createChildPage}
                      isContainer={isContainer}
                      hasChildren={children.length > 0}
                      isExpanded={isExpanded}
                      onToggleExpand={() => toggleContainer(page.id!)}
                      isOver={overId === page.id}
                    />

                    {/* Children */}
                    {isExpanded && children.length > 0 && (
                      <div className="ml-12 mt-2 space-y-2 border-l-2 border-primary/30 pl-4">
                        {children.map(child => (
                          <SortablePageRow
                            key={child.id}
                            page={child}
                            onDelete={handleDeleteClick}
                            onTogglePublish={handleTogglePublish}
                            onToggleMenu={handleToggleMenu}
                            onUpdateMenuConfig={async (page, updates) => {
                              await contentPageService.update(page.id!, updates);
                              setPages(pages.map(p => p.id === page.id ? { ...p, ...updates } : p));
                            }}
                            onCreateChildPage={createChildPage}
                            isChild
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId && activePage ? (
              <div className="card bg-base-100 shadow-xl opacity-90">
                <div className="card-body p-4">
                  <div className="font-semibold">{activePage.title}</div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Preview do Menu */}
      {menuPages.length > 0 && (
        <div className="mt-8">
          <div className="divider">Preview do Menu</div>
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-sm">Estrutura do menu:</h3>
              <div className="space-y-1">
                {topLevelPages.filter(p => p.show_in_menu).map((page) => {
                  const children = getChildren(page.id!).filter(c => c.show_in_menu);
                  return (
                    <div key={page.id}>
                      <div className="badge badge-lg badge-primary gap-2">
                        {page.is_menu_container && <Folder className="w-4 h-4" />}
                        {page.title}
                      </div>
                      {children.length > 0 && (
                        <div className="ml-8 mt-1 space-y-1">
                          {children.map(child => (
                            <div key={child.id} className="badge badge-sm badge-ghost gap-1">
                              <ChevronRight className="w-3 h-3" />
                              {child.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <PromptModal
        isOpen={showPrompt}
        onClose={() => setShowPrompt(false)}
        onConfirm={createMenuContainer}
        title="Novo Container de Menu"
        message="Digite o nome do container (ex: 'Institucional', 'Missão'):"
        placeholder="Nome do container"
        confirmText="Criar Container"
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Excluir Página?"
        message={`Tem certeza que deseja excluir "${deleteTarget?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        type="danger"
      />

      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
}

interface SortablePageRowProps {
  page: CMSPage;
  onDelete: (pageId: string, pageTitle: string) => void;
  onTogglePublish: (page: CMSPage) => void;
  onToggleMenu: (page: CMSPage) => void;
  onUpdateMenuConfig: (page: CMSPage, updates: Partial<CMSPage>) => Promise<void>;
  onCreateChildPage?: (parentId: string) => void;
  isContainer?: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isChild?: boolean;
  isOver?: boolean;
}

function SortablePageRow({
  page,
  onDelete,
  onTogglePublish,
  onToggleMenu,
  onUpdateMenuConfig,
  onCreateChildPage,
  isContainer,
  hasChildren,
  isExpanded,
  onToggleExpand,
  isChild,
  isOver
}: SortablePageRowProps) {
  const isHome = page.slug === '/';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: page.id!,
    disabled: isHome,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-sortable-id={page.id}
      className={`card bg-base-100 border border-base-300 hover:shadow-lg transition-all ${
        page.show_in_menu ? 'border-primary border-2' : ''
      } ${isOver && isContainer ? 'ring-4 ring-primary ring-opacity-50' : ''}`}
    >
      <div className="card-body p-4">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          {!isHome && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-5 h-5 text-base-content/40" />
            </div>
          )}

          {/* Expand/Collapse (para containers com filhos) */}
          {hasChildren && onToggleExpand && (
            <button onClick={onToggleExpand} className="btn btn-xs btn-ghost">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Ícones de status */}
          <div className="flex items-center gap-2">
            {isHome && <Home className="w-5 h-5 text-primary" />}
            {isContainer && (
              isExpanded ? <FolderOpen className="w-5 h-5 text-warning" /> : <Folder className="w-5 h-5 text-warning" />
            )}
            {page.show_in_menu && !isContainer && <Star className="w-5 h-5 text-warning fill-warning" />}
          </div>

          {/* Informações da página */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-semibold truncate">{page.title}</div>
              {isContainer && (
                <span className="badge badge-warning badge-sm">Container</span>
              )}
              <code className="text-xs bg-base-200 px-2 py-1 rounded">
                {page.slug}
              </code>
            </div>
            {page.description && (
              <div className="text-sm text-base-content/60 truncate">
                {page.description}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2">
            {!isContainer && (
              <span className="badge badge-ghost badge-sm">
                {page.blocks.length} {page.blocks.length === 1 ? 'bloco' : 'blocos'}
              </span>
            )}

            {page.menu_order !== undefined && (
              <span className="badge badge-info badge-sm">
                Ordem: {page.menu_order + 1}
              </span>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            {/* Configurações de Menu */}
            {page.show_in_menu && (
              <PageMenuConfig
                page={page}
                onSave={(updates) => onUpdateMenuConfig(page, updates)}
              />
            )}

            {/* Toggle Menu */}
            <button
              onClick={() => onToggleMenu(page)}
              className={`btn btn-sm btn-ghost gap-1 ${
                page.show_in_menu ? 'text-warning' : ''
              }`}
              title={page.show_in_menu ? 'Remover do menu' : 'Adicionar ao menu'}
            >
              <Star className={`w-4 h-4 ${page.show_in_menu ? 'fill-warning' : ''}`} />
            </button>

            {/* Toggle Publish */}
            {!isContainer && (
              <button
                onClick={() => onTogglePublish(page)}
                className={`btn btn-sm btn-ghost gap-1 ${
                  page.is_published ? 'text-success' : ''
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
            )}

            {/* Adicionar Página Filha (apenas para containers raiz, não para containers filhos) */}
            {isContainer && !isChild && onCreateChildPage && (
              <button
                onClick={() => onCreateChildPage(page.id!)}
                className="btn btn-sm btn-success gap-1"
                title="Adicionar página filha neste container"
              >
                <Plus className="w-4 h-4" />
                Nova Página
              </button>
            )}

            {/* Editar */}
            {!isContainer && (
              <Link
                href={`/app/dashboard/cms/${page.id}/edit`}
                className="btn btn-sm btn-ghost gap-1"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Link>
            )}

            {/* Excluir */}
            {!isHome && (
              <button
                onClick={() => onDelete(page.id!, page.title)}
                className="btn btn-sm btn-ghost text-error gap-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
