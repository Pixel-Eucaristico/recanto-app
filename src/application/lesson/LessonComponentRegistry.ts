import type { LessonComponent } from '@/domain/lesson-components/types';

const registry = new Map<string, LessonComponent<any>>();

export function registerLessonComponent<C>(plugin: LessonComponent<C>): void {
  if (registry.has(plugin.kind)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[LessonComponentRegistry] re-registrando "${plugin.kind}"`);
    }
  }
  registry.set(plugin.kind, plugin as LessonComponent<unknown>);
}

export function getLessonComponent(kind: string): LessonComponent<unknown> | undefined {
  return registry.get(kind);
}

export function listLessonComponents(): LessonComponent<unknown>[] {
  return Array.from(registry.values());
}

export function clearLessonComponents(): void {
  registry.clear();
}
