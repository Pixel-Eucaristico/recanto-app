'use client';

import { useEffect, useMemo } from 'react';
import { Check, X, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QuizEntity } from '@/domain/quiz/entities/Quiz';
import { SequenceQuestion as SequenceQ } from '@/domain/quiz/types';

interface SequencePlayerProps {
  question: SequenceQ;
  value: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
  feedback?: boolean;
}

function SortableItem({ id, index, text, correct, disabled }: {
  id: string;
  index: number;
  text: string;
  correct: boolean | null;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };
  const bg =
    correct === true ? 'border-success bg-success/10' :
    correct === false ? 'border-error bg-error/10' :
    'border-base-300 bg-base-100';
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 rounded-lg border ${bg} ${disabled ? '' : 'cursor-grab active:cursor-grabbing'}`}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="w-4 h-4 text-base-content/40 flex-shrink-0" />
      <span className="badge badge-ghost badge-sm flex-shrink-0">{index + 1}</span>
      <span className="flex-1 text-sm text-base-content">{text}</span>
      {correct === true && <Check className="w-4 h-4 text-success flex-shrink-0" />}
      {correct === false && <X className="w-4 h-4 text-error flex-shrink-0" />}
    </li>
  );
}

export function SequencePlayer({ question, value, onChange, disabled, feedback }: SequencePlayerProps) {
  const initialShuffled = useMemo(() => QuizEntity.shuffle(question.items.map(i => i.id)), [question.items]);

  useEffect(() => {
    if (value.length === 0) onChange(initialShuffled);
  }, [initialShuffled, value.length, onChange]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = value.indexOf(String(active.id));
    const newIndex = value.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(value, oldIndex, newIndex));
  }

  function isPositionCorrect(idx: number): boolean | null {
    if (!feedback) return null;
    return value[idx] === question.items[idx]?.id;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={value} strategy={verticalListSortingStrategy}>
        <ol className="space-y-2">
          {value.map((id, idx) => {
            const item = question.items.find(i => i.id === id);
            return (
              <SortableItem
                key={id}
                id={id}
                index={idx}
                text={item?.text ?? '?'}
                correct={isPositionCorrect(idx)}
                disabled={!!disabled}
              />
            );
          })}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
