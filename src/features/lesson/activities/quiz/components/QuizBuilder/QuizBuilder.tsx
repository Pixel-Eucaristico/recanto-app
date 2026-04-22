'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, GripVertical } from 'lucide-react';
import {
  Quiz,
  QuizOption,
  QuizQuestion,
  QuestionKind,
  MultipleChoiceQuestion,
  FillBlankQuestion,
  MatchingQuestion,
  SequenceQuestion,
  ClassifyQuestion,
} from '@/domain/quiz/types';
import { QuizEntity } from '@/domain/quiz/entities/Quiz';
import { quizService } from '@/application/quiz/QuizService';
import { MarkdownField } from '@/shared/components/MarkdownField';

interface QuizBuilderProps {
  lessonId: string;
  createdBy: string;
  initial?: Quiz | null;
  onSaved?: (quiz: Quiz) => void;
}

function gid(prefix = 'q') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function blankOption(): QuizOption {
  return { id: gid('o'), text: '', is_correct: false };
}

function newQuestion(kind: QuestionKind): QuizQuestion {
  switch (kind) {
    case 'true_false':
      return {
        id: gid(),
        text: '',
        kind: 'true_false',
        options: [
          { id: gid('o'), text: 'Verdadeiro', is_correct: true },
          { id: gid('o'), text: 'Falso', is_correct: false },
        ],
        explanation: '',
      };
    case 'fill_blank':
      return { id: gid(), text: '', kind: 'fill_blank', template: '', blanks: [], explanation: '' };
    case 'matching':
      return {
        id: gid(),
        text: '',
        kind: 'matching',
        pairs: [
          { id: gid('p'), left: '', right: '' },
          { id: gid('p'), left: '', right: '' },
        ],
        explanation: '',
      };
    case 'sequence':
      return {
        id: gid(),
        text: '',
        kind: 'sequence',
        items: [
          { id: gid('i'), text: '' },
          { id: gid('i'), text: '' },
        ],
        explanation: '',
      };
    case 'classify':
      return {
        id: gid(),
        text: '',
        kind: 'classify',
        buckets: [
          { id: gid('b'), label: 'Categoria A' },
          { id: gid('b'), label: 'Categoria B' },
        ],
        cards: [],
        explanation: '',
      };
    default:
      return {
        id: gid(),
        text: '',
        kind: 'multiple_choice',
        options: [blankOption(), blankOption()],
        explanation: '',
      };
  }
}

const KIND_LABELS: Record<QuestionKind, string> = {
  multiple_choice: 'Múltipla escolha',
  true_false: 'Verdadeiro/Falso',
  fill_blank: 'Preencher lacunas',
  matching: 'Relacionar colunas',
  sequence: 'Ordenar sequência',
  classify: 'Classificar',
};

