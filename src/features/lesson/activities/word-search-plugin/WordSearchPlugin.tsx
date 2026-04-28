'use client';

import { Search } from 'lucide-react';
import { wordSearchRepository, wordSearchResultRepository } from '@/infrastructure/word-search/WordSearchRepository';
import type { LessonComponent } from '@/domain/lesson-components/types';

export interface WordSearchConfig {
  puzzle_id?: string;
  /** Score mínimo (0-100). Default 100 (achar todas). */
  min_score?: number;
}

const WordSearchPlugin: LessonComponent<WordSearchConfig> = {
  kind: 'word_search',
  label: 'Caça-palavras',
  icon: Search,

  defaultConfig: { min_score: 100 },
  defaultRequired: false,

  EditorComponent: ({ config, required, onChange }) => (
    <div className="space-y-2">
      <label className="form-control">
        <span className="label-text text-xs mb-1">ID do puzzle (opcional)</span>
        <input
          className="input input-bordered input-sm"
          value={config.puzzle_id ?? ''}
          onChange={e => onChange({ config: { puzzle_id: e.target.value || undefined } as Partial<WordSearchConfig> })}
        />
      </label>
      <label className="form-control">
        <span className="label-text text-xs mb-1">Score mínimo (%)</span>
        <input
          type="number" min={0} max={100}
          className="input input-bordered input-sm w-32"
          value={config.min_score ?? 100}
          onChange={e => onChange({ config: { min_score: Number(e.target.value) || 0 } as Partial<WordSearchConfig> })}
        />
      </label>
      <label className="cursor-pointer flex items-center gap-2">
        <input type="checkbox" className="checkbox checkbox-sm" checked={required} onChange={e => onChange({ required: e.target.checked })} />
        <span className="text-sm">Obrigatório</span>
      </label>
    </div>
  ),

  PlayerComponent: () => <div className="alert alert-info text-sm"><span>Resolva na aba Caça-palavras.</span></div>,

  ChecklistRowComponent: ({ config }) => <div className="text-sm">Caça-palavras · ≥ {config.min_score ?? 100}%</div>,

  async isCompleted(config, ctx) {
    let puzzleId = config.puzzle_id;
    if (!puzzleId) {
      const p = await wordSearchRepository.findByLesson(ctx.lessonId);
      if (!p) return false;
      puzzleId = p.id;
    }
    const results = await wordSearchResultRepository.findByUserAndPuzzle(ctx.userId, puzzleId);
    const min = config.min_score ?? 100;
    return results.some(r => (r.score ?? 0) >= min);
  },

  summary(config) { return { label: 'Caça-palavras', description: `≥ ${config.min_score ?? 100}%` }; },
};

export default WordSearchPlugin;
