'use client';

import { HeartHandshake } from 'lucide-react';
import { habitRepository } from '@/infrastructure/habits/HabitRepository';
import { habitLogRepository } from '@/infrastructure/habits/HabitLogRepository';
import type { LessonComponent } from '@/domain/lesson-components/types';

export interface HabitDaysConfig {
  /** ID do hábito a verificar. */
  habit_id: string;
  /** Mínimo de dias únicos cumpridos. Default 3. */
  min_days: number;
  /**
   * Janela em dias retroativa (default = duration_days do hábito, fallback 30).
   * Conta logs cujo log_date está em [hoje - window_days, hoje].
   */
  window_days?: number;
}

const HabitDaysPlugin: LessonComponent<HabitDaysConfig> = {
  kind: 'habit_days',
  label: 'Hábito por dias',
  icon: HeartHandshake,

  defaultConfig: { habit_id: '', min_days: 3 },
  defaultRequired: true,

  EditorComponent: ({ config, required, onChange }) => (
    <div className="space-y-2">
      <label className="form-control">
        <span className="label-text text-xs mb-1">ID do hábito</span>
        <input
          className="input input-bordered input-sm"
          value={config.habit_id}
          onChange={e => onChange({ config: { habit_id: e.target.value } as Partial<HabitDaysConfig> })}
          placeholder="habit_id"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="form-control">
          <span className="label-text text-xs mb-1">Dias mínimos</span>
          <input
            type="number" min={1}
            className="input input-bordered input-sm"
            value={config.min_days}
            onChange={e => onChange({ config: { min_days: Number(e.target.value) || 1 } as Partial<HabitDaysConfig> })}
          />
        </label>
        <label className="form-control">
          <span className="label-text text-xs mb-1">Janela (dias)</span>
          <input
            type="number" min={0}
            className="input input-bordered input-sm"
            value={config.window_days ?? ''}
            onChange={e => onChange({ config: { window_days: e.target.value ? Number(e.target.value) : undefined } as Partial<HabitDaysConfig> })}
            placeholder="auto"
          />
        </label>
      </div>
      <label className="cursor-pointer flex items-center gap-2">
        <input type="checkbox" className="checkbox checkbox-sm" checked={required} onChange={e => onChange({ required: e.target.checked })} />
        <span className="text-sm">Obrigatório</span>
      </label>
    </div>
  ),

  PlayerComponent: ({ config }) => (
    <div className="alert alert-info text-sm">
      <span>Cumpra o hábito por pelo menos {config.min_days} dia(s).</span>
    </div>
  ),

  ChecklistRowComponent: ({ config }) => (
    <div className="text-sm">Hábito · ≥ {config.min_days} dia(s)</div>
  ),

  async isCompleted(config, ctx) {
    if (!config.habit_id) return false;
    const habit = await habitRepository.get(config.habit_id);
    if (!habit) return false;

    const windowDays = config.window_days ?? habit.duration_days ?? 30;
    const cutoff = new Date(Date.now() - windowDays * 86400000).toISOString().slice(0, 10);

    const logs = await habitLogRepository.findByUserAndHabit(ctx.userId, config.habit_id);
    const inWindow = new Set(
      logs.map(l => l.log_date).filter(d => d >= cutoff),
    );
    return inWindow.size >= config.min_days;
  },

  summary(config) {
    return {
      label: 'Hábito por dias',
      description: `≥ ${config.min_days} dia(s) em ${config.window_days ?? 'janela do hábito'}`,
    };
  },
};

export default HabitDaysPlugin;
