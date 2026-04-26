'use client';

import { Plus, Save } from 'lucide-react';
import type { Quiz, QuestionKind } from '@/domain/quiz/types';
import { KIND_LABELS } from './utils/quizBuilderUtils';
import { QuizMetaForm } from './components/QuizMetaForm';
import { QuestionCard } from './components/QuestionCard';
import { useQuizBuilder } from './hooks/useQuizBuilder';

interface QuizBuilderProps {
  lessonId: string;
  createdBy: string;
  initial?: Quiz | null;
  onSaved?: (quiz: Quiz) => void;
}

export function QuizBuilder({ lessonId, createdBy, initial, onSaved }: QuizBuilderProps) {
  const {
    title, setTitle,
    description, setDescription,
    passingScore, setPassingScore,
    questions,
    saving, error, savedMsg,
    updateQuestion, addQuestion, removeQuestion, changeKind,
    save,
  } = useQuizBuilder({ lessonId, createdBy, initial, onSaved });

  return (
    <div className="space-y-5">
      <QuizMetaForm
        title={title}
        description={description}
        passingScore={passingScore}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onPassingScoreChange={setPassingScore}
      />

      <div className="space-y-3">
        {questions.map((q, qIdx) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={qIdx}
            totalCount={questions.length}
            onUpdate={patch => updateQuestion(qIdx, patch)}
            onRemove={() => removeQuestion(qIdx)}
            onChangeKind={kind => changeKind(qIdx, kind)}
          />
        ))}

        <div className="flex flex-wrap gap-2">
          {(Object.keys(KIND_LABELS) as QuestionKind[]).map(k => (
            <button key={k} className="btn btn-ghost btn-sm gap-1" onClick={() => addQuestion(k)}>
              <Plus className="w-4 h-4" />
              {KIND_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}
      {savedMsg && <div className="alert alert-success text-sm"><span>{savedMsg}</span></div>}

      <div className="flex justify-end">
        <button className="btn btn-primary gap-1" onClick={save} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar quiz'}
        </button>
      </div>
    </div>
  );
}