export function QuizBuilder({ lessonId, createdBy, initial, onSaved }: QuizBuilderProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [passingScore, setPassingScore] = useState<number>(initial?.passing_score ?? 70);
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initial?.questions?.length ? initial.questions : [newQuestion('multiple_choice')],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  function updateQuestion(idx: number, patch: Partial<QuizQuestion>) {
    setQuestions(prev => prev.map((q, i) => (i === idx ? ({ ...q, ...patch } as QuizQuestion) : q)));
  }

  function addQuestion(kind: QuestionKind) {
    setQuestions(prev => [...prev, newQuestion(kind)]);
  }

  function removeQuestion(idx: number) {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  }

  function changeKind(idx: number, kind: QuestionKind) {
    setQuestions(prev =>
      prev.map((q, i) => (i === idx ? { ...newQuestion(kind), text: q.text, explanation: q.explanation } : q)),
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
            <span className="label-text text-xs mb-1">Descrição (Markdown + imagens + YouTube)</span>
            <MarkdownField
              value={description}
              onChange={setDescription}
              placeholder="Contexto / orientação..."
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
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="badge badge-primary badge-sm">Pergunta {qIdx + 1}</span>
                    <select
                      className="select select-bordered select-xs"
                      value={q.kind ?? 'multiple_choice'}
                      onChange={e => changeKind(qIdx, e.target.value as QuestionKind)}
                    >
                      {(Object.keys(KIND_LABELS) as QuestionKind[]).map(k => (
                        <option key={k} value={k}>{KIND_LABELS[k]}</option>
                      ))}
                    </select>
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
                    placeholder="Enunciado... (Markdown + YouTube/imagens)"
                    height={120}
                    preview="live"
                  />

                  <KindEditor question={q} onChange={patch => updateQuestion(qIdx, patch)} />

                  <label className="form-control">
                    <span className="label-text text-xs mb-1">Explicação (Markdown, opcional)</span>
                    <MarkdownField
                      value={q.explanation ?? ''}
                      onChange={v => updateQuestion(qIdx, { explanation: v })}
                      placeholder="Por que essa é a resposta correta?"
                      height={100}
                      preview="live"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
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

// ─── Editores por tipo ──────────────────────────────────────────────────────

function KindEditor({ question, onChange }: { question: QuizQuestion; onChange: (patch: Partial<QuizQuestion>) => void }) {
  const kind = question.kind ?? 'multiple_choice';
  if (kind === 'multiple_choice' || kind === 'true_false') return <MultipleChoiceEditor question={question as MultipleChoiceQuestion} onChange={onChange} locked={kind === 'true_false'} />;
  if (kind === 'fill_blank') return <FillBlankEditor question={question as FillBlankQuestion} onChange={onChange} />;
  if (kind === 'matching') return <MatchingEditor question={question as MatchingQuestion} onChange={onChange} />;
  if (kind === 'sequence') return <SequenceEditor question={question as SequenceQuestion} onChange={onChange} />;
  if (kind === 'classify') return <ClassifyEditor question={question as ClassifyQuestion} onChange={onChange} />;
  return null;
}

function MultipleChoiceEditor({ question, onChange, locked }: { question: MultipleChoiceQuestion; onChange: (p: Partial<QuizQuestion>) => void; locked?: boolean }) {
  function setOptions(options: QuizOption[]) {
    onChange({ options } as Partial<QuizQuestion>);
  }
  // V/F (locked=true): labels fixos, editor simples — só marca qual é a correta
  if (locked) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-base-content/60">Marque qual das alternativas é a correta:</p>
        {question.options.map((opt, oIdx) => (
          <label
            key={opt.id}
            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
              opt.is_correct ? 'border-success bg-success/10' : 'border-base-300 hover:border-success/50'
            }`}
          >
            <input
              type="radio"
              className="radio radio-success radio-sm"
              checked={opt.is_correct}
              onChange={() => setOptions(question.options.map((o, i) => ({ ...o, is_correct: i === oIdx })))}
            />
            <span className="font-medium text-base-content">{opt.text}</span>
          </label>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {question.options.map((opt, oIdx) => (
        <div key={opt.id} className="flex items-start gap-2">
          <input
            type="radio"
            className="radio radio-success radio-sm mt-3"
            checked={opt.is_correct}
            onChange={() => setOptions(question.options.map((o, i) => ({ ...o, is_correct: i === oIdx })))}
          />
          <div className="flex-1">
            <MarkdownField
              value={opt.text}
              onChange={v => setOptions(question.options.map((o, i) => (i === oIdx ? { ...o, text: v } : o)))}
              placeholder={`Opção ${oIdx + 1} (Markdown)`}
              height={90}
              preview="edit"
            />
          </div>
          <button
            className="btn btn-ghost btn-xs text-error mt-3"
            onClick={() => setOptions(question.options.filter((_, i) => i !== oIdx))}
            disabled={question.options.length <= 2}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button className="btn btn-ghost btn-xs gap-1" onClick={() => setOptions([...question.options, blankOption()])}>
        <Plus className="w-3.5 h-3.5" /> Adicionar opção
      </button>
    </div>
  );
}

function FillBlankEditor({ question, onChange }: { question: FillBlankQuestion; onChange: (p: Partial<QuizQuestion>) => void }) {
  function setTemplate(template: string) {
    const count = (template.match(/__+/g) ?? []).length;
    const blanks = [...(question.blanks ?? [])];
    while (blanks.length < count) blanks.push({ accepted: [''] });
    while (blanks.length > count) blanks.pop();
    onChange({ template, blanks } as Partial<QuizQuestion>);
  }
  function setAccepted(i: number, csv: string) {
    const blanks = [...question.blanks];
    blanks[i] = { accepted: csv.split(',').map(s => s.trim()).filter(Boolean) };
    onChange({ blanks } as Partial<QuizQuestion>);
  }
  return (
    <div className="space-y-2">
      <label className="form-control">
        <span className="label-text text-xs mb-1">Template (use <code>__</code> para cada lacuna)</span>
        <textarea
          className="textarea textarea-bordered textarea-sm font-mono"
          value={question.template}
          onChange={e => setTemplate(e.target.value)}
          placeholder="Ex.: A virtude da __ nos leva a __ os irmãos."
          rows={3}
        />
      </label>
      {question.blanks.map((slot, i) => (
        <label key={i} className="form-control">
          <span className="label-text text-xs mb-1">Lacuna {i + 1} — respostas aceitas (separadas por vírgula)</span>
          <input
            className="input input-bordered input-sm"
            value={slot.accepted.join(', ')}
            onChange={e => setAccepted(i, e.target.value)}
            placeholder="ex.: caridade, amor"
          />
        </label>
      ))}
    </div>
  );
}

function MatchingEditor({ question, onChange }: { question: MatchingQuestion; onChange: (p: Partial<QuizQuestion>) => void }) {
  function setPairs(pairs: MatchingQuestion['pairs']) {
    onChange({ pairs } as Partial<QuizQuestion>);
  }
  return (
    <div className="space-y-2">
      {question.pairs.map((p, i) => (
        <div key={p.id} className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
          <input
            className="input input-bordered input-sm"
            value={p.left}
            onChange={e => setPairs(question.pairs.map((pp, idx) => (idx === i ? { ...pp, left: e.target.value } : pp)))}
            placeholder="Coluna A"
          />
          <span className="text-base-content/40">↔</span>
          <input
            className="input input-bordered input-sm"
            value={p.right}
            onChange={e => setPairs(question.pairs.map((pp, idx) => (idx === i ? { ...pp, right: e.target.value } : pp)))}
            placeholder="Coluna B"
          />
          <button
            className="btn btn-ghost btn-xs text-error"
            onClick={() => setPairs(question.pairs.filter((_, idx) => idx !== i))}
            disabled={question.pairs.length <= 2}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button className="btn btn-ghost btn-xs gap-1" onClick={() => setPairs([...question.pairs, { id: gid('p'), left: '', right: '' }])}>
        <Plus className="w-3.5 h-3.5" /> Adicionar par
      </button>
    </div>
  );
}

function SequenceEditor({ question, onChange }: { question: SequenceQuestion; onChange: (p: Partial<QuizQuestion>) => void }) {
  function setItems(items: SequenceQuestion['items']) {
    onChange({ items } as Partial<QuizQuestion>);
  }
  return (
    <div className="space-y-2">
      <p className="text-xs text-base-content/60">Itens na ORDEM correta (o player embaralha pra o aluno).</p>
      {question.items.map((it, i) => (
        <div key={it.id} className="flex items-center gap-2">
          <span className="badge badge-ghost">{i + 1}</span>
          <input
            className="input input-bordered input-sm flex-1"
            value={it.text}
            onChange={e => setItems(question.items.map((ii, idx) => (idx === i ? { ...ii, text: e.target.value } : ii)))}
            placeholder={`Item ${i + 1}`}
          />
          <button
            className="btn btn-ghost btn-xs text-error"
            onClick={() => setItems(question.items.filter((_, idx) => idx !== i))}
            disabled={question.items.length <= 2}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <button className="btn btn-ghost btn-xs gap-1" onClick={() => setItems([...question.items, { id: gid('i'), text: '' }])}>
        <Plus className="w-3.5 h-3.5" /> Adicionar item
      </button>
    </div>
  );
}

function ClassifyEditor({ question, onChange }: { question: ClassifyQuestion; onChange: (p: Partial<QuizQuestion>) => void }) {
  function setBuckets(buckets: ClassifyQuestion['buckets']) {
    onChange({ buckets } as Partial<QuizQuestion>);
  }
  function setCards(cards: ClassifyQuestion['cards']) {
    onChange({ cards } as Partial<QuizQuestion>);
  }
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-base-content/60 mb-2">Categorias</p>
        <div className="space-y-2">
          {question.buckets.map((b, i) => (
            <div key={b.id} className="flex items-center gap-2">
              <input
                className="input input-bordered input-sm flex-1"
                value={b.label}
                onChange={e => setBuckets(question.buckets.map((bb, idx) => (idx === i ? { ...bb, label: e.target.value } : bb)))}
                placeholder={`Categoria ${i + 1}`}
              />
              <button
                className="btn btn-ghost btn-xs text-error"
                onClick={() => setBuckets(question.buckets.filter((_, idx) => idx !== i))}
                disabled={question.buckets.length <= 2}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button className="btn btn-ghost btn-xs gap-1" onClick={() => setBuckets([...question.buckets, { id: gid('b'), label: '' }])}>
            <Plus className="w-3.5 h-3.5" /> Categoria
          </button>
        </div>
      </div>
      <div>
        <p className="text-xs text-base-content/60 mb-2">Cards (texto → categoria)</p>
        <div className="space-y-2">
          {question.cards.map((c, i) => (
            <div key={c.id} className="flex items-center gap-2">
              <input
                className="input input-bordered input-sm flex-1"
                value={c.text}
                onChange={e => setCards(question.cards.map((cc, idx) => (idx === i ? { ...cc, text: e.target.value } : cc)))}
                placeholder={`Card ${i + 1}`}
              />
              <select
                className="select select-bordered select-sm"
                value={c.bucket_id}
                onChange={e => setCards(question.cards.map((cc, idx) => (idx === i ? { ...cc, bucket_id: e.target.value } : cc)))}
              >
                <option value="">— categoria —</option>
                {question.buckets.map(b => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
              <button
                className="btn btn-ghost btn-xs text-error"
                onClick={() => setCards(question.cards.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button
            className="btn btn-ghost btn-xs gap-1"
            onClick={() => setCards([...question.cards, { id: gid('c'), text: '', bucket_id: question.buckets[0]?.id ?? '' }])}
          >
            <Plus className="w-3.5 h-3.5" /> Card
          </button>
        </div>
      </div>
    </div>
  );
}
