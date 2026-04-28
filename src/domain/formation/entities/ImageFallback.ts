/**
 * Resolve imagem com fallback em cascata.
 * Track → primeiro Module → primeiro Lesson.
 * Module → primeiro Lesson.
 * Lesson → ela mesma.
 *
 * Pure helper — sem I/O. Caller carrega listas e passa pra função.
 */

import type { FormationTrack, FormationModule, FormationLesson } from '@/domain/formation/types';

export function resolveTrackImage(
  track: FormationTrack,
  modules?: FormationModule[],
  lessons?: FormationLesson[],
): string | undefined {
  if (track.thumbnail_url) return track.thumbnail_url;
  // Próximo nível: primeiro módulo com imagem
  const firstModuleWithImage = (modules ?? []).find(m => m.thumbnail_url);
  if (firstModuleWithImage?.thumbnail_url) return firstModuleWithImage.thumbnail_url;
  // Último fallback: primeira aula com imagem (de qualquer módulo)
  const firstLessonWithImage = (lessons ?? []).find(l => l.thumbnail_url);
  return firstLessonWithImage?.thumbnail_url;
}

export function resolveModuleImage(
  module: FormationModule,
  lessons?: FormationLesson[],
): string | undefined {
  if (module.thumbnail_url) return module.thumbnail_url;
  // Fallback: primeira aula do módulo com imagem
  const firstLessonWithImage = (lessons ?? [])
    .filter(l => l.module_id === module.id)
    .find(l => l.thumbnail_url);
  return firstLessonWithImage?.thumbnail_url;
}

export function resolveLessonImage(lesson: FormationLesson): string | undefined {
  return lesson.thumbnail_url;
}
