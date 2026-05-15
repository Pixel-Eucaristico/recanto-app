'use client';

import { MessageCircle } from 'lucide-react';
import { communityPostRepository } from '@/infrastructure/community/CommunityPostRepository';
import { contentVersionService } from '@/application/content-versions/ContentVersionService';
import type { LessonComponent } from '@/domain/lesson-components/types';

export interface ForumAskConfig {
  /** Pergunta/prompt exibido pro aluno como mural do formador. */
  prompt?: string;
  /** Mínimo de posts próprios pro escopo da aula. Default 1. */
  min_posts?: number;
}

const ForumAskPlugin: LessonComponent<ForumAskConfig> = {
  kind: 'forum_ask',
  label: 'Pergunta no fórum',
  icon: MessageCircle,

  defaultConfig: { min_posts: 1 },
  defaultRequired: true,

  EditorComponent: ({ config, required, onChange }) => (
    <div className="space-y-2">
      <label className="form-control">
        <span className="label-text text-xs mb-1">Pergunta/prompt do formador</span>
        <textarea
          className="textarea textarea-bordered textarea-sm"
          rows={3}
          value={config.prompt ?? ''}
          onChange={e => onChange({ config: { prompt: e.target.value } as Partial<ForumAskConfig> })}
          placeholder="Ex: Compartilhe uma graça que recebeu nessa semana..."
        />
      </label>
      <label className="form-control">
        <span className="label-text text-xs mb-1">Mínimo de posts</span>
        <input
          type="number" min={1}
          className="input input-bordered input-sm w-32"
          value={config.min_posts ?? 1}
          onChange={e => onChange({ config: { min_posts: Number(e.target.value) || 1 } as Partial<ForumAskConfig> })}
        />
      </label>
      <label className="cursor-pointer flex items-center gap-2">
        <input type="checkbox" className="checkbox checkbox-sm" checked={required} onChange={e => onChange({ required: e.target.checked })} />
        <span className="text-sm">Obrigatório</span>
      </label>
    </div>
  ),

  PlayerComponent: ({ config }) => (
    <div className="alert alert-info text-sm"><span>{config.prompt ?? 'Publique no fórum da aula.'}</span></div>
  ),

  ChecklistRowComponent: ({ config }) => (
    <div className="text-sm">Fórum · publicar {config.min_posts ?? 1} {(config.min_posts ?? 1) === 1 ? 'post' : 'posts'}</div>
  ),

  async isCompleted(config, ctx) {
    const posts = await communityPostRepository.findByLesson(ctx.trackId, ctx.lessonId);
    const own = posts.filter(p => p.created_by === ctx.userId && p.kind === 'forum');
    return own.length >= (config.min_posts ?? 1);
  },

  summary(config) {
    return { label: 'Pergunta no fórum', description: `≥ ${config.min_posts ?? 1} post(s)` };
  },

  async getHistory(_config, ctx) {
    const posts = await communityPostRepository.findByLesson(ctx.trackId, ctx.lessonId);
    const own = posts.filter(p => p.created_by === ctx.userId);
    const versions: Array<{ id: string; created_at: string; created_by: string; label: string; payload: unknown }> = [];
    for (const p of own) {
      const vs = await contentVersionService.listByTarget('community_posts', p.id);
      for (const v of vs) {
        versions.push({
          id: v.id,
          created_at: v.created_at,
          created_by: v.created_by,
          label: v.label ?? `Edição em "${p.title}"`,
          payload: v.payload,
        });
      }
    }
    return versions.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async restoreVersion(_config, _ctx, versionId) {
    const v = await contentVersionService.getById(versionId);
    if (!v || v.target_collection !== 'community_posts') return;
    const body = (v.payload as { body?: string; title?: string }).body;
    const title = (v.payload as { body?: string; title?: string }).title;
    await communityPostRepository.update(v.target_id, {
      ...(body !== undefined ? { body } : {}),
      ...(title !== undefined ? { title } : {}),
    });
  },
};

export default ForumAskPlugin;
