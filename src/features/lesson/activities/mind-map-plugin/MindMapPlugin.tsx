'use client';

import { Network } from 'lucide-react';
import { mindMapTemplateRepository } from '@/infrastructure/mind-maps/MindMapTemplateRepository';
import { studentMindMapRepository } from '@/infrastructure/mind-maps/StudentMindMapRepository';
import { contentVersionService } from '@/application/content-versions/ContentVersionService';
import type { LessonComponent } from '@/domain/lesson-components/types';

export interface MindMapConfig {
  template_id?: string;
}

const MindMapPlugin: LessonComponent<MindMapConfig> = {
  kind: 'mind_map',
  label: 'Mapa mental',
  icon: Network,

  defaultConfig: {},
  defaultRequired: false,

  EditorComponent: ({ config, required, onChange }) => (
    <div className="space-y-2">
      <label className="form-control">
        <span className="label-text text-xs mb-1">ID do template (opcional)</span>
        <input
          className="input input-bordered input-sm"
          value={config.template_id ?? ''}
          onChange={e => onChange({ config: { template_id: e.target.value || undefined } as Partial<MindMapConfig> })}
        />
      </label>
      <label className="cursor-pointer flex items-center gap-2">
        <input type="checkbox" className="checkbox checkbox-sm" checked={required} onChange={e => onChange({ required: e.target.checked })} />
        <span className="text-sm">Obrigatório</span>
      </label>
    </div>
  ),

  PlayerComponent: () => <div className="alert alert-info text-sm"><span>Edite o mapa na aba Mapa mental.</span></div>,

  ChecklistRowComponent: () => <div className="text-sm">Mapa mental · salvar versão própria</div>,

  async isCompleted(config, ctx) {
    let templateId = config.template_id;
    if (!templateId) {
      const t = await mindMapTemplateRepository.findByLesson(ctx.lessonId);
      if (!t) return false;
      templateId = t.id;
    }
    const saved = await studentMindMapRepository.findByUserAndTemplate(ctx.userId, templateId);
    return Boolean(saved);
  },

  summary() { return { label: 'Mapa mental', description: 'Salvar versão própria' }; },

  async getHistory(config, ctx) {
    let templateId = config.template_id;
    if (!templateId) {
      const t = await mindMapTemplateRepository.findByLesson(ctx.lessonId);
      if (!t) return [];
      templateId = t.id;
    }
    const saved = await studentMindMapRepository.findByUserAndTemplate(ctx.userId, templateId);
    if (!saved) return [];
    const versions = await contentVersionService.listByTarget('student_mind_maps', saved.id);
    return versions.map(v => ({
      id: v.id,
      created_at: v.created_at,
      created_by: v.created_by,
      label: v.label ?? 'Edição',
      payload: v.payload,
    }));
  },
};

export default MindMapPlugin;
