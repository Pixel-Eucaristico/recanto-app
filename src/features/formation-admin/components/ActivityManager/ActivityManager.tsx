'use client';

import { useEffect, useState } from 'react';
import {
  Award, Layers, Search, Grid3x3, Network, Edit3, X, Check, ArrowLeft, Sparkles,
  Plus, Trash2, GripVertical, Save,
} from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QuizBuilder } from '@/features/lesson/activities/quiz';
import { FlashcardDeckBuilder } from '@/features/lesson/activities/flashcards';
import { CaseStudyBuilder } from '@/features/lesson/activities/case-studies';
import { WordSearchBuilder } from '@/features/lesson/activities/word-search';
import { CrosswordBuilder } from '@/features/lesson/activities/crossword';
import { MindMapBuilder } from '@/features/lesson/activities/mind-maps';
import { quizService } from '@/application/quiz/QuizService';
import { flashcardService } from '@/application/flashcards/FlashcardService';
import { caseStudyService } from '@/application/case-studies/CaseStudyService';
import { wordSearchService } from '@/application/word-search/WordSearchService';
import { crosswordService } from '@/application/crossword/CrosswordService';
import { mindMapService } from '@/application/mind-maps/MindMapService';

type ActivityType = 'quiz' | 'flashcards' | 'case_study' | 'word_search' | 'crossword' | 'mind_map';

interface ActivityFlags {
  requires_quiz: boolean;
  requires_flashcards: boolean;
  requires_case_study: boolean;
  requires_word_search: boolean;
  requires_crossword: boolean;
  requires_mind_map: boolean;
}

interface ActivityStatus {
  configured: boolean;
  countLabel?: string;
}

interface ActivityManagerProps {
  lessonId: string | null;
  createdBy: string;
  flags: ActivityFlags;
  /** Ordem custom de exibição. Default: ordem dos meta. */
  order?: ActivityType[];
  onChange: (flags: Partial<ActivityFlags>) => void;
  onOrderChange?: (order: ActivityType[]) => void;
}

const ACTIVITY_META: Record<ActivityType, {
  label: string;
  icon: React.ReactNode;
  flagKey: keyof ActivityFlags;
  description: string;
  color: string;
  /** Pode ser marcada como obrigatória (bloqueia próxima aula). Mind map é exploratória — sempre opcional. */
  canBeRequired: boolean;
}> = {
  quiz:        { label: 'Quiz',              icon: <Award className="w-5 h-5" />,    flagKey: 'requires_quiz',        description: 'Múltipla escolha, lacuna, associar',  color: 'bg-warning/15 text-warning',     canBeRequired: true  },
  flashcards:  { label: 'Flashcards',        icon: <Layers className="w-5 h-5" />,   flagKey: 'requires_flashcards',  description: 'Cartões frente/verso',                color: 'bg-info/15 text-info',           canBeRequired: true  },
  case_study:  { label: 'Estudo de caso',    icon: <Network className="w-5 h-5" />,  flagKey: 'requires_case_study',  description: 'Cenários com decisões',                color: 'bg-secondary/15 text-secondary', canBeRequired: true  },
  word_search: { label: 'Caça-palavras',     icon: <Search className="w-5 h-5" />,   flagKey: 'requires_word_search', description: 'Grid auto-gerado',                     color: 'bg-success/15 text-success',     canBeRequired: true  },
  crossword:   { label: 'Palavras cruzadas', icon: <Grid3x3 className="w-5 h-5" />,  flagKey: 'requires_crossword',   description: 'Pergunta + resposta cruzadas',         color: 'bg-accent/15 text-accent',       canBeRequired: true  },
  mind_map:    { label: 'Mapa mental',       icon: <Sparkles className="w-5 h-5" />, flagKey: 'requires_mind_map',    description: 'Template editável pelo aluno (sempre opcional)', color: 'bg-primary/15 text-primary', canBeRequired: false },
};

