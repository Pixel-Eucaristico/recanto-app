'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';
import type { Book, BookChapter } from '@/domain/library/types';
import type { LessonBookCitation } from '@/domain/formation/types';
import { libraryService } from '@/application/library/LibraryService';
import { CanonicalRefEntity } from '@/domain/library/entities/CanonicalRef';

interface CanonicalRefPickerProps {
  citation: LessonBookCitation;
  onChange: (citation: LessonBookCitation) => void;
  onRemove?: () => void;
}

export function CanonicalRefPicker({ citation, onChange, onRemove }: CanonicalRefPickerProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<BookChapter[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load published books once
  useEffect(() => {
    libraryService.listCatalog({ onlyPublished: true })
      .then(setBooks)
      .catch(e => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoadingBooks(false));
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

        {/* Book selector */}
        <label className="form-control">
          <span className="label-text text-xs mb-1">Livro *</span>
          <select
            className="select select-bordered select-sm"
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
        </label>

        {citation.book_id && loadingChapters && (
          <div className="text-xs text-base-content/60">Carregando capítulos...</div>
        )}

        {/* Ref range */}
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

  function commit(ch: number | null, par: string) {
    if (ch === null) { onChange(''); return; }
    const trimmed = par.trim();
    onChange(trimmed ? `${ch}:${trimmed}` : `${ch}`);
  }

  const activeChapter = chapter !== null ? chapters.find(c => c.order === chapter) : undefined;
  const maxParagraph = activeChapter
    ? activeChapter.blocks.filter(b => b.kind === 'paragraph' || b.kind === 'quote').length
    : 0;

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
            commit(c, paragraph);
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
          className="input input-bordered input-sm w-20"
          value={paragraph}
          placeholder="¶"
          min={1}
          max={maxParagraph || undefined}
          onChange={e => {
            setParagraph(e.target.value);
            commit(chapter, e.target.value);
          }}
        />
      </div>
      {activeChapter && (
        <p className="text-[10px] text-base-content/40 mt-0.5">
          {maxParagraph} parágrafos numerados ({chapter}:1–{chapter}:{maxParagraph})
        </p>
      )}
    </div>
  );
}
