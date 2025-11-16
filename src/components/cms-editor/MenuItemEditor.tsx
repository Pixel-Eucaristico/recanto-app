'use client';

import { useState } from 'react';
import { MenuItem } from '@/types/cms-types';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  GripVertical,
  Edit,
  Check,
  X
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as LucideIcons from 'lucide-react';

interface MenuItemEditorProps {
  item: MenuItem;
  onUpdate: (itemId: string, updates: Partial<MenuItem>) => void;
  onDelete: (itemId: string) => void;
  onAddSubItem: (parentId: string) => void;
  level?: number;
}

export function MenuItemEditor({
  item,
  onUpdate,
  onDelete,
  onAddSubItem,
  level = 0,
}: MenuItemEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState({ ...item });

  // Drag and drop (apenas para nível 0)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: item.id,
    disabled: level > 0, // Desabilitar drag em subitens
  });

  const style = level === 0 ? {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  } : {};

  const hasSubItems = item.items && item.items.length > 0;

  const handleSave = () => {
    onUpdate(item.id, editedItem);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedItem({ ...item });
    setIsEditing(false);
  };

  // Lista de ícones Lucide disponíveis
  const availableIcons = [
    'Sunset', 'Crown', 'Trees', 'Book', 'Zap', 'Heart', 'Home',
    'Users', 'Calendar', 'Mail', 'Phone', 'Gift', 'Star', 'Settings'
  ];

  // Renderizar ícone dinamicamente
  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`border border-base-300 rounded-lg bg-base-100 ${
          level > 0 ? 'ml-8 mt-2' : ''
        }`}
      >
        {/* Cabeçalho do Item */}
        <div className="flex items-center gap-2 p-4">
          {/* Drag Handle (apenas nível 0) */}
          {level === 0 && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-5 h-5 text-base-content/40" />
            </div>
          )}

          {/* Ícone */}
          {item.icon && (
            <div className="text-base-content/60">{renderIcon(item.icon)}</div>
          )}

          {/* Título */}
          <div className="flex-1">
            <div className="font-medium text-base-content">{item.title}</div>
            <div className="text-xs text-base-content/60">{item.url}</div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            {hasSubItems && (
              <span className="badge badge-sm badge-info">
                {item.items?.length} subitens
              </span>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="w-4 h-4" />
            </Button>

            {level === 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddSubItem(item.id)}
                title="Adicionar Subitem ao Menu"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}

            {hasSubItems && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Recolher" : "Expandir"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="w-4 h-4 text-error" />
            </Button>
          </div>
        </div>

        {/* Formulário de Edição */}
        {isEditing && (
          <div className="border-t border-base-300 p-4 space-y-4 bg-base-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="label-text">Título</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editedItem.title}
                  onChange={(e) =>
                    setEditedItem({ ...editedItem, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">URL</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editedItem.url}
                  onChange={(e) =>
                    setEditedItem({ ...editedItem, url: e.target.value })
                  }
                />
              </div>
            </div>

            {level > 0 && (
              <div>
                <label className="label">
                  <span className="label-text">Descrição (para submenu)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={editedItem.description || ''}
                  onChange={(e) =>
                    setEditedItem({ ...editedItem, description: e.target.value })
                  }
                  rows={2}
                />
              </div>
            )}

            {level > 0 && (
              <div>
                <label className="label">
                  <span className="label-text">Ícone (Lucide)</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={editedItem.icon || ''}
                  onChange={(e) =>
                    setEditedItem({ ...editedItem, icon: e.target.value })
                  }
                >
                  <option value="">Sem ícone</option>
                  {availableIcons.map((iconName) => (
                    <option key={iconName} value={iconName}>
                      {iconName}
                    </option>
                  ))}
                </select>
                {editedItem.icon && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-base-content/60">
                    Preview: {renderIcon(editedItem.icon)} {editedItem.icon}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Check className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        )}

        {/* Subitens */}
        {isExpanded && hasSubItems && (
          <div className="border-t border-base-300 p-4 space-y-2">
            {item.items!.map((subItem) => (
              <MenuItemEditor
                key={subItem.id}
                item={subItem}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAddSubItem={onAddSubItem}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