export function ActivityManager({ lessonId, createdBy, flags, order, onChange, onOrderChange }: ActivityManagerProps) {
  const [openType, setOpenType] = useState<ActivityType | null>(null);
  /** Quando true, este tipo está sendo configurado pela primeira vez — flag só seta após save */
  const [pendingType, setPendingType] = useState<ActivityType | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<ActivityType | null>(null);
  const [status, setStatus] = useState<Record<ActivityType, ActivityStatus>>({
    quiz: { configured: false }, flashcards: { configured: false }, case_study: { configured: false },
    word_search: { configured: false }, crossword: { configured: false }, mind_map: { configured: false },
  });

  // Load status (configured? counts?) for each activity
  useEffect(() => {
    if (!lessonId) return;
    const id = lessonId; // narrow for closure
    let cancelled = false;
    async function load() {
      const next: Record<ActivityType, ActivityStatus> = {
        quiz: { configured: false }, flashcards: { configured: false }, case_study: { configured: false },
        word_search: { configured: false }, crossword: { configured: false }, mind_map: { configured: false },
      };
      try {
        const [quiz, fc, cs, ws, cw, mm] = await Promise.all([
          quizService.getShuffledForLesson(id).catch(() => null),
          flashcardService.getDeckByLesson(id).catch(() => null),
          caseStudyService.getByLesson(id).catch(() => null),
          wordSearchService.getByLesson(id).catch(() => null),
          crosswordService.getByLesson(id).catch(() => null),
          mindMapService.getTemplateByLesson(id).catch(() => null),
        ]);
        if (cancelled) return;
        if (quiz) next.quiz = { configured: true, countLabel: `${quiz.questions?.length ?? 0} perguntas` };
        if (fc) next.flashcards = { configured: true, countLabel: `${fc.cards?.length ?? 0} cartões` };
        if (cs) next.case_study = { configured: true, countLabel: `${cs.nodes?.length ?? 0} cenas` };
        if (ws) next.word_search = { configured: true, countLabel: `${ws.words?.length ?? 0} palavras` };
        if (cw) next.crossword = { configured: true };
        if (mm) next.mind_map = { configured: true };
        setStatus(next);
      } catch {
        // Status load não crítico
      }
    }
    load();
    return () => { cancelled = true; };
  }, [lessonId, openType]);

  const allTypes = Object.keys(ACTIVITY_META) as ActivityType[];

  // Activity é mostrado se: requires_*=true OR está configurado OR está sendo adicionada pendente
  const isVisible = (t: ActivityType) =>
    flags[ACTIVITY_META[t].flagKey] || status[t].configured || pendingType === t;

  // Aplica ordem custom mantendo apenas tipos visíveis
  const visibleActivities = (() => {
    const inOrder = (order ?? []).filter(t => isVisible(t));
    const missing = allTypes.filter(t => isVisible(t) && !inOrder.includes(t));
    return [...inOrder, ...missing];
  })();

  const availableTypes = allTypes.filter(t => !visibleActivities.includes(t));

  /** Picker: NÃO seta flag — só abre builder. Flag seta no onSave do builder. */
  function pickType(type: ActivityType) {
    setPickerOpen(false);
    if (!lessonId) return;
    setPendingType(type);
    setOpenType(type);
  }

  /** Builder salvou — agora confirma flag (se ainda não estava) */
  function handleBuilderSaved() {
    if (pendingType) {
      onChange({ [ACTIVITY_META[pendingType].flagKey]: true } as Partial<ActivityFlags>);
      // Adiciona à ordem se não está
      if (onOrderChange && !(order ?? []).includes(pendingType)) {
        onOrderChange([...(order ?? []), pendingType]);
      }
    }
    setPendingType(null);
    setOpenType(null);
  }

  /** Builder cancelou sem salvar — descarta a adição pendente */
  function handleBuilderClosed() {
    setPendingType(null);
    setOpenType(null);
  }

  function confirmRemove() {
    if (!removeTarget) return;
    onChange({ [ACTIVITY_META[removeTarget].flagKey]: false } as Partial<ActivityFlags>);
    if (onOrderChange) {
      onOrderChange((order ?? []).filter(t => t !== removeTarget));
    }
    setRemoveTarget(null);
  }

  // DnD sensors — touch-friendly + keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = visibleActivities.indexOf(active.id as ActivityType);
    const newIdx = visibleActivities.indexOf(over.id as ActivityType);
    if (oldIdx === -1 || newIdx === -1) return;
    onOrderChange?.(arrayMove(visibleActivities, oldIdx, newIdx));
  }

  return (
    <div className="space-y-3">
      {!lessonId && (
        <div className="alert alert-warning text-sm">
          <span>Salve a aula primeiro pra adicionar atividades.</span>
        </div>
      )}

      {visibleActivities.length === 0 ? (
        <div className="text-center py-6 text-sm text-base-content/60 border border-dashed border-base-300 rounded-xl">
          <p>Nenhuma atividade adicionada.</p>
          <p className="text-xs mt-1">Clique abaixo pra escolher uma atividade pra esta aula.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={visibleActivities} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {visibleActivities.map(type => {
                const meta = ACTIVITY_META[type];
                const required = flags[meta.flagKey];
                return (
                  <SortableActivityCard
                    key={type}
                    id={type}
                    meta={meta}
                    required={required}
                    status={status[type]}
                    disabled={!lessonId}
                    onToggleRequired={() => onChange({ [meta.flagKey]: !required } as Partial<ActivityFlags>)}
                    onEdit={() => setOpenType(type)}
                    onRemove={() => setRemoveTarget(type)}
                  />
                );
              })}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {/* Add button — só se ainda há tipos disponíveis */}
      {availableTypes.length > 0 && (
        <button
          type="button"
          className="btn btn-outline btn-sm gap-1 w-full"
          onClick={() => setPickerOpen(true)}
          disabled={!lessonId}
        >
          <Plus className="w-4 h-4" /> Adicionar atividade
        </button>
      )}

      {/* Picker bottom sheet (mobile) / modal (desktop) */}
      {pickerOpen && lessonId && (
        <ActivityPickerSheet
          available={availableTypes}
          onPick={pickType}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {/* Builder modal */}
      {openType && lessonId && (
        <ActivityBuilderModal
          type={openType}
          lessonId={lessonId}
          createdBy={createdBy}
          onSaved={handleBuilderSaved}
          onClose={handleBuilderClosed}
        />
      )}

      {/* Remove confirm */}
      {removeTarget && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-base mb-2">Remover atividade?</h3>
            <p className="text-sm text-base-content/70">
              <strong>{ACTIVITY_META[removeTarget].label}</strong> não vai mais aparecer pra os alunos.
              Os dados configurados ficam salvos — você pode adicionar de volta depois.
            </p>
            <div className="modal-action">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRemoveTarget(null)}>Cancelar</button>
              <button type="button" className="btn btn-error btn-sm" onClick={confirmRemove}>Remover</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setRemoveTarget(null)} />
        </div>
      )}
    </div>
  );
}

