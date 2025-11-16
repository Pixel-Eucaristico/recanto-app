'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EvangelizationAction {
  id: number;
  title: string;
  description: string;
  icon: string;
  audience: string;
}

interface EvangelizationActionsEditorProps {
  value: string; // JSON string
  onChange: (value: string) => void;
}

interface SortableActionItemProps {
  action: EvangelizationAction;
  index: number;
  onUpdate: (id: number, field: keyof EvangelizationAction, value: string) => void;
  onDelete: (id: number) => void;
}

const iconOptions = ['BookOpen', 'Users', 'Heart', 'UserPlus', 'Home', 'Sparkles'];

function SortableActionItem({ action, index, onUpdate, onDelete }: SortableActionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="card bg-base-200 shadow mb-3">
      <div className="card-body p-4">
        <div className="flex items-center gap-3 mb-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-base-300 rounded"
          >
            <GripVertical className="w-5 h-5 text-base-content/40" />
          </div>
          <span className="badge badge-neutral">#{index + 1}</span>
          <span className="font-semibold flex-1">{action.title || 'Nova Ação'}</span>
          <button
            onClick={() => onDelete(action.id)}
            className="btn btn-sm btn-ghost btn-circle text-error"
            title="Remover"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Título</span>
            </label>
            <input
              type="text"
              className="input input-bordered input-sm"
              placeholder="Nome da ação..."
              value={action.title}
              onChange={(e) => onUpdate(action.id, 'title', e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Público-alvo</span>
            </label>
            <input
              type="text"
              className="input input-bordered input-sm"
              placeholder="Ex: Jovens de 13 a 25 anos"
              value={action.audience}
              onChange={(e) => onUpdate(action.id, 'audience', e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Ícone</span>
            </label>
            <select
              className="select select-bordered select-sm"
              value={action.icon}
              onChange={(e) => onUpdate(action.id, 'icon', e.target.value)}
            >
              {iconOptions.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </div>

          <div className="form-control md:col-span-2">
            <label className="label">
              <span className="label-text">Descrição</span>
            </label>
            <textarea
              className="textarea textarea-bordered textarea-sm"
              rows={2}
              placeholder="Descrição da ação..."
              value={action.description}
              onChange={(e) => onUpdate(action.id, 'description', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EvangelizationActionsEditor({ value, onChange }: EvangelizationActionsEditorProps) {
  const [actions, setActions] = useState<EvangelizationAction[]>(() => {
    try {
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const updateActions = (newActions: EvangelizationAction[]) => {
    setActions(newActions);
    onChange(JSON.stringify(newActions, null, 2));
  };

  const handleAdd = () => {
    const newAction: EvangelizationAction = {
      id: Date.now(),
      title: '',
      description: '',
      icon: 'Sparkles',
      audience: '',
    };
    updateActions([...actions, newAction]);
  };

  const handleUpdate = (id: number, field: keyof EvangelizationAction, newValue: string) => {
    updateActions(actions.map((a) => (a.id === id ? { ...a, [field]: newValue } : a)));
  };

  const handleDelete = (id: number) => {
    updateActions(actions.filter((a) => a.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = actions.findIndex((a) => a.id === active.id);
      const newIndex = actions.findIndex((a) => a.id === over.id);
      updateActions(arrayMove(actions, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-base-content/70">
          {actions.length} {actions.length === 1 ? 'ação' : 'ações'}
        </span>
        <button onClick={handleAdd} className="btn btn-sm btn-primary gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Ação
        </button>
      </div>

      {actions.length === 0 ? (
        <div className="alert alert-info">
          <span>Nenhuma ação adicionada. Clique em "Adicionar Ação" para começar.</span>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={actions.map((a) => a.id)} strategy={verticalListSortingStrategy}>
            {actions.map((action, index) => (
              <SortableActionItem
                key={action.id}
                action={action}
                index={index}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
