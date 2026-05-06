'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, AlertCircle, Plus, X, Save, ArrowLeft, Check, Pencil } from 'lucide-react';
import type { Book, BookChapter } from '@/domain/library/types';
import type { LessonBookCitation } from '@/domain/formation/types';
import { libraryService } from '@/application/library/LibraryService';
import { CanonicalRefEntity } from '@/domain/library/entities/CanonicalRef';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { ChapterListPanel } from '@/features/library/components/ChapterListPanel';
import { ChapterEditor } from '@/features/library/components/ChapterEditor';
import { useBookChapters } from '@/features/library/hooks/useBookChapters';
import ImageUpload from '@/components/cms-editor/ImageUpload';
import { RichTextEditor } from '@/shared/components/RichTextEditor';

interface CanonicalRefPickerProps {
  citation: LessonBookCitation;
  onChange: (citation: LessonBookCitation) => void;
  onRemove?: () => void;
}

export function CanonicalRefPicker({ citation, onChange, onRemove }: CanonicalRefPickerProps) {
  const user = useCurrentUser();
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<BookChapter[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [chapterEditorOpen, setChapterEditorOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<BookChapter | null>(null);
  const [bookEditorOpen, setBookEditorOpen] = useState(false);

  function reloadBooks() {
    setLoadingBooks(true);
    return libraryService.listCatalog({ onlyPublished: false })
      .then(list => {
        setBooks(list);
        return list;
      })
      .finally(() => setLoadingBooks(false));
  }

  // Load all books once (admin context — não filtra por publicado)
  useEffect(() => {
    reloadBooks().catch(e => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  // Load chapters when book changes
  useEffect(() => {
    if (!citation.book_id) { setChapters([]); return; }
    setLoadingChapters(true);
    libraryService.listChapters(citation.book_id)
      .then(setChapters)
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoadingChapters(false));
  }, [citation.book_id]);

  const activeBook = books.find(b => b.id === citation.book_id);

  // Sort chapters by order, only `chapter` kind for ref picking
  const bodyChapters = useMemo(
    () => [...chapters]
      .filter(c => (c.kind ?? 'chapter') === 'chapter')
      .sort((a, b) => a.order - b.order),
    [chapters],
  );

  const startParsed = CanonicalRefEntity.tryParse(citation.start_ref);
  const endParsed = CanonicalRefEntity.tryParse(citation.end_ref);

  // Validation: end must be >= start
  const rangeError = startParsed && endParsed && CanonicalRefEntity.compare(startParsed, endParsed) > 0
    ? 'O fim do trecho não pode ser anterior ao início.'
    : null;

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body p-4 gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Citar livro</span>
          </div>
          {onRemove && (
            <button type="button" className="btn btn-ghost btn-xs text-error" onClick={onRemove}>
              Remover citação
            </button>
          )}
        </div>

        {error && <div className="alert alert-error text-xs"><span>{error}</span></div>}

        {/* Book selector + create */}
        <div className="flex flex-col gap-1.5">
          <span className="label-text text-xs font-medium">Livro *</span>
          <div className="flex gap-1 flex-wrap sm:flex-nowrap">
            <select
              className="select select-bordered select-sm flex-1 min-w-0"
              value={citation.book_id}
              onChange={e => onChange({ ...citation, book_id: e.target.value, start_ref: undefined, end_ref: undefined, until_ref: undefined })}
              disabled={loadingBooks}
            >
              <option value="">— escolha um livro —</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>
                  {b.title}{b.author ? ` — ${b.author}` : ''}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-outline btn-sm gap-1"
              onClick={() => setCreateOpen(true)}
              disabled={!user}
              title="Criar novo livro"
            >
              <Plus className="w-3.5 h-3.5" /> Livro
            </button>
            {citation.book_id && (
              <>
                <button
                  type="button"
                  className="btn btn-outline btn-sm gap-1"
                  onClick={() => setChapterEditorOpen(true)}
                  disabled={!user}
                  title="Adicionar capítulo a este livro"
                >
                  <Plus className="w-3.5 h-3.5" /> Capítulo
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm gap-1"
                  onClick={() => setBookEditorOpen(true)}
                  disabled={!user}
                  title="Editar metadados do livro"
                >
                  <Pencil className="w-3.5 h-3.5" /> Livro
                </button>
              </>
            )}
          </div>
        </div>

        {citation.book_id && loadingChapters && (
          <div className="text-xs text-base-content/60">Carregando capítulos...</div>
        )}

        {/* Ref range — PRIMEIRO (acima da lista) */}
        {citation.book_id && bodyChapters.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <RefField
              label="Início (capítulo:parágrafo)"
              value={citation.start_ref ?? ''}
              chapters={bodyChapters}
              onChange={v => onChange({ ...citation, start_ref: v || undefined })}
              placeholder="ex: 1 ou 1:5"
            />
            <RefField
              label="Fim (capítulo:parágrafo)"
              value={citation.end_ref ?? ''}
              chapters={bodyChapters}
              onChange={v => onChange({ ...citation, end_ref: v || undefined })}
              placeholder="ex: 1:12"
            />
          </div>
        )}

        {/* Lista de capítulos — só os que estão DENTRO da seleção exata */}
        {citation.book_id && !loadingChapters && bodyChapters.length > 0 && (startParsed || endParsed) && (() => {
          // Lógica precisa: se só start, mostra a partir dele; se só end, até ele;
          // se ambos, range; mas SEM defaults pra primeiro/último chapter (evita listar tudo)
          let inRange: BookChapter[] = [];
          let label = '';
          if (startParsed && endParsed) {
            inRange = bodyChapters.filter(c => c.order >= startParsed.chapter && c.order <= endParsed.chapter);
            label = startParsed.chapter !== endParsed.chapter
              ? `Cap. ${startParsed.chapter}–${endParsed.chapter}`
              : `Cap. ${startParsed.chapter}`;
          } else if (startParsed) {
            // Só início: mostra apenas o capítulo de início
            inRange = bodyChapters.filter(c => c.order === startParsed.chapter);
            label = `Cap. ${startParsed.chapter} (defina o fim pra ver mais)`;
          } else if (endParsed) {
            // Só fim: mostra apenas o capítulo de fim
            inRange = bodyChapters.filter(c => c.order === endParsed.chapter);
            label = `Cap. ${endParsed.chapter} (defina o início pra ver mais)`;
          }
          if (inRange.length === 0) return null;
          return (
            <div className="text-xs">
              <p className="font-medium text-base-content/70 py-1">
                {inRange.length} capítulo{inRange.length === 1 ? '' : 's'} ({label}) — lápis edita texto
              </p>
              <ul className="mt-1 space-y-1">
                {inRange.map(c => (
                  <li key={c.id} className="flex items-center gap-2 p-1.5 rounded bg-base-200/40">
                    <span className="badge badge-outline badge-xs shrink-0">Cap. {c.order}</span>
                    <span className="flex-1 truncate text-sm">{c.title}</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => { setEditingChapter(c); setChapterEditorOpen(true); }}
                      title="Editar capítulo"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

        {rangeError && (
          <div className="alert alert-warning text-xs gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>{rangeError}</span>
          </div>
        )}

        {/* Spoiler gate */}
        <label className="cursor-pointer flex items-center gap-2">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={citation.apply_spoiler ?? false}
            onChange={e => onChange({
              ...citation,
              apply_spoiler: e.target.checked || undefined,
              until_ref: e.target.checked ? (citation.until_ref ?? citation.end_ref) : undefined,
            })}
          />
          <span className="text-xs">
            Aplicar gate de spoiler — só libera o livro até o fim do trecho enquanto a aula não for concluída
          </span>
        </label>

        {/* Until ref (only if spoiler gate active) */}
        {citation.apply_spoiler && (
          <RefField
            label="Liberar até (default = fim do trecho)"
            value={citation.until_ref ?? ''}
            chapters={bodyChapters}
            onChange={v => onChange({ ...citation, until_ref: v || undefined })}
            placeholder={citation.end_ref ?? 'ex: 3:18'}
          />
        )}

        {/* Optional note */}
        <label className="form-control">
          <span className="label-text text-xs mb-1">Nota do formador (opcional, exibida acima do trecho)</span>
          <input
            className="input input-bordered input-sm"
            value={citation.note ?? ''}
            placeholder="ex: Leia atentamente — base para a reflexão de hoje"
            onChange={e => onChange({ ...citation, note: e.target.value || undefined })}
          />
        </label>

        {/* Preview ref */}
        {activeBook && (citation.start_ref || citation.end_ref) && (
          <p className="text-[11px] text-base-content/60">
            Trecho: <code className="bg-base-200 px-1 rounded">{citation.start_ref ?? 'início'}</code>
            {' → '}
            <code className="bg-base-200 px-1 rounded">{citation.end_ref ?? 'fim'}</code>
            {' de '}<strong>{activeBook.title}</strong>
          </p>
        )}
      </div>

      {createOpen && user && (
        <QuickBookCreateModal
          userId={user.id}
          book={null}
          onClose={() => setCreateOpen(false)}
          onSaved={async newBook => {
            await reloadBooks();
            onChange({ ...citation, book_id: newBook.id, start_ref: undefined, end_ref: undefined, until_ref: undefined });
            setCreateOpen(false);
          }}
        />
      )}

      {bookEditorOpen && user && activeBook && (
        <QuickBookCreateModal
          userId={user.id}
          book={activeBook}
          onClose={() => setBookEditorOpen(false)}
          onSaved={async () => {
            await reloadBooks();
            setBookEditorOpen(false);
          }}
        />
      )}

      {chapterEditorOpen && citation.book_id && activeBook && (
        <AddChapterModal
          bookId={citation.book_id}
          bookTitle={activeBook.title}
          chapter={editingChapter}
          onClose={() => { setChapterEditorOpen(false); setEditingChapter(null); }}
          onSaved={savedChapter => {
            libraryService.listChapters(citation.book_id).then(setChapters);
            // Se foi novo (sem editingChapter), aponta start_ref pro cap recém-criado
            if (!editingChapter) {
              onChange({ ...citation, start_ref: `${savedChapter.order}:1` });
            }
            setChapterEditorOpen(false);
            setEditingChapter(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Chapter Editor modal — cria novo OU edita existente ───────────────────

interface AddChapterModalProps {
  bookId: string;
  bookTitle: string;
  /** Quando definido, edita o capítulo. Null = criar novo. */
  chapter: BookChapter | null;
  onClose: () => void;
  onSaved: (chapter: BookChapter) => void;
}

function AddChapterModal({ bookId, bookTitle, chapter, onClose, onSaved }: AddChapterModalProps) {
  const chaptersAdmin = useBookChapters(bookId);
  const defaultOrder = chaptersAdmin.chapters.length + 1;

  async function handleSave(input: Parameters<typeof chaptersAdmin.saveChapter>[0]) {
    const saved = await chaptersAdmin.saveChapter(input);
    onSaved(saved);
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-none sm:max-w-4xl w-full h-[100dvh] sm:h-auto sm:max-h-[95vh] rounded-none sm:rounded-2xl flex flex-col p-0">
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
            <h3 className="font-bold text-sm sm:text-base truncate">
              {chapter ? `Editar capítulo ${chapter.order}` : 'Novo capítulo'} em &quot;{bookTitle}&quot;
            </h3>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-3 sm:p-5">
          <ChapterEditor
            bookId={bookId}
            chapter={chapter}
            defaultOrder={defaultOrder}
            saving={chaptersAdmin.saving}
            onSave={handleSave}
            onCancel={onClose}
          />
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

// ─── Quick book creation modal — 3 steps: book → chapters list → chapter editor ──

interface QuickBookCreateModalProps {
  userId: string;
  /** Quando definido, modal abre em modo edição (preload + update). Null = criar novo. */
  book: Book | null;
  onClose: () => void;
  onSaved: (book: Book) => Promise<void>;
}

type Step = 'book' | 'chapters' | 'chapter-edit';

function QuickBookCreateModal({ userId, book, onClose, onSaved }: QuickBookCreateModalProps) {
  const isEdit = !!book;
  const [step, setStep] = useState<Step>('book');
  const [createdBook, setCreatedBook] = useState<Book | null>(book);
  const [activeChapter, setActiveChapter] = useState<BookChapter | null>(null);

  // Book form state — preload se editando
  const [title, setTitle] = useState(book?.title ?? '');
  const [author, setAuthor] = useState(book?.author ?? '');
  const [language, setLanguage] = useState(book?.language ?? 'pt');
  const [coverUrl, setCoverUrl] = useState(book?.cover_url ?? '');
  const [backCoverUrl, setBackCoverUrl] = useState(book?.back_cover_url ?? '');
  const [description, setDescription] = useState(book?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const chaptersAdmin = useBookChapters(createdBook?.id ?? null);

  async function handleSaveBook() {
    setErr(null);
    if (!title.trim()) { setErr('Título obrigatório.'); return; }
    setSaving(true);
    try {
      const saved = await libraryService.saveBook({
        id: book?.id,
        title: title.trim(),
        author: author.trim() || undefined,
        language: language || 'pt',
        description: description.trim() || undefined,
        cover_url: coverUrl || undefined,
        back_cover_url: backCoverUrl || undefined,
        is_published: book?.is_published ?? false,
        spoiler_mode: book?.spoiler_mode ?? 'open',
        created_by: book?.created_by ?? userId,
      });
      setCreatedBook(saved);
      // Edit mode salva e fecha; create mode segue pra capítulos
      if (isEdit) {
        await onSaved(saved);
      } else {
        setStep('chapters');
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveChapter(input: Parameters<typeof chaptersAdmin.saveChapter>[0]) {
    await chaptersAdmin.saveChapter(input);
    setStep('chapters');
    setActiveChapter(null);
  }

  async function handleFinish() {
    if (createdBook) await onSaved(createdBook);
    onClose();
  }

  // Modal width adapts based on step
  const widthClass = step === 'chapter-edit' ? 'max-w-4xl' : (step === 'chapters' ? 'max-w-2xl' : 'max-w-md');

  return (
    <div className="modal modal-open">
      <div className={`modal-box ${widthClass} max-h-[95vh] flex flex-col`}>
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            {step !== 'book' && (
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => {
                  if (step === 'chapter-edit') { setStep('chapters'); setActiveChapter(null); }
                  // 'chapters' step não volta ao 'book' — livro já foi criado
                }}
                disabled={step === 'chapters'}
                title={step === 'chapter-edit' ? 'Voltar ao índice' : ''}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h3 className="font-bold text-base">
              {step === 'book' && (isEdit ? `Editar livro` : 'Novo livro (rápido)')}
              {step === 'chapters' && `Capítulos de "${createdBook?.title}"`}
              {step === 'chapter-edit' && (activeChapter ? 'Editar capítulo' : 'Novo capítulo')}
            </h3>
          </div>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {step === 'book' && (
            <div className="space-y-3">
              <p className="text-xs text-base-content/60">
                {isEdit
                  ? 'Edite metadados básicos do livro. Para mais opções (capa, categorias, etc.), use Gerenciar biblioteca.'
                  : 'Cria um livro rascunho. Após salvar, você pode adicionar capítulos com texto da apostila.'}
              </p>

              {err && <div className="alert alert-error text-sm"><span>{err}</span></div>}

              <div className="flex flex-col gap-1.5">
                <span className="label-text text-xs font-medium">Título *</span>
                <input
                  className="input input-bordered input-sm"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Filoteia"
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="label-text text-xs font-medium">Autor</span>
                <input
                  className="input input-bordered input-sm"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="Ex: São Francisco de Sales"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="label-text text-xs font-medium">Idioma</span>
                <select className="select select-bordered select-sm" value={language} onChange={e => setLanguage(e.target.value)}>
                  <option value="pt">Português</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="it">Italiano</option>
                  <option value="la">Latim</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ImageUpload
                  label="Capa (opcional)"
                  folder="library/covers"
                  value={coverUrl}
                  onChange={url => setCoverUrl(url || '')}
                />
                <ImageUpload
                  label="Contracapa (opcional)"
                  folder="library/covers"
                  value={backCoverUrl}
                  onChange={url => setBackCoverUrl(url || '')}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="label-text text-xs font-medium">Descrição (opcional)</span>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Escreva um resumo curto do livro. Use os botões da barra pra formatar."
                  height={140}
                />
              </div>
            </div>
          )}

          {step === 'chapters' && createdBook && (
            <div className="space-y-3">
              <div className="alert alert-success text-sm">
                <Check className="w-4 h-4" />
                <span>Livro &quot;{createdBook.title}&quot; criado! Adicione capítulos com o texto da apostila ou conclua e adicione depois.</span>
              </div>

              <ChapterListPanel
                chapters={chaptersAdmin.chapters}
                onCreate={() => { setActiveChapter(null); setStep('chapter-edit'); }}
                onEdit={ch => { setActiveChapter(ch); setStep('chapter-edit'); }}
                onDelete={ch => chaptersAdmin.deleteChapter(ch.order)}
              />
            </div>
          )}

          {step === 'chapter-edit' && createdBook && (
            <ChapterEditor
              bookId={createdBook.id}
              chapter={activeChapter}
              defaultOrder={chaptersAdmin.chapters.length + 1}
              saving={chaptersAdmin.saving}
              onSave={handleSaveChapter}
              onCancel={() => { setStep('chapters'); setActiveChapter(null); }}
            />
          )}
        </div>

        <div className="modal-action shrink-0 mt-3">
          {step === 'book' && (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={saving}>Cancelar</button>
              <button
                type="button"
                className="btn btn-primary btn-sm gap-1"
                onClick={handleSaveBook}
                disabled={saving || !title.trim()}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : (isEdit ? 'Salvar livro' : 'Criar e adicionar capítulos')}
              </button>
            </>
          )}
          {step === 'chapters' && (
            <button type="button" className="btn btn-primary btn-sm gap-1" onClick={handleFinish}>
              <Check className="w-4 h-4" /> Concluir e usar livro
            </button>
          )}
        </div>
      </div>
      <div className="modal-backdrop" onClick={step === 'chapter-edit' ? () => {} : onClose} />
    </div>
  );
}

interface RefFieldProps {
  label: string;
  value: string;
  chapters: BookChapter[];
  onChange: (v: string) => void;
  placeholder?: string;
}

/**
 * Two-step ref picker: chapter dropdown + paragraph number input.
 * Stores combined `chapter:paragraph` (or just `chapter`) in `value`.
 */
function RefField({ label, value, chapters, onChange, placeholder }: RefFieldProps) {
  const parsed = CanonicalRefEntity.tryParse(value);
  const [chapter, setChapter] = useState<number | null>(parsed?.chapter ?? null);
  const [paragraph, setParagraph] = useState<string>(parsed?.paragraph?.toString() ?? '');

  useEffect(() => {
    const p = CanonicalRefEntity.tryParse(value);
    setChapter(p?.chapter ?? null);
    setParagraph(p?.paragraph?.toString() ?? '');
  }, [value]);

  const activeChapter = chapter !== null ? chapters.find(c => c.order === chapter) : undefined;
  const maxParagraph = activeChapter
    ? activeChapter.blocks.filter(b => b.kind === 'paragraph' || b.kind === 'quote').length
    : 0;

  function commit(ch: number | null, par: string) {
    if (ch === null) { onChange(''); return; }
    const trimmed = par.trim();
    if (!trimmed) { onChange(`${ch}`); return; }
    // Clamp 1..maxParagraph
    const n = Math.max(1, Math.min(maxParagraph || 1, Number(trimmed) || 1));
    onChange(`${ch}:${n}`);
  }

  function handleParagraphChange(raw: string) {
    if (!raw) { setParagraph(''); commit(chapter, ''); return; }
    const n = Math.max(1, Math.min(maxParagraph || 1, Number(raw) || 1));
    const clamped = String(n);
    setParagraph(clamped);
    commit(chapter, clamped);
  }

  const overLimit = paragraph !== '' && Number(paragraph) > maxParagraph && maxParagraph > 0;

  return (
    <div>
      <span className="label-text text-xs mb-1 block">{label}</span>
      <div className="flex gap-1">
        <select
          className="select select-bordered select-sm flex-1"
          value={chapter ?? ''}
          onChange={e => {
            const c = e.target.value ? Number(e.target.value) : null;
            setChapter(c);
            // Reset paragraph se exceder novo chapter
            const newCh = c !== null ? chapters.find(x => x.order === c) : undefined;
            const newMax = newCh ? newCh.blocks.filter(b => b.kind === 'paragraph' || b.kind === 'quote').length : 0;
            const currentP = Number(paragraph);
            if (currentP > newMax && newMax > 0) {
              const clamped = String(newMax);
              setParagraph(clamped);
              commit(c, clamped);
            } else {
              commit(c, paragraph);
            }
          }}
        >
          <option value="">— cap —</option>
          {chapters.map(c => (
            <option key={c.id} value={c.order}>
              Cap. {c.order}: {c.title}
            </option>
          ))}
        </select>
        <input
          type="number"
          className={`input input-bordered input-sm w-20 ${overLimit ? 'input-error' : ''}`}
          value={paragraph}
          placeholder="¶"
          min={1}
          max={maxParagraph || undefined}
          disabled={chapter === null}
          onChange={e => handleParagraphChange(e.target.value)}
        />
      </div>
      {activeChapter && (
        <p className={`text-[10px] mt-0.5 ${overLimit ? 'text-error' : 'text-base-content/40'}`}>
          {maxParagraph} parágrafo{maxParagraph === 1 ? '' : 's'} no cap. {chapter} ({chapter}:1–{chapter}:{maxParagraph || 1})
        </p>
      )}
    </div>
  );
}
