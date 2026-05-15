'use client';

import { Save, X, Shield } from 'lucide-react';
import type { Book, BookCategory, BookSpoilerMode } from '@/domain/library/types';
import type { Role } from '@/shared/types/role';
import type { AgeRating } from '@/shared/types/content-access';
import { MarkdownField } from '@/shared/components/MarkdownField';
import { CoverUploader } from './components/CoverUploader';
import { useBookForm, type BookFormState } from './hooks/useBookForm';
import { AgeRatingBadge } from '@/shared/components/AgeRatingBadge';
import { AGE_RATINGS } from '@/shared/content-access/ageRating';
import { UserGrantPicker } from '@/shared/components/UserGrantPicker';

interface BookFormProps {
  book: Book | null;
  categories: BookCategory[];
  saving: boolean;
  userId: string;
  onSave: (input: BookFormState) => Promise<void>;
  onCancel: () => void;
}

export type { BookFormState };

const ROLE_OPTIONS: { value: Exclude<Role, null>; label: string }[] = [
  { value: 'recantiano', label: 'Recantiano' },
  { value: 'missionario', label: 'Missionário' },
  { value: 'pai', label: 'Pai/Mãe' },
  { value: 'colaborador', label: 'Colaborador' },
  { value: 'benfeitor', label: 'Benfeitor' },
  { value: 'visitante', label: 'Visitante' },
];

export function BookForm({ book, categories, saving, userId, onSave, onCancel }: BookFormProps) {
  const { form, patch, toggleCategory, toggleRole, setAllowedUserIds } = useBookForm(book, userId);

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

        {/* ─── Acesso ─────────────────────────────────────────────── */}
        <div className="border border-base-300 rounded-lg p-3 bg-base-200/30">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-bold">Acesso</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <span className="label-text text-xs font-medium block mb-1">Grupos permitidos (vazio = todos)</span>
              <div className="flex flex-wrap gap-1">
                {ROLE_OPTIONS.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    className={`badge badge-sm cursor-pointer ${form.required_roles.includes(r.value) ? 'badge-primary' : 'badge-outline'}`}
                    onClick={() => toggleRole(r.value)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-base-content/60 mt-1">Admin sempre vê o conteúdo.</p>
            </div>

            <label className="form-control">
              <span className="label-text text-xs mb-1">Classificação indicativa</span>
              <select
                className="select select-bordered select-sm"
                value={form.age_rating}
                onChange={e => patch({ age_rating: e.target.value as AgeRating })}
              >
                {AGE_RATINGS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <div className="mt-2 flex items-center gap-2">
                <AgeRatingBadge rating={form.age_rating} showTooltip />
                <span className="text-[10px] text-base-content/60 leading-snug">
                  Passe o mouse no ícone pra ver os critérios.
                </span>
              </div>
            </label>
          </div>

          <UserGrantPicker
            selectedUserIds={form.allowed_user_ids}
            onChange={setAllowedUserIds}
          />
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
