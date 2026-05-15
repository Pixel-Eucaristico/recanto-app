'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { communityService } from '@/application/community/CommunityService';
import { CommunityKind, CommunityPost, CommunityVisibility } from '@/domain/community/types';
import { MarkdownField } from '@/shared/components/MarkdownField';
import { CategoryPicker } from '@/features/community/components/CategoryPicker';

interface PostComposerProps {
  kind: CommunityKind;
  visibility: CommunityVisibility;
  userId: string;
  userName: string;
  /** Categoria fixa — quando definida, bloqueia o picker (ex: post dentro de aula). */
  lockedCategoryId?: string;
  onCreated?: (post: CommunityPost) => void;
}

export function PostComposer({ kind, visibility, userId, userName, lockedCategoryId, onCreated }: PostComposerProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>(lockedCategoryId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setSaving(true);
    try {
      const post = await communityService.createPost({
        kind,
        title: title.trim(),
        body: body.trim(),
        visibility,
        category_id: categoryId,
        created_by: userId,
        created_by_name: userName,
      });
      setTitle('');
      setBody('');
      if (!lockedCategoryId) setCategoryId(undefined);
      onCreated?.(post);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  const heading = kind === 'wall' ? 'Novo depoimento' : 'Novo tópico';
  const titleLabel = kind === 'wall' ? 'Assunto' : 'Título da discussão';
  const bodyLabel = kind === 'wall' ? 'Compartilhe sua experiência' : 'Descrição (Markdown)';

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-3 p-4">
        <h3 className="text-sm font-semibold text-base-content">{heading}</h3>
        <label className="form-control">
          <span className="label-text text-xs mb-1">{titleLabel}</span>
          <input
            className="input input-bordered input-sm"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex.: Como vivo a caridade no dia a dia?"
          />
        </label>
        <label className="form-control max-w-sm">
          <span className="label-text text-xs mb-1">Categoria</span>
          <CategoryPicker
            value={categoryId}
            onChange={setCategoryId}
            visibility={visibility}
            lockedTo={lockedCategoryId}
          />
        </label>
        <label className="form-control">
          <span className="label-text text-xs mb-1">{bodyLabel}</span>
          <MarkdownField value={body} onChange={setBody} height={160} preview="edit" />
        </label>
        {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}
        <div className="flex justify-end">
          <button
            className="btn btn-primary btn-sm gap-1"
            onClick={submit}
            disabled={saving || title.trim().length === 0 || body.trim().length === 0}
          >
            <Send className="w-4 h-4" />
            {saving ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  );
}
