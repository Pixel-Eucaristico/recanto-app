'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { Quiz, QuizOption, QuizQuestion } from '@/domain/quiz/types';
import { QuizEntity } from '@/domain/quiz/entities/Quiz';
import { quizService } from '@/application/quiz/QuizService';
import { MarkdownField } from '@/shared/components/MarkdownField';

interface QuizBuilderProps {
  lessonId: string;
  createdBy: string;
  initial?: Quiz | null;
  onSaved?: (quiz: Quiz) => void;
}

function generateId() {
  return `q_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function blankOption(): QuizOption {
  return { id: generateId(), text: '', is_correct: false };
}

function blankQuestion(): QuizQuestion {
  return {
    id: generateId(),
    text: '',
    options: [blankOption(), blankOption()],
    explanation: '',
  };
}

export function QuizBuilder({ lessonId, createdBy, initial, onSaved }: QuizBuilderProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [passingScore, setPassingScore] = useState<number>(initial?.passing_score ?? 70);
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initial?.questions?.length ? initial.questions : [blankQuestion()],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  function updateQuestion(idx: number, patch: Partial<QuizQuestion>) {
    setQuestions(prev => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  }

  function addQuestion() {
    setQuestions(prev => [...prev, blankQuestion()]);
  }

  function removeQuestion(idx: number) {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  }

  function addOption(qIdx: number) {
    setQuestions(prev =>
      prev.map((q, i) => (i === qIdx ? { ...q, options: [...q.options, blankOption()] } : q)),
    );
  }

  function updateOption(qIdx: number, oIdx: number, patch: Partial<QuizOption>) {
    setQuestions(prev =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const options = q.options.map((o, oi) => (oi === oIdx ? { ...o, ...patch } : o));
        return { ...q, options };
      }),
    );
  }

  function markCorrect(qIdx: number, oIdx: number) {
    setQuestions(prev =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        return { ...q, options: q.options.map((o, oi) => ({ ...o, is_correct: oi === oIdx })) };
      }),
    );
  }

  function removeOption(qIdx: number, oIdx: number) {
    setQuestions(prev =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        if (q.options.length <= 2) return q;
        return { ...q, options: q.options.filter((_, oi) => oi !== oIdx) };
      }),
    );
  }

  async function save() {
    setError(null);
    setSavedMsg(null);
    const payload: Omit<Quiz, 'id'> & { id?: string } = {
      id: initial?.id,
      lesson_id: lessonId,
      title: title.trim(),
      description: description.trim() || undefined,
      questions,
      passing_score: passingScore,
      created_at: initial?.created_at ?? new Date().toISOString(),
      created_by: initial?.created_by ?? createdBy,
    };
    const validation = QuizEntity.validate(payload);
    if (!validation.valid) {
      setError(validation.errors.join(' '));
      return;
    }
    setSaving(true);
    try {
      const saved = await quizService.save(payload as Quiz);
      setSavedMsg('Quiz salvo com sucesso.');
      onSaved?.(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body gap-3">
          <label className="form-control">
            <span className="label-text text-xs mb-1">Título</span>
            <input
              className="input input-bordered input-sm"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex.: Avaliação — O despertar do sentido"
            />
          </label>
          <label className="form-control">
            <span className="label-text text-xs mb-1">Descrição (Markdown — aceita imagens ![](url) e links YouTube)</span>
            <MarkdownField
              value={description}
              onChange={setDescription}
              placeholder="Contexto / orientação... use **negrito**, links, ![img](url), https://youtube.com/..."
              height={160}
              preview="live"
            />
          </label>
          <label className="form-control max-w-xs">
            <span className="label-text text-xs mb-1">Pontuação mínima (%)</span>
            <input
              type="number"
              className="input input-bordered input-sm"
              value={passingScore}
              min={0}
              max={100}
              onChange={e => setPassingScore(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q, qIdx) => (
          <div key={q.id} className="card bg-base-100 border border-base-300">
            <div className="card-body gap-3">
              <div className="flex items-start gap-2">
                <GripVertical className="w-5 h-5 text-base-content/30 mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary badge-sm">Pergunta {qIdx + 1}</span>
                    <button
                      className="btn btn-ghost btn-xs text-error ml-auto"
                      onClick={() => removeQuestion(qIdx)}
                      disabled={questions.length <= 1}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <MarkdownField
                    value={q.text}
                    onChange={v => updateQuestion(qIdx, { text: v })}
                    placeholder="Texto da pergunta... (Markdown + YouTube/imagens)"
                    height={140}
                    preview="live"
                  />
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={opt.id} className="flex items-start gap-2">
                        <input
                          type="radio"
                          className="radio radio-success radio-sm mt-3"
                          checked={opt.is_correct}
                          onChange={() => markCorrect(qIdx, oIdx)}
                          title="Marcar como correta"
                        />
                        <div className="flex-1">
                          <MarkdownField
                            value={opt.text}
                            onChange={v => updateOption(qIdx, oIdx, { text: v })}
                            placeholder={`Opção ${oIdx + 1} (Markdown + imagens + YouTube)`}
                            height={100}
                            preview="edit"
                          />
                        </div>
                        <button
                          className="btn btn-ghost btn-xs text-error mt-3"
                          onClick={() => removeOption(qIdx, oIdx)}
                          disabled={q.options.length <= 2}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button className="btn btn-ghost btn-xs gap-1" onClick={() => addOption(qIdx)}>
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar opção
                    </button>
                  </div>
                  <label className="form-control">
                    <span className="label-text text-xs mb-1">Explicação (Markdown, opcional — mostrada após resposta)</span>
                    <MarkdownField
                      value={q.explanation ?? ''}
                      onChange={v => updateQuestion(qIdx, { explanation: v })}
                      placeholder="Por que essa é a resposta correta? (cite referências, vídeos, etc.)"
                      height={120}
                      preview="live"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button className="btn btn-ghost btn-sm gap-1" onClick={addQuestion}>
          <Plus className="w-4 h-4" />
          Adicionar pergunta
        </button>
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
