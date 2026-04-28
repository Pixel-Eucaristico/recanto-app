'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  listLessonComponents,
  getLessonComponent,
} from '@/application/lesson/LessonComponentRegistry';
import type { LessonComponentInstance } from '@/domain/lesson-components/types';

interface Props {
  value: LessonComponentInstance[];
  onChange: (next: LessonComponentInstance[]) => void;
}

function genId(): string {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function LessonComponentsEditor({ value, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const catalog = listLessonComponents();

  function addComponent(kind: string) {
    const plugin = getLessonComponent(kind);
    if (!plugin) return;
    const inst: LessonComponentInstance = {
      id: genId(),
      kind,
      required: plugin.defaultRequired,
      order: value.length,
      config: plugin.defaultConfig,
    };
    onChange([...value, inst]);
    setPickerOpen(false);
    setExpandedId(inst.id);
  }

  function updateInstance(id: string, patch: { config?: any; required?: boolean }) {
    onChange(value.map(c => {
      if (c.id !== id) return c;
      const next = { ...c };
      if (patch.config !== undefined) next.config = { ...(c.config as any), ...patch.config };
      if (patch.required !== undefined) next.required = patch.required;
      return next;
    }));
  }

  function removeInstance(id: string) {
    onChange(value.filter(c => c.id !== id).map((c, i) => ({ ...c, order: i })));
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = value.findIndex(c => c.id === active.id);
    const newIdx = value.findIndex(c => c.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const moved = arrayMove(value, oldIdx, newIdx).map((c, i) => ({ ...c, order: i }));
    onChange(moved);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-base-content/60">
          Plugins de aula — sistema novo (substitui flags <code className="text-[11px]">requires_*</code>).
          Quando definido aqui, sobrepõe o reconciler legado.
        </p>
        <button
          type="button"
          className="btn btn-primary btn-xs gap-1"
          onClick={() => setPickerOpen(true)}
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </button>
      </div>

      {value.length === 0 ? (
        <div className="alert text-xs">
          <span>Nenhum componente — aula segue usando flags antigos. Clique &quot;Adicionar&quot; pra migrar.</span>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={value.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {value.map(inst => (
                <SortableInstance
                  key={inst.id}
                  inst={inst}
                  expanded={expandedId === inst.id}
                  onToggle={() => setExpandedId(prev => prev === inst.id ? null : inst.id)}
                  onChange={patch => updateInstance(inst.id, patch)}
                  onRemove={() => removeInstance(inst.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {pickerOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-base mb-2">Adicionar componente</h3>
            <ul className="space-y-1 max-h-96 overflow-y-auto">
              {catalog.map(p => {
                const Icon = p.icon;
                return (
                  <li key={p.kind}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm w-full justify-start gap-2"
                      onClick={() => addComponent(p.kind)}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1 text-left">{p.label}</span>
                      <span className="text-[10px] text-base-content/50">{p.kind}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="modal-action">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPickerOpen(false)}>Cancelar</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setPickerOpen(false)} />
        </div>
      )}
    </div>
  );
}

interface SortableInstanceProps {
  inst: LessonComponentInstance;
  expanded: boolean;
  onToggle: () => void;
  onChange: (patch: { config?: any; required?: boolean }) => void;
  onRemove: () => void;
}

function SortableInstance({ inst, expanded, onToggle, onChange, onRemove }: SortableInstanceProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: inst.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };

  const plugin = getLessonComponent(inst.kind);
  if (!plugin) {
    return (
      <li ref={setNodeRef} style={style} className="card bg-base-100 border border-error">
        <div className="card-body p-2 flex-row items-center gap-2">
          <span className="text-xs text-error">Plugin &quot;{inst.kind}&quot; não registrado</span>
          <button className="btn btn-ghost btn-xs ml-auto" onClick={onRemove}><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </li>
    );
  }

  const Icon = plugin.icon;
  const Editor = plugin.EditorComponent;
  const summary = plugin.summary(inst.config);

  return (
    <li ref={setNodeRef} style={style} className="card bg-base-100 border border-base-300">
      <div className="card-body p-2 gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-xs cursor-grab"
            {...attributes}
            {...listeners}
            aria-label="Arrastar"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <Icon className="w-4 h-4 text-primary shrink-0" />
          <button
            type="button"
            className="flex-1 min-w-0 text-left"
            onClick={onToggle}
          >
            <p className="text-sm font-semibold truncate">{plugin.label}</p>
            {summary.description && (
              <p className="text-[11px] text-base-content/60 truncate">{summary.description}</p>
            )}
          </button>
          {inst.required && <span className="badge badge-warning badge-xs">obrigatório</span>}
          <button type="button" className="btn btn-ghost btn-xs" onClick={onToggle}>
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <button type="button" className="btn btn-ghost btn-xs text-error" onClick={onRemove}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {expanded && (
          <div className="border-t border-base-300 pt-2">
            <Editor
              config={inst.config as any}
              required={inst.required}
              onChange={patch => onChange(patch as any)}
            />
          </div>
        )}
      </div>
    </li>
  );
}
