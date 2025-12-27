'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, Edit, Check } from 'lucide-react';
import type { InfographicCard } from '@/types/cms-types';
import { AnimationPicker } from './AnimationPicker';
import { IconPicker } from './IconPicker';
import { WysiwygEditor } from './WysiwygEditor';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface InfographicCardsEditorProps {
  value: InfographicCard[];
  onChange: (value: InfographicCard[]) => void;
}

const IMAGE_POSITIONS = [
  { value: 'float-start', label: 'Início (esquerda em LTR)' },
  { value: 'float-end', label: 'Fim (direita em LTR)' },
  { value: 'float-left', label: 'Esquerda (fixo)' },
  { value: 'float-right', label: 'Direita (fixo)' },
];

/**
 * Editor visual de cards do infográfico com drag-and-drop
 * Usuário pode adicionar, remover, reordenar e editar cards
 */
export function InfographicCardsEditor({ value = [], onChange }: InfographicCardsEditorProps) {
  const [cards, setCards] = useState<InfographicCard[]>(
    value.length > 0
      ? value
      : [
          {
            id: `card-${Date.now()}`,
            title: 'Novo Card',
            body: '<p>Conteúdo do card...</p>',
            imagePosition: 'float-start',
          },
        ]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (value && value.length > 0) {
      setCards(value);
    }
  }, [value]);

  const handleAdd = () => {
    const newCard: InfographicCard = {
      id: `card-${Date.now()}`,
      title: 'Novo Card',
      body: '<p>Conteúdo do card...</p>',
      imagePosition: 'float-start',
    };
    const newCards = [...cards, newCard];
    setCards(newCards);
    onChange(newCards);
  };

  const handleRemove = (id: string) => {
    if (cards.length === 1) return; // Manter pelo menos 1
    const newCards = cards.filter((card) => card.id !== id);
    setCards(newCards);
    onChange(newCards);
  };

  const handleUpdate = (id: string, field: keyof InfographicCard, value: any) => {
    const newCards = cards.map((card) =>
      card.id === id ? { ...card, [field]: value } : card
    );
    setCards(newCards);
    onChange(newCards);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = cards.findIndex((card) => card.id === active.id);
      const newIndex = cards.findIndex((card) => card.id === over.id);

      const newCards = arrayMove(cards, oldIndex, newIndex);
      setCards(newCards);
      onChange(newCards);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview do Grid */}
      <div className="card bg-base-200 shadow-lg p-4">
        <h4 className="font-semibold text-sm text-base-content/60 mb-3">
          Preview do Infográfico ({cards.length} {cards.length === 1 ? 'card' : 'cards'})
        </h4>
        <div className="text-xs text-base-content/40 mb-2">
          Arraste os cards abaixo para reordenar
        </div>
      </div>

      {/* Cards Editáveis com Drag-and-Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {cards.map((card, index) => (
              <SortableCard
                key={card.id}
                card={card}
                index={index}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
                canRemove={cards.length > 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Botão Adicionar */}
      <button
        type="button"
        onClick={handleAdd}
        className="btn btn-outline btn-sm gap-2 w-full"
      >
        <Plus className="w-4 h-4" />
        Adicionar Card
      </button>
    </div>
  );
}

interface SortableCardProps {
  card: InfographicCard;
  index: number;
  onUpdate: (id: string, field: keyof InfographicCard, value: any) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

function SortableCard({ card, index, onUpdate, onRemove, canRemove }: SortableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animationData, setAnimationData] = useState<any>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Carregar preview da animação
  useEffect(() => {
    if (card.lottieFile && card.lottieFile !== 'none') {
      fetch(`/animations/${card.lottieFile}`)
        .then((res) => res.json())
        .then((data) => setAnimationData(data))
        .catch(() => setAnimationData(null));
    } else {
      setAnimationData(null);
    }
  }, [card.lottieFile]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card bg-base-100 border-2 border-base-300 shadow-sm"
    >
      <div className="card-body p-4">
        {/* Header do Card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-base-200 rounded"
              title="Arraste para reordenar"
            >
              <GripVertical className="w-5 h-5 text-base-content/40" />
            </button>

            <span className="badge badge-neutral">{index + 1}</span>
            <div>
              <h3 className="font-semibold">{card.title || 'Sem título'}</h3>
              <p className="text-xs text-base-content/60">
                {card.lottieFile ? `Animação: ${card.lottieFile}` : 'Sem animação'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Edição */}
            <button
              type="button"
              className={`btn btn-sm gap-1 ${isExpanded ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <Check className="w-4 h-4" />
                  Fechar
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4" />
                  Editar
                </>
              )}
            </button>

            {/* Botão Remover */}
            <button
              type="button"
              onClick={() => onRemove(card.id)}
              className="btn btn-sm btn-ghost text-error"
              disabled={!canRemove}
              title="Remover card"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Formulário de Edição */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-base-300 space-y-4">
            {/* Preview do Card */}
            {animationData && (
              <div className="p-3 bg-base-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 flex-shrink-0">
                    <Lottie animationData={animationData} loop className="w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{card.title}</h4>
                    <div
                      className="text-sm text-base-content/80"
                      dangerouslySetInnerHTML={{ __html: card.body }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Título */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Título</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Ex: Origem da Devoção"
                value={card.title}
                onChange={(e) => onUpdate(card.id, 'title', e.target.value)}
              />
            </div>

            {/* Corpo (WYSIWYG) */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Conteúdo</span>
              </label>
              <WysiwygEditor
                value={card.body}
                onChange={(value) => onUpdate(card.id, 'body', value)}
                placeholder="Digite o texto do card aqui..."
                minHeight="150px"
              />
            </div>

            {/* Ícone Lucide */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Ícone (Opcional)</span>
              </label>
              <IconPicker
                value={card.iconName}
                onChange={(value) => onUpdate(card.id, 'iconName', value)}
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Clique para ver todos os ícones disponíveis com preview visual
                </span>
              </label>
            </div>

            {/* Animação Lottie */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Animação Lottie (Opcional)</span>
              </label>
              <AnimationPicker
                value={card.lottieFile || 'none'}
                onChange={(value) => onUpdate(card.id, 'lottieFile', value === 'none' ? undefined : value)}
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Animação tem prioridade sobre o ícone
                </span>
              </label>
            </div>

            {/* Posição da Imagem */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Posição da Animação</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={card.imagePosition}
                onChange={(e) =>
                  onUpdate(card.id, 'imagePosition', e.target.value as InfographicCard['imagePosition'])
                }
              >
                {IMAGE_POSITIONS.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Define onde a animação aparece em relação ao texto
                </span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
