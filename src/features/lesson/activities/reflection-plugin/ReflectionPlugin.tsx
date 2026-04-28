'use client';

import { PenLine } from 'lucide-react';
import { reflectionRepository } from '@/infrastructure/spiritual-notebook/ReflectionRepository';
import { contentVersionService } from '@/application/content-versions/ContentVersionService';
import type { LessonComponent } from '@/domain/lesson-components/types';

export interface ReflectionConfig {
  /** Pergunta/prompt exibido pro aluno. */
  prompt?: string;
  /** Quando true, exige `submitted` (não basta draft). Default true. */
  require_submitted?: boolean;
}

const ReflectionPlugin: LessonComponent<ReflectionConfig> = {
  kind: 'reflection',
  label: 'Reflexão (Caderno)',
  icon: PenLine,

  defaultConfig: { require_submitted: true },
  defaultRequired: true,

  EditorComponent: ({ config, required, onChange }) => (
    <div className="space-y-2">
      <label className="form-control">
        <span className="label-text text-xs mb-1">Pergunta/prompt</span>
        <textarea
          className="textarea textarea-bordered textarea-sm"
          rows={3}
          value={config.prompt ?? ''}
          onChange={e => onChange({ config: { prompt: e.target.value } as Partial<ReflectionConfig> })}
          placeholder="O que mais te tocou nessa aula?"
        />
      </label>
      <label className="cursor-pointer flex items-center gap-2">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={config.require_submitted ?? true}
          onChange={e => onChange({ config: { require_submitted: e.target.checked } as Partial<ReflectionConfig> })}
        />
        <span className="text-sm">Exigir submissão (não basta rascunho)</span>
      </label>
      <label className="cursor-pointer flex items-center gap-2">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={required}
          onChange={e => onChange({ required: e.target.checked })}
        />
        <span className="text-sm">Obrigatória</span>
      </label>
    </div>
  ),

  PlayerComponent: ({ config }) => (
    <div className="alert alert-info text-sm">
      <span>{config.prompt ?? 'Reflita sobre a aula no Caderno Espiritual.'}</span>
    </div>
  ),

  ChecklistRowComponent: ({ config }) => (
    <div className="text-sm">
      Reflexão · {config.require_submitted ? 'submeter' : 'rascunho conta'}
    </div>
  ),

  async isCompleted(config, ctx) {
    const r = await reflectionRepository.findByLesson(ctx.userId, ctx.lessonId);
    if (!r) return false;
    if (config.require_submitted ?? true) {
      return r.status === 'submitted' || r.status === 'reviewed';
    }
    return Boolean(r.content?.trim());
  },

  summary(config) {
    return {
      label: 'Reflexão',
      description: config.require_submitted ? 'Submeter no Caderno' : 'Escrever rascunho',
    };
  },

  async getHistory(_config, ctx) {
    const r = await reflectionRepository.findByLesson(ctx.userId, ctx.lessonId);
    if (!r) return [];
    const versions = await contentVersionService.listByTarget('spiritual_reflections', r.id);
    return versions.map(v => ({
      id: v.id,
      created_at: v.created_at,
      created_by: v.created_by,
      label: v.label ?? 'Edição',
      payload: v.payload,
    }));
  },

  async restoreVersion(_config, ctx, versionId) {
    const v = await contentVersionService.getById(versionId);
    if (!v || v.target_collection !== 'spiritual_reflections') return;
    const r = await reflectionRepository.findByLesson(ctx.userId, ctx.lessonId);
    if (!r) return;
    const content = (v.payload as { content?: string }).content;
    await reflectionRepository.update(r.id, { content });
  },
};

export default ReflectionPlugin;
