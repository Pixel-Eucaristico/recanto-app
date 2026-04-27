'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { BookCredits } from '@/domain/library/types';
import { RichTextEditor } from '@/shared/components/RichTextEditor';

interface CreditsEditorProps {
  credits: BookCredits;
  onChange: (credits: BookCredits) => void;
}

export function CreditsEditor({ credits, onChange }: CreditsEditorProps) {
  function update(patch: Partial<BookCredits>) {
    onChange({ ...credits, ...patch });
  }

  return (
    <div className="space-y-4">
      {/* Title block */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 gap-3">
          <h4 className="font-semibold text-sm">Identificação da obra</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Field label="Título" value={credits.title} onChange={v => update({ title: v })} />
            <Field label="Subtítulo" value={credits.subtitle} onChange={v => update({ subtitle: v })} />
          </div>
        </div>
      </div>

      {/* People */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 gap-3">
          <h4 className="font-semibold text-sm">Equipe editorial</h4>
          <PeopleField label="Autores" people={credits.authors} onChange={v => update({ authors: v })} placeholder="Nome do autor" />
          <PeopleField label="Tradutores" people={credits.translators} onChange={v => update({ translators: v })} placeholder="Nome do tradutor" />
          <PeopleField label="Ilustradores" people={credits.illustrators} onChange={v => update({ illustrators: v })} placeholder="Nome do ilustrador" />
          <PeopleField label="Editores" people={credits.editors} onChange={v => update({ editors: v })} placeholder="Nome do editor" />
        </div>
      </div>

      {/* Publishing */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 gap-3">
          <h4 className="font-semibold text-sm">Dados de publicação</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Field label="Editora" value={credits.publisher} onChange={v => update({ publisher: v })} />
            <Field label="Cidade" value={credits.city} onChange={v => update({ city: v })} />
            <Field label="Edição" value={credits.edition} onChange={v => update({ edition: v })} placeholder="ex: 3ª" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <label className="form-control">
              <span className="label-text text-xs mb-1">Ano</span>
              <input
                type="number"
                className="input input-bordered input-sm"
                value={credits.year ?? ''}
                onChange={e => update({ year: Number(e.target.value) || undefined })}
                min={1000}
                max={2099}
              />
            </label>
            <Field label="ISBN" value={credits.isbn} onChange={v => update({ isbn: v })} placeholder="978-..." />
          </div>
        </div>
      </div>

      {/* Legal */}
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body p-4 gap-3">
          <h4 className="font-semibold text-sm">Direitos e licença</h4>
          <Field label="Copyright" value={credits.copyright} onChange={v => update({ copyright: v })} placeholder="© 2025 Nome do Autor" />
          <Field label="Licença" value={credits.license} onChange={v => update({ license: v })} placeholder="ex: CC BY-NC-SA 4.0" />
          <div>
            <span className="label-text text-xs mb-1 block">Notas adicionais</span>
            <RichTextEditor
              value={credits.notes ?? ''}
              onChange={v => update({ notes: v || undefined })}
              placeholder="Notas extras sobre direitos, agradecimentos, dedicatórias..."
              height={140}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function Field({ label, value, placeholder, onChange }: {
  label: string;
  value?: string;
  placeholder?: string;
  onChange: (v: string | undefined) => void;
}) {
  return (
    <label className="form-control">
      <span className="label-text text-xs mb-1">{label}</span>
      <input
        className="input input-bordered input-sm"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value || undefined)}
      />
    </label>
  );
}

function PeopleField({ label, people, placeholder, onChange }: {
  label: string;
  people?: string[];
  placeholder: string;
  onChange: (v: string[] | undefined) => void;
}) {
  const list = people ?? [];

  function update(i: number, value: string) {
    const next = [...list];
    next[i] = value;
    onChange(next.length ? next : undefined);
  }

  function add() {
    onChange([...list, '']);
  }

  function remove(i: number) {
    const next = list.filter((_, idx) => idx !== i);
    onChange(next.length ? next : undefined);
  }

  return (
    <div>
      <span className="label-text text-xs mb-1 block">{label}</span>
      <div className="space-y-1">
        {list.map((p, i) => (
          <div key={i} className="flex gap-1">
            <input
              className="input input-bordered input-sm flex-1"
              value={p}
              placeholder={placeholder}
              onChange={e => update(i, e.target.value)}
            />
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(i)}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-xs gap-1" onClick={add}>
          <Plus className="w-3 h-3" /> Adicionar
        </button>
      </div>
    </div>
  );
}
