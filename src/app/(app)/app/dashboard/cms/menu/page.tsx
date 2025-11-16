'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Save, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { menuConfigService, MenuConfig, MenuItem } from '@/services/firebase';
import { menuNavbar } from '@/_config/routes_main';
import { Button } from '@/components/ui/button';
import SmartLink from '@/components/common/SmartLink';
import { MenuItemEditor } from '@/components/cms-editor/MenuItemEditor';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';

export default function MenuEditorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuConfig, setMenuConfig] = useState<MenuConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Configurar sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const config = await menuConfigService.get();

      if (!config) {
        // Se não existe menu no CMS, criar a partir do routes_main.ts
        const initialConfig = await menuConfigService.initializeFromDefault(menuNavbar);
        setMenuConfig(initialConfig);
      } else {
        setMenuConfig(config);
      }
    } catch (error) {
      console.error('Error loading menu:', error);
      alert('Erro ao carregar menu. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!menuConfig) return;

    try {
      setSaving(true);
      await menuConfigService.save(menuConfig);
      setHasChanges(false);
      alert('Menu salvo com sucesso!');
    } catch (error) {
      console.error('Error saving menu:', error);
      alert('Erro ao salvar menu. Verifique o console.');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (!menuConfig) return;

    try {
      setSaving(true);
      const newPublishStatus = !menuConfig.is_published;

      if (newPublishStatus) {
        await menuConfigService.publish();
      } else {
        await menuConfigService.unpublish();
      }

      setMenuConfig({ ...menuConfig, is_published: newPublishStatus });
      alert(newPublishStatus ? 'Menu publicado!' : 'Menu despublicado!');
    } catch (error) {
      console.error('Error toggling publish:', error);
      alert('Erro ao alterar status de publicação.');
    } finally {
      setSaving(false);
    }
  };

  const addMenuItem = () => {
    if (!menuConfig) return;

    const newItem: MenuItem = {
      id: `menu_item_${Date.now()}`,
      title: 'Novo Item',
      url: '#',
      order: menuConfig.items.length,
    };

    setMenuConfig({
      ...menuConfig,
      items: [...menuConfig.items, newItem],
    });
    setHasChanges(true);
  };

  const updateMenuItem = (itemId: string, updates: Partial<MenuItem>) => {
    if (!menuConfig) return;

    const updateItemRecursive = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, ...updates };
        }
        if (item.items) {
          return { ...item, items: updateItemRecursive(item.items) };
        }
        return item;
      });
    };

    setMenuConfig({
      ...menuConfig,
      items: updateItemRecursive(menuConfig.items),
    });
    setHasChanges(true);
  };

  const deleteMenuItem = (itemId: string) => {
    if (!menuConfig) return;
    if (!confirm('Tem certeza que deseja excluir este item?')) return;

    const deleteItemRecursive = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter(item => item.id !== itemId)
        .map(item => ({
          ...item,
          items: item.items ? deleteItemRecursive(item.items) : undefined,
        }));
    };

    setMenuConfig({
      ...menuConfig,
      items: deleteItemRecursive(menuConfig.items),
    });
    setHasChanges(true);
  };

  const addSubItem = (parentId: string) => {
    if (!menuConfig) return;

    const newSubItem: MenuItem = {
      id: `menu_item_${Date.now()}`,
      title: 'Novo Subitem',
      url: '#',
      description: 'Descrição do subitem',
      order: 0,
    };

    const addSubItemRecursive = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === parentId) {
          const currentItems = item.items || [];
          return {
            ...item,
            items: [...currentItems, { ...newSubItem, order: currentItems.length }],
          };
        }
        if (item.items) {
          return { ...item, items: addSubItemRecursive(item.items) };
        }
        return item;
      });
    };

    setMenuConfig({
      ...menuConfig,
      items: addSubItemRecursive(menuConfig.items),
    });
    setHasChanges(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !menuConfig) return;

    const oldIndex = menuConfig.items.findIndex(item => item.id === active.id);
    const newIndex = menuConfig.items.findIndex(item => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(menuConfig.items, oldIndex, newIndex);

    // Atualizar ordem
    newItems.forEach((item, i) => {
      item.order = i;
    });

    setMenuConfig({ ...menuConfig, items: newItems });
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!menuConfig) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>Erro ao carregar configuração do menu.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <SmartLink href="/app/dashboard/cms">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </SmartLink>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-base-content">Editor de Menu</h1>
            <p className="text-sm text-base-content/60">
              Gerencie os itens do menu de navegação do site
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePublish}
            disabled={saving}
          >
            {menuConfig.is_published ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Publicado
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Rascunho
              </>
            )}
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status */}
      {hasChanges && (
        <div className="alert alert-warning mb-6">
          <span>Você tem alterações não salvas</span>
        </div>
      )}

      {menuConfig.is_published && (
        <div className="alert alert-success mb-6">
          <span>Menu publicado - Alterações aparecerão no site após salvar</span>
        </div>
      )}

      {/* Botão Adicionar Item */}
      <div className="mb-6">
        <Button onClick={addMenuItem} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Item de Menu
        </Button>
      </div>

      {/* Lista de Itens com Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={menuConfig.items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {menuConfig.items.map((item) => (
              <MenuItemEditor
                key={item.id}
                item={item}
                onUpdate={updateMenuItem}
                onDelete={deleteMenuItem}
                onAddSubItem={addSubItem}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {menuConfig.items.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-base-300 rounded-lg">
          <p className="text-base-content/60 mb-4">
            Nenhum item de menu. Clique em &quot;Adicionar Item de Menu&quot; para começar.
          </p>
        </div>
      )}
    </div>
  );
}
