'use client';

import { Network } from 'lucide-react';
import { caseStudyRepository } from '@/infrastructure/case-studies/CaseStudyRepository';
import { caseRunRepository } from '@/infrastructure/case-studies/CaseRunRepository';
import type { LessonComponent } from '@/domain/lesson-components/types';

export interface CaseStudyConfig {
  case_id?: string;
}

const CaseStudyPlugin: LessonComponent<CaseStudyConfig> = {
  kind: 'case_study',
  label: 'Estudo de caso',
  icon: Network,

  defaultConfig: {},
  defaultRequired: false,

  EditorComponent: ({ config, required, onChange }) => (
    <div className="space-y-2">
      <label className="form-control">
        <span className="label-text text-xs mb-1">ID do caso (opcional)</span>
        <input
          className="input input-bordered input-sm"
          value={config.case_id ?? ''}
          onChange={e => onChange({ config: { case_id: e.target.value || undefined } as Partial<CaseStudyConfig> })}
        />
      </label>
      <label className="cursor-pointer flex items-center gap-2">
        <input type="checkbox" className="checkbox checkbox-sm" checked={required} onChange={e => onChange({ required: e.target.checked })} />
        <span className="text-sm">Obrigatório</span>
      </label>
    </div>
  ),

  PlayerComponent: () => <div className="alert alert-info text-sm"><span>Resolva o caso na aba Caso.</span></div>,

  ChecklistRowComponent: () => <div className="text-sm">Estudo de caso · concluir travessia</div>,

  async isCompleted(config, ctx) {
    let caseId = config.case_id;
    if (!caseId) {
      const cs = await caseStudyRepository.findByLesson(ctx.lessonId);
      if (!cs) return false;
      caseId = cs.id;
    }
    const runs = await caseRunRepository.findByUserAndCase(ctx.userId, caseId);
    return runs.length > 0;
  },

  summary() { return { label: 'Estudo de caso', description: 'Concluir travessia' }; },
};

export default CaseStudyPlugin;
