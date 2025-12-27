'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  link?: string;
}

interface ProjectsEditorProps {
  value: string; // JSON string
  onChange: (value: string) => void;
}

interface SortableProjectItemProps {
  project: Project;
  index: number;
  onUpdate: (id: number, field: keyof Project, value: string) => void;
  onDelete: (id: number) => void;
}

const categoryOptions = [
  { value: 'formacao', label: 'Formação' },
  { value: 'evangelizacao', label: 'Evangelização' },
  { value: 'social', label: 'Social' },
  { value: 'retiro', label: 'Retiro' },
  { value: 'outro', label: 'Outro' },
];

function SortableProjectItem({ project, index, onUpdate, onDelete }: SortableProjectItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });

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
          <span className="font-semibold flex-1">{project.title || 'Novo Projeto'}</span>
          <button
            onClick={() => onDelete(project.id)}
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
              placeholder="Nome do projeto..."
              value={project.title}
              onChange={(e) => onUpdate(project.id, 'title', e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Categoria</span>
            </label>
            <select
              className="select select-bordered select-sm"
              value={project.category}
              onChange={(e) => onUpdate(project.id, 'category', e.target.value)}
            >
              {categoryOptions.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
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
              placeholder="Descrição do projeto..."
              value={project.description}
              onChange={(e) => onUpdate(project.id, 'description', e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Imagem (URL)</span>
            </label>
            <input
              type="url"
              className="input input-bordered input-sm"
              placeholder="https://..."
              value={project.image}
              onChange={(e) => onUpdate(project.id, 'image', e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Link (opcional)</span>
            </label>
            <input
              type="text"
              className="input input-bordered input-sm"
              placeholder="/sobre, /projetos, etc..."
              value={project.link || ''}
              onChange={(e) => onUpdate(project.id, 'link', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsEditor({ value, onChange }: ProjectsEditorProps) {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const updateProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    onChange(JSON.stringify(newProjects, null, 2));
  };

  const handleAdd = () => {
    const newProject: Project = {
      id: Date.now(),
      title: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400',
      category: 'formacao',
      link: '',
    };
    updateProjects([...projects, newProject]);
  };

  const handleUpdate = (id: number, field: keyof Project, newValue: string) => {
    updateProjects(projects.map((p) => (p.id === id ? { ...p, [field]: newValue } : p)));
  };

  const handleDelete = (id: number) => {
    updateProjects(projects.filter((p) => p.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);
      updateProjects(arrayMove(projects, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-base-content/70">
          {projects.length} {projects.length === 1 ? 'projeto' : 'projetos'}
        </span>
        <button onClick={handleAdd} className="btn btn-sm btn-primary gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Projeto
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="alert alert-info">
          <span>Nenhum projeto adicionado. Clique em "Adicionar Projeto" para começar.</span>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            {projects.map((project, index) => (
              <SortableProjectItem
                key={project.id}
                project={project}
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
