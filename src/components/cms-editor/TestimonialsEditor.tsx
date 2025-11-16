'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, User, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
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
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  comment: string;
  date: string;
}

interface TestimonialsEditorProps {
  value: string; // JSON string
  onChange: (value: string) => void;
}

interface SortableTestimonialItemProps {
  testimonial: Testimonial;
  index: number;
  onUpdate: (id: number, field: keyof Testimonial, value: string) => void;
  onDelete: (id: number) => void;
}

function SortableTestimonialItem({
  testimonial,
  index,
  onUpdate,
  onDelete
}: SortableTestimonialItemProps) {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: testimonial.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card bg-base-200 shadow mb-3"
    >
      <div className="card-body p-4">
        {/* Header com Drag Handle */}
        <div className="flex items-center gap-3 mb-2">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-base-300 rounded flex-shrink-0"
          >
            <GripVertical className="w-5 h-5 text-base-content/40" />
          </div>

          {/* Badge */}
          <span className="badge badge-neutral">#{index + 1}</span>

          {/* Name Preview */}
          <span className="font-semibold text-base-content flex-1">
            {testimonial.name || 'Novo Depoimento'}
          </span>

          {/* Role Preview */}
          {testimonial.role && (
            <span className="text-sm text-base-content/60">
              • {testimonial.role}
            </span>
          )}

          {/* Toggle Button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn btn-sm btn-ghost btn-circle"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Conteúdo Expansível */}
        {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-base-300 mt-2">
          {/* Nome e Função */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-base-content">
                Nome *
              </label>
              <Input
                type="text"
                value={testimonial.name}
                onChange={(e) => onUpdate(testimonial.id, 'name', e.target.value)}
                placeholder="Maria Silva"
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-base-content">
                Função/Papel *
              </label>
              <Input
                type="text"
                value={testimonial.role}
                onChange={(e) => onUpdate(testimonial.id, 'role', e.target.value)}
                placeholder="Membro da Comunidade"
                className="input input-bordered w-full"
              />
            </div>
          </div>

          {/* URL do Avatar */}
          <div>
            <label className="block text-sm font-medium mb-1 text-base-content">
              URL do Avatar
            </label>
            <Input
              type="text"
              value={testimonial.avatar}
              onChange={(e) => onUpdate(testimonial.id, 'avatar', e.target.value)}
              placeholder="https://randomuser.me/api/portraits/women/1.jpg"
              className="input input-bordered w-full"
            />
            <div className="flex items-start gap-2 mt-1">
              <p className="text-xs text-base-content/50">
                Use randomuser.me, unsplash.com ou envie para /public/assets
              </p>
              {testimonial.avatar && (
                <div className="avatar">
                  <div className="w-8 h-8 rounded-full">
                    <img src={testimonial.avatar} alt="Preview" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Depoimento */}
          <div>
            <label className="block text-sm font-medium mb-1 text-base-content">
              Depoimento *
            </label>
            <Textarea
              value={testimonial.comment}
              onChange={(e) => onUpdate(testimonial.id, 'comment', e.target.value)}
              placeholder="Escreva o depoimento aqui..."
              rows={3}
              className="textarea textarea-bordered w-full"
            />
          </div>

          {/* Data */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-sm font-medium mb-1 text-base-content">
                Data
              </label>
              <Input
                type="text"
                value={testimonial.date}
                onChange={(e) => onUpdate(testimonial.id, 'date', e.target.value)}
                placeholder="Mar 2024"
                className="input input-bordered w-full"
              />
              <p className="text-xs text-base-content/50 mt-1">
                Formato: "Mês Ano" (ex: Mar 2024)
              </p>
            </div>

            {/* Delete Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => onDelete(testimonial.id)}
                variant="ghost"
                size="sm"
                className="btn btn-error btn-outline gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remover
              </Button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default function TestimonialsEditor({ value, onChange }: TestimonialsEditorProps) {
  // Parse JSON or use empty array
  const parseTestimonials = (): Testimonial[] => {
    if (!value || value.trim() === '') return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const [testimonials, setTestimonials] = useState<Testimonial[]>(parseTestimonials());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const updateParent = (newTestimonials: Testimonial[]) => {
    setTestimonials(newTestimonials);
    onChange(JSON.stringify(newTestimonials, null, 2));
  };

  const addTestimonial = () => {
    const newId = testimonials.length > 0
      ? Math.max(...testimonials.map(t => t.id)) + 1
      : 1;

    const newTestimonial: Testimonial = {
      id: newId,
      name: '',
      role: '',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      comment: '',
      date: new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    };

    updateParent([...testimonials, newTestimonial]);
  };

  const updateTestimonial = (id: number, field: keyof Testimonial, newValue: string | number) => {
    const updated = testimonials.map(t =>
      t.id === id ? { ...t, [field]: newValue } : t
    );
    updateParent(updated);
  };

  const deleteTestimonial = (id: number) => {
    if (!confirm('Tem certeza que deseja remover este depoimento?')) return;
    updateParent(testimonials.filter(t => t.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = testimonials.findIndex(t => t.id === active.id);
    const newIndex = testimonials.findIndex(t => t.id === over.id);

    updateParent(arrayMove(testimonials, oldIndex, newIndex));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-base-content">Depoimentos</h4>
          <p className="text-sm text-base-content/60">
            Adicione e organize depoimentos arrastando os itens
          </p>
        </div>
        <Button
          type="button"
          onClick={addTestimonial}
          size="sm"
          className="btn btn-primary btn-sm gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </Button>
      </div>

      {/* Empty State */}
      {testimonials.length === 0 ? (
        <div className="card bg-base-200 shadow">
          <div className="card-body items-center text-center py-12">
            <User className="w-16 h-16 mb-4 text-base-content/30" />
            <h3 className="card-title text-base-content">Nenhum depoimento</h3>
            <p className="text-base-content/60 mb-4">
              Adicione depoimentos da comunidade para exibir na página
            </p>
            <Button
              type="button"
              onClick={addTestimonial}
              variant="outline"
              size="sm"
              className="btn btn-primary gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Primeiro Depoimento
            </Button>
          </div>
        </div>
      ) : (
        /* Testimonials List with Drag-and-Drop */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={testimonials.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-0">
              {testimonials.map((testimonial, index) => (
                <SortableTestimonialItem
                  key={testimonial.id}
                  testimonial={testimonial}
                  index={index}
                  onUpdate={updateTestimonial}
                  onDelete={deleteTestimonial}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Helper Text */}
      {testimonials.length > 0 && (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>
            <strong>Dica:</strong> Arraste o ícone ≡ para reordenar os depoimentos
          </span>
        </div>
      )}
    </div>
  );
}
