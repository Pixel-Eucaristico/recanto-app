'use client';

import { Save, X } from 'lucide-react';
import type { Book, BookCategory, BookSpoilerMode } from '@/domain/library/types';
import { MarkdownField } from '@/shared/components/MarkdownField';
import { CoverUploader } from './components/CoverUploader';
import { useBookForm, type BookFormState } from './hooks/useBookForm';

interface BookFormProps {
  book: Book | null;
  categories: BookCategory[];
  saving: boolean;
  userId: string;
  onSave: (input: BookFormState) => Promise<void>;
  onCancel: () => void;
}

export type { BookFormState };

export function BookForm({ book, categories, saving, userId, onSave, onCancel }: BookFormProps) {
  const { form, patch, toggleCategory } = useBookForm(book, userId);

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-base-content">{book ? 'Editar livro' : 'Novo livro'}</h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="form-control md:col-span-2">
            <span className="label-text text-xs mb-1">Título *</span>
            <input className="input input-bordered input-sm" value={form.title} onChange={e => patch({ title: e.target.value })} />
          </label>
          <label className="form-control md:col-span-2">
            <span className="label-text text-xs mb-1">Subtítulo</span>
            <input className="input input-bordered input-sm" value={form.subtitle} onChange={e => patch({ subtitle: e.target.value })} />
          </label>
          <label className="form-control">
            <span className="label-text text-xs mb-1">Autor</span>
            <input className="input input-bordered input-sm" value={form.author} onChange={e => patch({ author: e.target.value })} />
          </label>
          <label className="form-control">
            <span className="label-text text-xs mb-1">Idioma</span>
            <select className="select select-bordered select-sm" value={form.language} onChange={e => patch({ language: e.target.value })}>
              <option value="pt">Português</option>
              <option value="en">Inglês</option>
              <option value="es">Espanhol</option>
              <option value="la">Latim</option>
            </select>
          </label>
          <label className="form-control">
            <span className="label-text text-xs mb-1">ISBN</span>
            <input className="input input-bordered input-sm" value={form.isbn} onChange={e => patch({ isbn: e.target.value })} />
          </label>
          <label className="form-control">
            <span className="label-text text-xs mb-1">Edição</span>
            <input className="input input-bordered input-sm" value={form.edition} onChange={e => patch({ edition: e.target.value })} />
          </label>
          <label className="form-control">
            <span className="label-text text-xs mb-1">Ano</span>
            <input type="number" className="input input-bordered input-sm" value={form.year} onChange={e => patch({ year: e.target.value })} />
          </label>
          <label className="form-control">
            <span className="label-text text-xs mb-1">Tags (separadas por vírgula)</span>
            <input className="input input-bordered input-sm" value={form.tags} onChange={e => patch({ tags: e.target.value })} placeholder="ex: oração, ascética" />
          </label>
        </div>

        <label className="form-control">
          <span className="label-text text-xs mb-1">Descrição (Markdown)</span>
          <MarkdownField value={form.description} onChange={v => patch({ description: v })} height={120} preview="edit" />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <CoverUploader label="Capa frontal" url={form.cover_url} folder="library/covers" onUploaded={url => patch({ cover_url: url })} onClear={() => patch({ cover_url: '' })} />
          <CoverUploader label="Contracapa" url={form.back_cover_url} folder="library/covers" onUploaded={url => patch({ back_cover_url: url })} onClear={() => patch({ back_cover_url: '' })} />
        </div>

        <div className="form-control">
          <span className="label-text text-xs mb-1">Categorias</span>
          {categories.length === 0 ? (
            <p className="text-xs text-base-content/60">Nenhuma categoria cadastrada ainda.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <label key={c.id} className="label cursor-pointer gap-1 py-0">
                  <input type="checkbox" className="checkbox checkbox-xs" checked={form.category_ids.includes(c.id)} onChange={() => toggleCategory(c.id)} />
                  <span className="label-text text-xs">{c.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="form-control">
            <span className="label-text text-xs mb-1">Modo de spoiler</span>
            <select className="select select-bordered select-sm" value={form.spoiler_mode} onChange={e => patch({ spoiler_mode: e.target.value as BookSpoilerMode })}>
              <option value="open">Aberto — leitura integral</option>
              <option value="progressive">Progressivo — corta por aulas concluídas</option>
            </select>
            <span className="text-[10px] text-base-content/50 mt-1">
              {form.spoiler_mode === 'open' ? 'Qualquer aluno autenticado lê o livro completo.' : 'Aluno só lê até o limite das aulas com apply_spoiler=true.'}
            </span>
          </label>
          <label className="label cursor-pointer justify-start gap-2 py-0 mt-6 md:mt-7">
            <input type="checkbox" className="checkbox checkbox-sm" checked={form.is_published} onChange={e => patch({ is_published: e.target.checked })} />
            <span className="label-text text-xs">Publicado (visível no catálogo)</span>
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-primary btn-sm gap-1" onClick={() => onSave(form)} disabled={saving || form.title.trim().length === 0}>
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
