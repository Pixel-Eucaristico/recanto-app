/**
 * Migration shim — converte flags `requires_*` legados em LessonComponentInstance[].
 *
 * Usado tanto pelo runtime (fallback no checklist quando aula não tem `components`)
 * quanto pelo migration script (escreve no doc).
 */

import type { FormationLesson } from '@/domain/formation/types';
import type { LessonComponentInstance } from './types';

function instanceId(kind: string): string {
  return `mig_${kind}`;
}

export function flagsToComponents(lesson: FormationLesson): LessonComponentInstance[] {
  const out: LessonComponentInstance[] = [];
  let order = 0;

  // Video é sempre presente (aula tem url + min_watch_percent)
  if (lesson.video_url) {
    out.push({
      id: instanceId('video'),
      kind: 'video',
      required: true,
      order: order++,
      config: {
        url: lesson.video_url,
        min_watch_percent: lesson.min_watch_percent ?? 80,
        duration_seconds: lesson.video_duration_seconds,
      },
    });
  }

  if (lesson.unlock_after_hours && lesson.unlock_after_hours > 0) {
    out.push({
      id: instanceId('time_wait_days'),
      kind: 'time_wait_days',
      required: true,
      order: order++,
      config: {
        days: lesson.unlock_after_hours / 24,
        anchor: 'video_completed_at',
      },
    });
  }

  if (lesson.requires_reflection) {
    out.push({
      id: instanceId('reflection'),
      kind: 'reflection',
      required: true,
      order: order++,
      config: { require_submitted: true },
    });
  }

  if (lesson.requires_quiz) {
    out.push({
      id: instanceId('quiz'),
      kind: 'quiz',
      required: true,
      order: order++,
      config: { quiz_id: lesson.quiz_id },
    });
  }

  if (lesson.requires_forum_post) {
    out.push({
      id: instanceId('forum_ask'),
      kind: 'forum_ask',
      required: true,
      order: order++,
      config: { prompt: lesson.forum_prompt, min_posts: 1 },
    });
  }

  if (lesson.requires_flashcards) {
    out.push({
      id: instanceId('flashcards'),
      kind: 'flashcards',
      required: true,
      order: order++,
      config: {},
    });
  }

  if (lesson.requires_case_study) {
    out.push({
      id: instanceId('case_study'),
      kind: 'case_study',
      required: true,
      order: order++,
      config: {},
    });
  }

  if (lesson.requires_word_search) {
    out.push({
      id: instanceId('word_search'),
      kind: 'word_search',
      required: true,
      order: order++,
      config: { min_score: 100 },
    });
  }

  if (lesson.requires_crossword) {
    out.push({
      id: instanceId('crossword'),
      kind: 'crossword',
      required: true,
      order: order++,
      config: { min_score: 100 },
    });
  }

  if (lesson.requires_mind_map) {
    out.push({
      id: instanceId('mind_map'),
      kind: 'mind_map',
      required: true,
      order: order++,
      config: {},
    });
  }

  // habit_ids → 1 habit_days por hábito (gate definido no Habit.required_completion_percent)
  for (const habitId of lesson.habit_ids ?? []) {
    out.push({
      id: instanceId(`habit_days_${habitId}`),
      kind: 'habit_days',
      required: true,
      order: order++,
      config: { habit_id: habitId, min_days: 1 },
    });
  }

  return out;
}

/**
 * Retorna `lesson.components` se já definido, senão deriva via shim.
 * Permite UI/checklist sempre operar sobre LessonComponentInstance[].
 */
export function effectiveComponents(lesson: FormationLesson): LessonComponentInstance[] {
  if (lesson.components && lesson.components.length > 0) return lesson.components;
  return flagsToComponents(lesson);
}