// ─── Sortable Activity Card ────────────────────────────────────────────────

interface SortableActivityCardProps {
  id: ActivityType;
  meta: typeof ACTIVITY_META[ActivityType];
  required: boolean;
  status: ActivityStatus;
  disabled: boolean;
  onToggleRequired: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

function SortableActivityCard({
  id, meta, required, status, disabled, onToggleRequired, onEdit, onRemove,
}: SortableActivityCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <li ref={setNodeRef} style={style}>
      <div className={`card border transition-colors ${required ? 'border-primary/60 bg-primary/5' : 'border-base-300 bg-base-100'}`}>
        <div className="card-body p-3 gap-2">
          <div className="flex items-start gap-2">
            {/* Drag handle — touch friendly */}
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle cursor-grab active:cursor-grabbing touch-none shrink-0"
              {...attributes}
              {...listeners}
              aria-label="Arrastar pra reordenar"
              tabIndex={0}
            >
              <GripVertical className="w-4 h-4 text-base-content/40" />
            </button>

            <div className={`shrink-0 rounded-lg p-2 ${meta.color}`}>{meta.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-semibold text-sm">{meta.label}</h4>
                {status.configured ? (
                  <span className="badge badge-success badge-xs gap-0.5">
                    <Check className="w-2.5 h-2.5" /> pronto
                  </span>
                ) : (
                  <span className="badge badge-warning badge-xs">vazio</span>
                )}
              </div>
              <p className="text-xs text-base-content/60 mt-0.5 line-clamp-1">{meta.description}</p>
              {status.countLabel && (
                <p className="text-[11px] text-base-content/50 mt-0.5">{status.countLabel}</p>
              )}
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle text-error shrink-0"
              onClick={onRemove}
              disabled={disabled}
              title="Remover atividade"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {meta.canBeRequired ? (
              <button
                type="button"
                className={`btn btn-xs gap-1 flex-1 ${required ? 'btn-primary' : 'btn-ghost border border-base-300'}`}
                onClick={onToggleRequired}
                disabled={disabled}
              >
                {required && <Check className="w-3.5 h-3.5" />}
                {required ? 'Obrigatória' : 'Opcional'}
              </button>
            ) : (
              <span className="badge badge-ghost badge-sm flex-1 justify-center text-base-content/60">
                Sempre opcional
              </span>
            )}
            <button
              type="button"
              className="btn btn-primary btn-sm gap-1 flex-1"
              onClick={onEdit}
              disabled={disabled}
            >
              <Edit3 className="w-3.5 h-3.5" />
              {status.configured ? 'Editar' : 'Configurar'}
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

// ─── Picker bottom sheet ───────────────────────────────────────────────────

interface ActivityPickerSheetProps {
  available: ActivityType[];
  onPick: (type: ActivityType) => void;
  onClose: () => void;
}

function ActivityPickerSheet({ available, onPick, onClose }: ActivityPickerSheetProps) {
  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box sm:max-w-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base">Escolher atividade</h3>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {available.map(type => {
            const meta = ACTIVITY_META[type];
            return (
              <button
                key={type}
                type="button"
                className="card bg-base-100 border border-base-300 hover:border-primary hover:bg-primary/5 transition-colors text-left w-full"
                onClick={() => onPick(type)}
              >
                <div className="card-body p-3 flex-row items-center gap-3">
                  <div className={`shrink-0 rounded-lg p-2 ${meta.color}`}>{meta.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{meta.label}</p>
                    <p className="text-xs text-base-content/60">{meta.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

// ─── Builder modal — full-screen no mobile, modal grande no desktop ─────────

interface ActivityBuilderModalProps {
  type: ActivityType;
  lessonId: string;
  createdBy: string;
  onSaved: () => void;
  onClose: () => void;
}

function ActivityBuilderModal({ type, lessonId, createdBy, onSaved, onClose }: ActivityBuilderModalProps) {
  const meta = ACTIVITY_META[type];

  /**
   * Save: dispara click programático no primeiro botão dentro do builder com
   * texto "Salvar". Evita refatorar TODOS os 6 builders pra expor save callback.
   */
  function triggerSave() {
    const root = document.querySelector('[data-builder-modal-body]');
    if (!root) return;
    const buttons = Array.from(root.querySelectorAll('button')) as HTMLButtonElement[];
    const saveBtn = buttons.find(b => /salvar/i.test(b.textContent ?? ''));
    if (saveBtn) saveBtn.click();
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-none sm:max-w-5xl w-full h-[100dvh] sm:h-auto sm:max-h-[95vh] rounded-none sm:rounded-2xl flex flex-col p-0">
        {/* Sticky header — Salvar SEMPRE visível pro usuário fechar e salvar */}
        <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-base-300 bg-base-100 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle shrink-0"
              onClick={onClose}
              aria-label="Fechar"
            >
              <ArrowLeft className="w-5 h-5 sm:hidden" />
              <X className="w-5 h-5 hidden sm:inline" />
            </button>
            <div className={`shrink-0 rounded-lg p-1.5 ${meta.color}`}>{meta.icon}</div>
            <h3 className="font-bold text-sm sm:text-base truncate">{meta.label}</h3>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm gap-1 shrink-0"
            onClick={triggerSave}
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Salvar</span>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto min-h-0 p-2 sm:p-5" data-builder-modal-body>
          <BuilderLoader type={type} lessonId={lessonId} createdBy={createdBy} onSaved={onSaved} />
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

interface BuilderLoaderProps {
  type: ActivityType;
  lessonId: string;
  createdBy: string;
  onSaved: () => void;
}

function BuilderLoader({ type, lessonId, createdBy, onSaved }: BuilderLoaderProps) {
  switch (type) {
    case 'quiz':
      return <QuizBuilder lessonId={lessonId} createdBy={createdBy} onSaved={onSaved} />;
    case 'flashcards':
      return <FlashcardDeckBuilder lessonId={lessonId} createdBy={createdBy} onSaved={onSaved} />;
    case 'case_study':
      return <CaseStudyBuilder lessonId={lessonId} createdBy={createdBy} onSaved={onSaved} />;
    case 'word_search':
      return <WordSearchBuilder lessonId={lessonId} createdBy={createdBy} onSaved={onSaved} />;
    case 'crossword':
      return <CrosswordBuilder lessonId={lessonId} createdBy={createdBy} onSaved={onSaved} />;
    case 'mind_map':
      return <MindMapBuilder lessonId={lessonId} createdBy={createdBy} onSaved={onSaved} />;
  }
}
