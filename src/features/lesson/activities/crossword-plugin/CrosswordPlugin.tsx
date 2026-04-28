'use client';

import { Grid3x3 } from 'lucide-react';
import { crosswordRepository, crosswordResultRepository } from '@/infrastructure/crossword/CrosswordRepository';
import type { LessonComponent } from '@/domain/lesson-components/types';

export interface CrosswordConfig {
  puzzle_id?: string;
  min_score?: number;
}

const CrosswordPlugin: LessonComponent<CrosswordConfig> = {
  kind: 'crossword',
  label: 'Palavras cruzadas',
  icon: Grid3x3,

  defaultConfig: { min_score: 100 },
  defaultRequired: false,

  EditorComponent: ({ config, required, onChange }) => (
    <div className="space-y-2">
      <label className="form-control">
        <span className="label-text text-xs mb-1">ID do puzzle (opcional)</span>
        <input
          className="input input-bordered input-sm"
          value={config.puzzle_id ?? ''}
          onChange={e => onChange({ config: { puzzle_id: e.target.value || undefined } as Partial<CrosswordConfig> })}
        />
      </label>
      <label className="form-control">
        <span className="label-text text-xs mb-1">Score mínimo (%)</span>
        <input
          type="number" min={0} max={100}
          className="input input-bordered input-sm w-32"
          value={config.min_score ?? 100}
          onChange={e => onChange({ config: { min_score: Number(e.target.value) || 0 } as Partial<CrosswordConfig> })}
        />
      </label>
      <label className="cursor-pointer flex items-center gap-2">
        <input type="checkbox" className="checkbox checkbox-sm" checked={required} onChange={e => onChange({ required: e.target.checked })} />
        <span className="text-sm">Obrigatório</span>
      </label>
    </div>
  ),

  PlayerComponent: () => <div className="alert alert-info text-sm"><span>Resolva na aba Cruzadas.</span></div>,

  ChecklistRowComponent: ({ config }) => <div className="text-sm">Palavras cruzadas · ≥ {config.min_score ?? 100}%</div>,

  async isCompleted(config, ctx) {
    let puzzleId = config.puzzle_id;
    if (!puzzleId) {
      const p = await crosswordRepository.findByLesson(ctx.lessonId);
      if (!p) return false;
      puzzleId = p.id;
    }
    const results = await crosswordResultRepository.findByUserAndPuzzle(ctx.userId, puzzleId);
    const min = config.min_score ?? 100;
    return results.some(r => (r.score ?? 0) >= min);
  },

  summary(config) { return { label: 'Palavras cruzadas', description: `≥ ${config.min_score ?? 100}%` }; },
};

export default CrosswordPlugin;
