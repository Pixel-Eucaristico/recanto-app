'use client';

import { useState, useEffect } from 'react';
import {
  Save, ArrowLeft, Plus, Trash2, Video, FileText, BookMarked, Quote, Award,
  MessageSquare, PenLine, Activity, Loader2, Info, Youtube,
} from 'lucide-react';
import type { FormationLesson, LessonBookCitation, HighlightQuote } from '@/domain/formation/types';
import { RichTextEditor } from '@/shared/components/RichTextEditor';
import { CanonicalRefPicker } from '@/features/library/components/CanonicalRefPicker';
import { detectVideoDuration, formatDuration, parseDurationString, parseVideoSource } from '@/features/lesson/video-player';
import { VideoPickerModal } from '../VideoPicker';
import { ActivityManager } from '../ActivityManager';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { ImagePicker } from '@/shared/components/ImagePicker';

interface LessonFormProps {
  lesson: FormationLesson | null;
  moduleId: string;
  defaultOrder: number;
  saving: boolean;
  onSave: (input: Parameters<typeof import('@/application/formation/FormationAdminService').formationAdminService.saveLesson>[0]) => Promise<void>;
  onCancel: () => void;
}

export function LessonForm({ lesson, moduleId, defaultOrder, saving, onSave, onCancel }: LessonFormProps) {
  const user = useCurrentUser();
  // Meta
  const [title, setTitle] = useState(lesson?.title ?? '');
  const [description, setDescription] = useState(lesson?.description ?? '');
  const [order, setOrder] = useState(lesson?.order ?? defaultOrder);

  // Video
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url ?? '');
  const [videoDuration, setVideoDuration] = useState(lesson?.video_duration_seconds ?? 0);
  const [durationInput, setDurationInput] = useState(
    lesson?.video_duration_seconds ? formatDuration(lesson.video_duration_seconds) : '',
  );
  const [detectingDuration, setDetectingDuration] = useState(false);
  const [minWatchPercent, setMinWatchPercent] = useState(lesson?.min_watch_percent ?? 80);
  const [unlockHours, setUnlockHours] = useState(lesson?.unlock_after_hours ?? 0);

  // Apostila
  const [apostila, setApostila] = useState(lesson?.apostila_content ?? '');

  // Activities
  const [requiresReflection, setRequiresReflection] = useState(lesson?.requires_reflection ?? false);
  const [requiresQuiz, setRequiresQuiz] = useState(lesson?.requires_quiz ?? false);
  const [requiresForumPost, setRequiresForumPost] = useState(lesson?.requires_forum_post ?? false);
  const [forumPrompt, setForumPrompt] = useState(lesson?.forum_prompt ?? '');
  // Activity flags (gerenciadas via ActivityManager)
  const [requiresFlashcards, setRequiresFlashcards] = useState(lesson?.requires_flashcards ?? false);
  const [requiresCaseStudy, setRequiresCaseStudy] = useState(lesson?.requires_case_study ?? false);
  const [requiresWordSearch, setRequiresWordSearch] = useState(lesson?.requires_word_search ?? false);
  const [requiresCrossword, setRequiresCrossword] = useState(lesson?.requires_crossword ?? false);
  const [requiresMindMap, setRequiresMindMap] = useState(lesson?.requires_mind_map ?? false);
  const [activityOrder, setActivityOrder] = useState<NonNullable<FormationLesson['activity_order']>>(lesson?.activity_order ?? []);
  const [thumbnailUrl, setThumbnailUrl] = useState(lesson?.thumbnail_url ?? '');

  // Practical
  const [practical, setPractical] = useState(lesson?.practical_activity ?? '');
  const [practicalRequired, setPracticalRequired] = useState(lesson?.practical_required ?? false);
  const [practicalPermanent, setPracticalPermanent] = useState(lesson?.practical_permanent ?? false);
  const [practicalDeadline, setPracticalDeadline] = useState(lesson?.practical_deadline_days ?? 0);

  // Citations
  const [bookCitations, setBookCitations] = useState<LessonBookCitation[]>(lesson?.book_citations ?? []);
  const [highlightQuotes, setHighlightQuotes] = useState<HighlightQuote[]>(lesson?.highlight_quotes ?? []);

  const [videoPickerOpen, setVideoPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(lesson?.title ?? '');
    setDescription(lesson?.description ?? '');
    setOrder(lesson?.order ?? defaultOrder);
    setVideoUrl(lesson?.video_url ?? '');
    setVideoDuration(lesson?.video_duration_seconds ?? 0);
    setDurationInput(lesson?.video_duration_seconds ? formatDuration(lesson.video_duration_seconds) : '');
    setMinWatchPercent(lesson?.min_watch_percent ?? 80);
    setUnlockHours(lesson?.unlock_after_hours ?? 0);
    setApostila(lesson?.apostila_content ?? '');
    setRequiresReflection(lesson?.requires_reflection ?? false);
    setRequiresQuiz(lesson?.requires_quiz ?? false);
    setRequiresForumPost(lesson?.requires_forum_post ?? false);
    setForumPrompt(lesson?.forum_prompt ?? '');
    setRequiresFlashcards(lesson?.requires_flashcards ?? false);
    setRequiresCaseStudy(lesson?.requires_case_study ?? false);
    setRequiresWordSearch(lesson?.requires_word_search ?? false);
    setRequiresCrossword(lesson?.requires_crossword ?? false);
    setRequiresMindMap(lesson?.requires_mind_map ?? false);
    setActivityOrder(lesson?.activity_order ?? []);
    setThumbnailUrl(lesson?.thumbnail_url ?? '');
    setPractical(lesson?.practical_activity ?? '');
    setPracticalRequired(lesson?.practical_required ?? false);
    setPracticalPermanent(lesson?.practical_permanent ?? false);
    setPracticalDeadline(lesson?.practical_deadline_days ?? 0);
    setBookCitations(lesson?.book_citations ?? []);
    setHighlightQuotes(lesson?.highlight_quotes ?? []);
  }, [lesson, defaultOrder]);

  // Auto-detect duration when MP4 URL changes
  async function handleAutoDetect() {
    if (!videoUrl.trim()) return;
    setDetectingDuration(true);
    try {
      const detected = await detectVideoDuration(videoUrl);
      if (detected) {
        setVideoDuration(detected);
        setDurationInput(formatDuration(detected));
      }
    } finally {
      setDetectingDuration(false);
    }
  }

  function handleDurationInputChange(v: string) {
    setDurationInput(v);
    const parsed = parseDurationString(v);
    if (parsed !== null) setVideoDuration(parsed);
  }

  const videoSourceKind = videoUrl.trim() ? parseVideoSource(videoUrl).kind : null;

  // Citations
  function addCitation() { setBookCitations([...bookCitations, { book_id: '' }]); }
  function updateCitation(idx: number, c: LessonBookCitation) { setBookCitations(bookCitations.map((cur, i) => i === idx ? c : cur)); }
  function removeCitation(idx: number) { setBookCitations(bookCitations.filter((_, i) => i !== idx)); }
  function addQuote() { setHighlightQuotes([...highlightQuotes, { text: '', source: '' }]); }
  function updateQuote(idx: number, q: HighlightQuote) { setHighlightQuotes(highlightQuotes.map((cur, i) => i === idx ? q : cur)); }
  function removeQuote(idx: number) { setHighlightQuotes(highlightQuotes.filter((_, i) => i !== idx)); }

  async function handleSubmit() {
    setError(null);
    if (!title.trim()) { setError('Título obrigatório.'); return; }
    const invalidCitation = bookCitations.find(c => !c.book_id);
    if (invalidCitation) { setError('Toda citação precisa de livro selecionado.'); return; }

    try {
      await onSave({
        id: lesson?.id,
        module_id: moduleId,
        title,
        description,
        order,
        video_url: videoUrl || undefined,
        video_duration_seconds: videoDuration,
        min_watch_percent: minWatchPercent,
        unlock_after_hours: unlockHours,
        apostila_content: apostila || undefined,
        requires_reflection: requiresReflection,
        requires_quiz: requiresQuiz,
        requires_forum_post: requiresForumPost,
        forum_prompt: requiresForumPost ? (forumPrompt || undefined) : undefined,
        requires_flashcards: requiresFlashcards,
        requires_case_study: requiresCaseStudy,
        requires_word_search: requiresWordSearch,
        requires_crossword: requiresCrossword,
        requires_mind_map: requiresMindMap,
        activity_order: activityOrder.length ? activityOrder : undefined,
        thumbnail_url: thumbnailUrl || undefined,
        book_citations: bookCitations.length ? bookCitations : undefined,
        highlight_quotes: highlightQuotes.filter(q => q.text.trim()),
        practical_activity: practical || undefined,
        practical_required: practical ? practicalRequired : undefined,
        practical_permanent: practical ? practicalPermanent : undefined,
        practical_deadline_days: practical && practicalDeadline > 0 ? practicalDeadline : undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <h2 className="text-base font-bold">{lesson ? 'Editar aula' : 'Nova aula'}</h2>
      </div>

      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

      {/* Meta */}
      <Section title="Informações da aula">
        <Field label="Título *">
          <input className="input input-bordered input-sm w-full" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: A oração do coração" />
        </Field>

        <Field label="Descrição (markdown)">
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Descreva o que o aluno vai aprender nessa aula..."
            height={140}
          />
        </Field>

        <Field label="Ordem">
          <input type="number" className="input input-bordered input-sm w-32" value={order} min={1} onChange={e => setOrder(Number(e.target.value) || 1)} />
        </Field>

        <Field label="Imagem ilustrativa (capa da aula)">
          <ImagePicker
            folder="formation/lesson-covers"
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
          />
        </Field>
      </Section>

      {/* Vídeo */}
      <Section
        title="Vídeo"
        icon={<Video className="w-4 h-4" />}
        action={
          <button
            type="button"
            className="btn btn-primary btn-sm gap-1"
            onClick={() => setVideoPickerOpen(true)}
          >
            <Youtube className="w-4 h-4" /> Buscar / enviar do YouTube
          </button>
        }
      >
        <Field label="URL do vídeo (YouTube ou MP4 direto)">
          <input
            type="url"
            className="input input-bordered input-sm w-full"
            value={videoUrl}
            placeholder="https://youtu.be/... ou cole URL"
            onChange={e => setVideoUrl(e.target.value)}
          />
          {videoSourceKind === 'youtube' && (
            <p className="text-[11px] text-base-content/60 mt-1 flex items-start gap-1">
              <Info className="w-3 h-3 mt-0.5 shrink-0" />
              YouTube detectado. Use &quot;Buscar / enviar&quot; pra autopreencher duração + título.
            </p>
          )}
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Duração">
            <div className="flex gap-1">
              <input
                type="text"
                className="input input-bordered input-sm flex-1 min-w-0"
                value={durationInput}
                placeholder="ex: 5:30"
                onChange={e => handleDurationInputChange(e.target.value)}
              />
              {videoSourceKind === 'file' && videoUrl && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleAutoDetect}
                  disabled={detectingDuration}
                  title="Detectar duração automaticamente"
                >
                  {detectingDuration ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Auto'}
                </button>
              )}
            </div>
            <p className="text-[10px] text-base-content/40 mt-1">
              {videoDuration > 0 ? `${videoDuration}s` : 'sem duração'}
            </p>
          </Field>

          <Field label="% mínimo assistido">
            <input type="number" className="input input-bordered input-sm w-full" value={minWatchPercent} min={0} max={100} onChange={e => setMinWatchPercent(Number(e.target.value) || 0)} />
          </Field>

          <Field label="Espera (horas após assistir)">
            <input type="number" className="input input-bordered input-sm w-full" value={unlockHours} min={0} onChange={e => setUnlockHours(Number(e.target.value) || 0)} />
          </Field>
        </div>
      </Section>

      {/* Apostila — composta por livros citados + intro opcional */}
      <Section
        title="Apostila"
        icon={<FileText className="w-4 h-4" />}
        action={
          <button type="button" className="btn btn-primary btn-sm gap-1" onClick={addCitation}>
            <Plus className="w-4 h-4" /> Adicionar livro
          </button>
        }
      >
        <p className="text-xs text-base-content/60 -mt-1">
          A apostila é formada pelos livros citados da biblioteca. Cada citação renderiza o
          trecho do livro inline para o aluno. Use intro/observações abaixo se quiser
          contextualizar antes dos livros.
        </p>

        <Field label="Introdução / observações (opcional, markdown)">
          <RichTextEditor
            value={apostila}
            onChange={setApostila}
            placeholder="Texto introdutório antes dos livros (opcional)..."
            height={140}
          />
        </Field>

        <div className="border-t border-base-300 pt-3">
          <h4 className="text-xs font-semibold mb-2 flex items-center gap-1">
            <BookMarked className="w-3.5 h-3.5" /> Livros desta apostila
          </h4>
          {bookCitations.length === 0 ? (
            <p className="text-xs text-base-content/60">
              Nenhum livro citado ainda. Clique em &quot;Adicionar livro&quot; acima.
            </p>
          ) : (
            <div className="space-y-3">
              {bookCitations.map((c, i) => (
                <CanonicalRefPicker
                  key={i}
                  citation={c}
                  onChange={updated => updateCitation(i, updated)}
                  onRemove={() => removeCitation(i)}
                />
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Citações destacadas */}
      <Section
        title="Citações destacadas"
        icon={<Quote className="w-4 h-4" />}
        action={
          <button type="button" className="btn btn-outline btn-xs gap-1" onClick={addQuote}>
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        }
      >
        {highlightQuotes.length === 0 ? (
          <p className="text-xs text-base-content/60">Frases curtas (ex: santos, autores).</p>
        ) : (
          <ul className="space-y-2">
            {highlightQuotes.map((q, i) => (
              <li key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-2">
                  <input className="input input-bordered input-sm" value={q.text} placeholder="Texto da citação" onChange={e => updateQuote(i, { ...q, text: e.target.value })} />
                  <input className="input input-bordered input-sm" value={q.source} placeholder="Fonte (autor, livro)" onChange={e => updateQuote(i, { ...q, source: e.target.value })} />
                </div>
                <button type="button" className="btn btn-ghost btn-sm shrink-0" onClick={() => removeQuote(i)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Atividades */}
      <Section title="Atividades para concluir a aula" icon={<Award className="w-4 h-4" />}>
        <p className="text-xs text-base-content/60">
          Marque o que o aluno precisa completar pra avançar. O checklist de progresso é sempre obrigatório.
        </p>

        <ActivityToggle
          icon={<PenLine className="w-4 h-4" />}
          label="Reflexão no caderno espiritual"
          description="Aluno escreve reflexão pessoal e marca como enviada"
          checked={requiresReflection}
          onChange={setRequiresReflection}
        />

        <ActivityToggle
          icon={<MessageSquare className="w-4 h-4" />}
          label="Postar no fórum"
          description="Aluno precisa criar pelo menos um post no fórum da aula"
          checked={requiresForumPost}
          onChange={setRequiresForumPost}
        />
        {requiresForumPost && (
          <div className="ml-6 mt-3">
            <Field label="Mural / pergunta para os alunos (markdown)">
              <RichTextEditor
                value={forumPrompt}
                onChange={setForumPrompt}
                placeholder="Ex: Como você aplicou essa aula na sua semana? Compartilhe sua experiência."
                height={120}
              />
            </Field>
          </div>
        )}
      </Section>

      {/* Atividades interativas — Quiz, Flashcards, Case Study, Word Search, Crossword, Mind Map */}
      <Section title="Atividades interativas" icon={<Award className="w-4 h-4" />}>
        <p className="text-xs text-base-content/60">
          Marque obrigatórias e clique em &quot;Editar&quot; pra criar/editar a atividade.
        </p>
        <ActivityManager
          lessonId={lesson?.id ?? null}
          createdBy={user?.id ?? ''}
          flags={{
            requires_quiz: requiresQuiz,
            requires_flashcards: requiresFlashcards,
            requires_case_study: requiresCaseStudy,
            requires_word_search: requiresWordSearch,
            requires_crossword: requiresCrossword,
            requires_mind_map: requiresMindMap,
          }}
          order={activityOrder}
          onChange={patch => {
            if (patch.requires_quiz !== undefined) setRequiresQuiz(patch.requires_quiz);
            if (patch.requires_flashcards !== undefined) setRequiresFlashcards(patch.requires_flashcards);
            if (patch.requires_case_study !== undefined) setRequiresCaseStudy(patch.requires_case_study);
            if (patch.requires_word_search !== undefined) setRequiresWordSearch(patch.requires_word_search);
            if (patch.requires_crossword !== undefined) setRequiresCrossword(patch.requires_crossword);
            if (patch.requires_mind_map !== undefined) setRequiresMindMap(patch.requires_mind_map);
          }}
          onOrderChange={setActivityOrder}
        />
      </Section>

      {/* Atividade prática */}
      <Section title="Atividade prática" icon={<Activity className="w-4 h-4" />}>
        <Field label="Descrição (markdown)">
          <RichTextEditor
            value={practical}
            onChange={setPractical}
            placeholder="Ex: Faça 10 minutos de oração silenciosa hoje..."
            height={140}
          />
        </Field>

        {practical && (
          <>
            <ActivityToggle
              icon={<Award className="w-4 h-4" />}
              label="Obrigatória"
              description="Aluno precisa marcar como feita pra avançar"
              checked={practicalRequired}
              onChange={setPracticalRequired}
            />

            <ActivityToggle
              icon={<Activity className="w-4 h-4" />}
              label="Permanente (vira hábito recorrente)"
              description="Aparece em 'Minha Jornada' como tarefa diária após desbloqueio"
              checked={practicalPermanent}
              onChange={setPracticalPermanent}
            />

            {practicalRequired && !practicalPermanent && (
              <Field label="Prazo em dias após desbloqueio (0 = sem prazo)">
                <input
                  type="number"
                  className="input input-bordered input-sm w-32"
                  value={practicalDeadline}
                  min={0}
                  onChange={e => setPracticalDeadline(Number(e.target.value) || 0)}
                />
              </Field>
            )}
          </>
        )}
      </Section>

      <div className="flex justify-end gap-2 sticky bottom-0 bg-base-200/95 backdrop-blur p-3 -mx-3 border-t border-base-300 z-10">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancelar</button>
        <button type="button" className="btn btn-primary btn-sm gap-1" onClick={handleSubmit} disabled={saving || !title.trim()}>
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar aula'}
        </button>
      </div>

      {videoPickerOpen && (
        <VideoPickerModal
          onClose={() => setVideoPickerOpen(false)}
          onPick={picked => {
            setVideoUrl(picked.url);
            if (picked.durationSeconds > 0) {
              setVideoDuration(picked.durationSeconds);
              setDurationInput(formatDuration(picked.durationSeconds));
            }
            // Auto-fill title if empty
            if (!title.trim() && picked.title) setTitle(picked.title);
          }}
        />
      )}
    </div>
  );
}

// ─── Layout helpers ────────────────────────────────────────────────────────

function Section({ title, icon, action, children }: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4 md:p-5 gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            {icon}{title}
          </h3>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children, extraClass = '' }: { label: string; children: React.ReactNode; extraClass?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${extraClass}`}>
      <span className="label-text text-xs font-medium text-base-content/80">{label}</span>
      {children}
    </div>
  );
}

interface ActivityToggleProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ActivityToggle({ icon, label, description, checked, onChange }: ActivityToggleProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-base-200 border border-transparent hover:border-base-300 transition-colors">
      <input
        type="checkbox"
        className="checkbox checkbox-sm checkbox-primary mt-0.5 shrink-0"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium">{icon}{label}</div>
        <p className="text-xs text-base-content/60 mt-0.5">{description}</p>
      </div>
    </label>
  );
}
