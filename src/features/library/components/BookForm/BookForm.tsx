'use client';

import { useState, useEffect } from 'react';
import { Save, X, ImagePlus } from 'lucide-react';
import { Book, BookCategory, BookSpoilerMode } from '@/domain/library/types';
import { MarkdownField } from '@/shared/components/MarkdownField';
import { MediaUpload } from '@/shared/components/MediaUpload';

interface BookFormProps {
  book: Book | null; // null = criar novo
  categories: BookCategory[];
  saving: boolean;
  userId: string;
  onSave: (input: BookFormState) => Promise<void>;
  onCancel: () => void;
}

export interface BookFormState {
  id?: string;
  title: string;
  subtitle: string;
  author: string;
  language: string;
  description: string;
  cover_url: string;
  back_cover_url: string;
  category_ids: string[];
  tags: string;
  isbn: string;
  edition: string;
  year: string;
  is_published: boolean;
  spoiler_mode: BookSpoilerMode;
  created_by: string;
}

export function BookForm({ book, categories, saving, userId, onSave, onCancel }: BookFormProps) {
  const [form, setForm] = useState<BookFormState>(() => ({
    id: book?.id,
    title: book?.title ?? '',
    subtitle: book?.subtitle ?? '',
    author: book?.author ?? '',
    language: book?.language ?? 'pt',
    description: book?.description ?? '',
    cover_url: book?.cover_url ?? '',
    back_cover_url: book?.back_cover_url ?? '',
    category_ids: book?.category_ids ?? [],
    tags: (book?.tags ?? []).join(', '),
    isbn: book?.isbn ?? '',
    edition: book?.edition ?? '',
    year: book?.year ? String(book.year) : '',
    is_published: book?.is_published ?? false,
    spoiler_mode: book?.spoiler_mode ?? 'open',
    created_by: book?.created_by ?? userId,
  }));

  useEffect(() => {
    setForm({
      id: book?.id,
      title: book?.title ?? '',
      subtitle: book?.subtitle ?? '',
      author: book?.author ?? '',
      language: book?.language ?? 'pt',
      description: book?.description ?? '',
      cover_url: book?.cover_url ?? '',
      back_cover_url: book?.back_cover_url ?? '',
      category_ids: book?.category_ids ?? [],
      tags: (book?.tags ?? []).join(', '),
      isbn: book?.isbn ?? '',
      edition: book?.edition ?? '',
      year: book?.year ? String(book.year) : '',
      is_published: book?.is_published ?? false,
      spoiler_mode: book?.spoiler_mode ?? 'open',
      created_by: book?.created_by ?? userId,
    });
  }, [book, userId]);

  function toggleCategory(id: string) {
    setForm(f => ({
      ...f,
      category_ids: f.category_ids.includes(id)
        ? f.category_ids.filter(x => x !== id)
        : [...f.category_ids, id],
    }));
  }

  async function handleSubmit() {
    await onSave(form);
  }

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-base-content">
            {book ? 'Editar livro' : 'Novo livro'}
          </h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="form-control md:col-span-2">
            <span className="label-text text-xs mb-1">Título *</span>
            <input
              className="input input-bordered input-sm"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </label>

          <label className="form-control md:col-span-2">
            <span className="label-text text-xs mb-1">Subtítulo</span>
            <input
              className="input input-bordered input-sm"
              value={form.subtitle}
              onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
            />
          </label>

          <label className="form-control">
            <span className="label-text text-xs mb-1">Autor</span>
            <input
              className="input input-bordered input-sm"
              value={form.author}
              onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
            />
          </label>

          <label className="form-control">
            <span className="label-text text-xs mb-1">Idioma</span>
            <select
              className="select select-bordered select-sm"
              value={form.language}
              onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
            >
              <option value="pt">Português</option>
              <option value="en">Inglês</option>
              <option value="es">Espanhol</option>
              <option value="la">Latim</option>
            </select>
          </label>

          <label className="form-control">
            <span className="label-text text-xs mb-1">ISBN</span>
            <input
              className="input input-bordered input-sm"
              value={form.isbn}
              onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))}
            />
          </label>

          <label className="form-control">
            <span className="label-text text-xs mb-1">Edição</span>
            <input
              className="input input-bordered input-sm"
              value={form.edition}
              onChange={e => setForm(f => ({ ...f, edition: e.target.value }))}
            />
          </label>

          <label className="form-control">
            <span className="label-text text-xs mb-1">Ano</span>
            <input
              type="number"
              className="input input-bordered input-sm"
              value={form.year}
              onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
            />
          </label>

          <label className="form-control">
            <span className="label-text text-xs mb-1">Tags (separadas por vírgula)</span>
            <input
              className="input input-bordered input-sm"
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="ex: oração, ascética, espiritualidade"
            />
          </label>
        </div>

        <label className="form-control">
          <span className="label-text text-xs mb-1">Descrição (Markdown)</span>
          <MarkdownField
            value={form.description}
            onChange={v => setForm(f => ({ ...f, description: v }))}
            height={120}
            preview="edit"
          />
        </label>

        {/* Capas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <CoverUploader
            label="Capa frontal"
            url={form.cover_url}
            folder="library/covers"
            onUploaded={url => setForm(f => ({ ...f, cover_url: url }))}
            onClear={() => setForm(f => ({ ...f, cover_url: '' }))}
          />
          <CoverUploader
            label="Contracapa"
            url={form.back_cover_url}
            folder="library/covers"
            onUploaded={url => setForm(f => ({ ...f, back_cover_url: url }))}
            onClear={() => setForm(f => ({ ...f, back_cover_url: '' }))}
          />
        </div>

        {/* Categorias */}
        <div className="form-control">
          <span className="label-text text-xs mb-1">Categorias</span>
          {categories.length === 0 ? (
            <p className="text-xs text-base-content/60">Nenhuma categoria cadastrada ainda.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <label key={c.id} className="label cursor-pointer gap-1 py-0">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs"
                    checked={form.category_ids.includes(c.id)}
                    onChange={() => toggleCategory(c.id)}
                  />
                  <span className="label-text text-xs">{c.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Spoiler mode + publish */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="form-control">
            <span className="label-text text-xs mb-1">Modo de spoiler</span>
            <select
              className="select select-bordered select-sm"
              value={form.spoiler_mode}
              onChange={e => setForm(f => ({ ...f, spoiler_mode: e.target.value as BookSpoilerMode }))}
            >
              <option value="open">Aberto — leitura integral</option>
              <option value="progressive">Progressivo — corta por aulas concluídas</option>
            </select>
            <span className="text-[10px] text-base-content/50 mt-1">
              {form.spoiler_mode === 'open'
                ? 'Qualquer aluno autenticado lê e baixa o livro completo.'
                : 'Aluno só lê/baixa até o limite definido pelas aulas que cita o livro com apply_spoiler=true.'}
            </span>
          </label>

          <label className="label cursor-pointer justify-start gap-2 py-0 mt-6 md:mt-7">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={form.is_published}
              onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))}
            />
            <span className="label-text text-xs">Publicado (visível no catálogo)</span>
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancelar</button>
          <button
            className="btn btn-primary btn-sm gap-1"
            onClick={handleSubmit}
            disabled={saving || form.title.trim().length === 0}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CoverUploader({
  label,
  url,
  folder,
  onUploaded,
  onClear,
}: {
  label: string;
  url: string;
  folder: string;
  onUploaded: (url: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="form-control">
      <span className="label-text text-xs mb-1">{label}</span>
      {url ? (
        <div className="relative aspect-[2/3] max-w-[140px] rounded-lg overflow-hidden border border-base-300">
          <img src={url} alt={label} className="w-full h-full object-cover" />
          <button
            type="button"
            className="btn btn-circle btn-xs btn-error absolute top-1 right-1"
            onClick={onClear}
            aria-label="Remover"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-base-300 p-3">
          <div className="flex items-center gap-2 mb-2 text-xs text-base-content/60">
            <ImagePlus className="w-4 h-4" />
            Sem imagem
          </div>
          <MediaUpload
            accept="image"
            folder={folder}
            onUploaded={asset => onUploaded(asset.url)}
          />
        </div>
      )}
    </div>
  );
}
