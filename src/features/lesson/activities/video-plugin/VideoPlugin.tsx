'use client';

import { Video } from 'lucide-react';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';
import { videoWatchSessionRepository } from '@/infrastructure/video-player/VideoWatchSessionRepository';
import type { LessonComponent } from '@/domain/lesson-components/types';

export interface VideoConfig {
  /** URL do vídeo (R2, YouTube, vimeo). */
  url: string;
  /** % mínimo assistido pra concluir. Default 80. */
  min_watch_percent?: number;
  /** Duração em segundos. */
  duration_seconds?: number;
}

const VideoPlugin: LessonComponent<VideoConfig> = {
  kind: 'video',
  label: 'Vídeo',
  icon: Video,

  defaultConfig: { url: '', min_watch_percent: 80 },
  defaultRequired: true,

  // Editor/Player/ChecklistRow são placeholders por enquanto — UI rica vem em iteração
  // separada. Plugins existentes (LessonForm/LessonTabs) seguem usando os flags legados.
  EditorComponent: ({ config, required, onChange }) => (
    <div className="space-y-2">
      <label className="form-control">
        <span className="label-text text-xs mb-1">URL do vídeo</span>
        <input
          className="input input-bordered input-sm"
          value={config.url}
          onChange={e => onChange({ config: { url: e.target.value } as Partial<VideoConfig> })}
          placeholder="https://..."
        />
      </label>
      <label className="form-control">
        <span className="label-text text-xs mb-1">% mínimo assistido</span>
        <input
          type="number"
          min={0}
          max={100}
          className="input input-bordered input-sm w-32"
          value={config.min_watch_percent ?? 80}
          onChange={e => onChange({ config: { min_watch_percent: Number(e.target.value) || 0 } as Partial<VideoConfig> })}
        />
      </label>
      <label className="cursor-pointer flex items-center gap-2">
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={required}
          onChange={e => onChange({ required: e.target.checked })}
        />
        <span className="text-sm">Obrigatório</span>
      </label>
    </div>
  ),

  PlayerComponent: ({ config }) => (
    <div className="alert alert-info text-sm">
      <span>Player do vídeo (delegado ao componente VideoPlayer existente). URL: {config.url || '—'}</span>
    </div>
  ),

  ChecklistRowComponent: ({ config }) => (
    <div className="text-sm">
      Vídeo · meta {config.min_watch_percent ?? 80}%
    </div>
  ),

  async isCompleted(config, ctx) {
    const min = config.min_watch_percent ?? 80;
    const prog = await progressRepository.findByUserAndLesson(ctx.userId, ctx.lessonId);
    if (!prog) return false;
    return (prog.video_watch_percent ?? 0) >= min;
  },

  summary(config) {
    return {
      label: 'Vídeo',
      description: `Assistir ≥ ${config.min_watch_percent ?? 80}%`,
    };
  },

  async recordSession(_config, ctx, event) {
    // Detecta rewatch: já existe LessonProgress.video_completed_at = sessão de rewatch
    const prog = await progressRepository.findByUserAndLesson(ctx.userId, ctx.lessonId);
    const isRewatch = Boolean(prog?.video_completed_at);
    await videoWatchSessionRepository.start({
      user_id: ctx.userId,
      lesson_id: ctx.lessonId,
      module_id: ctx.moduleId,
      track_id: ctx.trackId,
      started_at: event.started_at,
      seconds_watched: Number((event.data as any)?.seconds_watched ?? 0),
      max_position_seconds: Number((event.data as any)?.max_position_seconds ?? 0),
      is_rewatch: isRewatch,
    });
  },

  async listSessions(_config, ctx) {
    const sessions = await videoWatchSessionRepository.findByUserAndLesson(ctx.userId, ctx.lessonId);
    return sessions.map(s => ({
      id: s.id,
      user_id: s.user_id,
      started_at: s.started_at,
      ended_at: s.ended_at,
      data: {
        seconds_watched: s.seconds_watched,
        max_position_seconds: s.max_position_seconds,
        is_rewatch: s.is_rewatch,
      },
    }));
  },
};

export default VideoPlugin;
