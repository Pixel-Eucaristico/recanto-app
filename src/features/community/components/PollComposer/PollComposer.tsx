'use client';

import { useState } from 'react';
import { Plus, Trash2, Send } from 'lucide-react';
import { communityService } from '@/application/community/CommunityService';
import { CommunityPost, CommunityVisibility, PollOption } from '@/domain/community/types';
import { MarkdownField } from '@/shared/components/MarkdownField';

interface PollComposerProps {
  visibility: CommunityVisibility;
  userId: string;
  userName: string;
  onCreated?: (post: CommunityPost) => void;
}

function optionId() {
  return `o_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export function PollComposer({ visibility, userId, userName, onCreated }: PollComposerProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { id: optionId(), label: '' },
    { id: optionId(), label: '' },
  ]);
  const [closesAt, setClosesAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateOption(id: string, label: string) {
    setOptions(prev => prev.map(o => (o.id === id ? { ...o, label } : o)));
  }
  function addOption() {
    setOptions(prev => [...prev, { id: optionId(), label: '' }]);
  }
  function removeOption(id: string) {
    if (options.length <= 2) return;
    setOptions(prev => prev.filter(o => o.id !== id));
  }

  async function submit() {
    setError(null);
    setSaving(true);
    try {
      const cleaned = options
        .map(o => ({ id: o.id, label: o.label.trim() }))
        .filter(o => o.label.length > 0);
      if (cleaned.length < 2) throw new Error('Enquete precisa de ao menos 2 opções preenchidas.');
      const post = await communityService.createPost({
        kind: 'poll',
        title: title.trim(),
        body: body.trim() || ' ',
        visibility,
        poll_options: cleaned,
        poll_closes_at: closesAt ? new Date(closesAt).toISOString() : undefined,
        created_by: userId,
        created_by_name: userName,
      });
      setTitle('');
      setBody('');
      setOptions([{ id: optionId(), label: '' }, { id: optionId(), label: '' }]);
      setClosesAt('');
      onCreated?.(post);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-3 p-4">
        <h3 className="text-sm font-semibold text-base-content">Nova enquete</h3>

        <label className="form-control">
          <span className="label-text text-xs mb-1">Pergunta</span>
          <input
            className="input input-bordered input-sm"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex.: Qual dia prefere pra oração em grupo?"
          />
        </label>

        <label className="form-control">
          <span className="label-text text-xs mb-1">Descrição (opcional)</span>
          <MarkdownField value={body} onChange={setBody} height={120} preview="edit" />
        </label>

        <div className="space-y-2">
          <span className="label-text text-xs">Opções (mín. 2)</span>
          {options.map((o, i) => (
            <div key={o.id} className="flex items-center gap-2">
              <input
                className="input input-bordered input-sm flex-1"
                value={o.label}
                onChange={e => updateOption(o.id, e.target.value)}
                placeholder={`Opção ${i + 1}`}
              />
              <button
                type="button"
                className="btn btn-ghost btn-xs text-error"
                onClick={() => removeOption(o.id)}
                disabled={options.length <= 2}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-xs gap-1" onClick={addOption}>
            <Plus className="w-3.5 h-3.5" /> Adicionar opção
          </button>
        </div>

        <label className="form-control max-w-xs">
          <span className="label-text text-xs mb-1">Encerrar em (opcional)</span>
          <input
            type="datetime-local"
            className="input input-bordered input-sm"
            value={closesAt}
            onChange={e => setClosesAt(e.target.value)}
          />
        </label>

        {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

        <div className="flex justify-end">
          <button
            className="btn btn-primary btn-sm gap-1"
            onClick={submit}
            disabled={saving || title.trim().length === 0}
          >
            <Send className="w-4 h-4" />
            {saving ? 'Publicando...' : 'Publicar enquete'}
          </button>
        </div>
      </div>
    </div>
  );
}
