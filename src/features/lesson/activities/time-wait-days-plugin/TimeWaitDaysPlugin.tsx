'use client';

import { Clock } from 'lucide-react';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';
import type { LessonComponent } from '@/domain/lesson-components/types';

export interface TimeWaitDaysConfig {
  /** Dias mínimos de espera desde o desbloqueio da aula. */
  days: number;
  /**
   * Âncora pra contar:
   * - 'unlocked_at' (default): conta desde que aula foi desbloqueada
   * - 'video_completed_at': conta desde que terminou o vídeo
   */
  anchor?: 'unlocked_at' | 'video_completed_at';
}

const TimeWaitDaysPlugin: LessonComponent<TimeWaitDaysConfig> = {
  kind: 'time_wait_days',
  label: 'Tempo de reflexão',
  icon: Clock,

  defaultConfig: { days: 1, anchor: 'unlocked_at' },
  defaultRequired: true,

  EditorComponent: ({ config, required, onChange }) => (
    <div className="space-y-2">
      <label className="form-control">
        <span className="label-text text-xs mb-1">Dias de espera</span>
        <input
          type="number" min={0}
          className="input input-bordered input-sm w-32"
          value={config.days}
          onChange={e => onChange({ config: { days: Number(e.target.value) || 0 } as Partial<TimeWaitDaysConfig> })}
        />
      </label>
      <label className="form-control">
        <span className="label-text text-xs mb-1">Âncora</span>
        <select
          className="select select-bordered select-sm"
          value={config.anchor ?? 'unlocked_at'}
          onChange={e => onChange({ config: { anchor: e.target.value as TimeWaitDaysConfig['anchor'] } as Partial<TimeWaitDaysConfig> })}
        >
          <option value="unlocked_at">Desde o desbloqueio</option>
          <option value="video_completed_at">Desde fim do vídeo</option>
        </select>
      </label>
      <label className="cursor-pointer flex items-center gap-2">
        <input type="checkbox" className="checkbox checkbox-sm" checked={required} onChange={e => onChange({ required: e.target.checked })} />
        <span className="text-sm">Obrigatório</span>
      </label>
    </div>
  ),

  PlayerComponent: ({ config }) => (
    <div className="alert alert-info text-sm">
      <span>Aguarde {config.days} dia(s) para reflexão antes de avançar.</span>
    </div>
  ),

  ChecklistRowComponent: ({ config }) => (
    <div className="text-sm">Espera · {config.days} dia(s)</div>
  ),

  async isCompleted(config, ctx) {
    const prog = await progressRepository.findByUserAndLesson(ctx.userId, ctx.lessonId);
    if (!prog) return false;
    const anchor = config.anchor ?? 'unlocked_at';
    const ts = anchor === 'video_completed_at' ? prog.video_completed_at : prog.unlocked_at;
    if (!ts) return false;
    const elapsedMs = Date.now() - new Date(ts).getTime();
    const elapsedDays = elapsedMs / 86400000;
    return elapsedDays >= config.days;
  },

  summary(config) {
    return { label: 'Tempo de reflexão', description: `${config.days} dia(s)` };
  },
};

export default TimeWaitDaysPlugin;
