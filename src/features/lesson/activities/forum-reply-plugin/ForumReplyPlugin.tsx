'use client';

import { MessageSquare } from 'lucide-react';
import { communityPostRepository } from '@/infrastructure/community/CommunityPostRepository';
import { communityReplyRepository } from '@/infrastructure/community/CommunityReplyRepository';
import { contentVersionService } from '@/application/content-versions/ContentVersionService';
import type { LessonComponent } from '@/domain/lesson-components/types';

export interface ForumReplyConfig {
  /** Mínimo de respostas em posts de outros. Default 1. */
  min_replies?: number;
}

const ForumReplyPlugin: LessonComponent<ForumReplyConfig> = {
  kind: 'forum_reply',
  label: 'Resposta no fórum',
  icon: MessageSquare,

  defaultConfig: { min_replies: 1 },
  defaultRequired: true,

  EditorComponent: ({ config, required, onChange }) => (
    <div className="space-y-2">
      <label className="form-control">
        <span className="label-text text-xs mb-1">Mínimo de respostas em posts de outros</span>
        <input
          type="number" min={1}
          className="input input-bordered input-sm w-32"
          value={config.min_replies ?? 1}
          onChange={e => onChange({ config: { min_replies: Number(e.target.value) || 1 } as Partial<ForumReplyConfig> })}
        />
      </label>
      <label className="cursor-pointer flex items-center gap-2">
        <input type="checkbox" className="checkbox checkbox-sm" checked={required} onChange={e => onChange({ required: e.target.checked })} />
        <span className="text-sm">Obrigatório</span>
      </label>
    </div>
  ),

  PlayerComponent: () => <div className="alert alert-info text-sm"><span>Responda posts de colegas no fórum da aula.</span></div>,

  ChecklistRowComponent: ({ config }) => (
    <div className="text-sm">Fórum · responder {config.min_replies ?? 1} post(s) de outros</div>
  ),

  async isCompleted(config, ctx) {
    // Posts da aula → pra cada um, ver replies do user; descartar posts próprios
    const posts = await communityPostRepository.findByLesson(ctx.trackId, ctx.lessonId);
    const others = posts.filter(p => p.created_by !== ctx.userId);
    if (others.length === 0) return false;

    let count = 0;
    const need = config.min_replies ?? 1;
    for (const p of others) {
      const replies = await communityReplyRepository.findByPost(p.id);
      const mine = replies.filter(r => r.created_by === ctx.userId);
      count += mine.length;
      if (count >= need) return true;
    }
    return false;
  },

  summary(config) {
    return { label: 'Resposta no fórum', description: `≥ ${config.min_replies ?? 1} resposta(s)` };
  },

  async getHistory(_config, ctx) {
    // Pra cada post da aula, ler replies próprias + versões de cada
    const posts = await communityPostRepository.findByLesson(ctx.trackId, ctx.lessonId);
    const versions: Array<{ id: string; created_at: string; created_by: string; label: string; payload: unknown }> = [];
    for (const p of posts) {
      const replies = await communityReplyRepository.findByPost(p.id);
      const mine = replies.filter(r => r.created_by === ctx.userId);
      for (const r of mine) {
        const vs = await contentVersionService.listByTarget('community_replies', r.id);
        for (const v of vs) {
          versions.push({
            id: v.id,
            created_at: v.created_at,
            created_by: v.created_by,
            label: v.label ?? `Edição em resposta`,
            payload: v.payload,
          });
        }
      }
    }
    return versions.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async restoreVersion(_config, _ctx, versionId) {
    const v = await contentVersionService.getById(versionId);
    if (!v || v.target_collection !== 'community_replies') return;
    const body = (v.payload as { body?: string }).body;
    if (body === undefined) return;
    await communityReplyRepository.update(v.target_id, { body });
  },
};

export default ForumReplyPlugin;
