import type { LessonComponent } from '@/domain/lesson-components/types';

/**
 * Singleton via globalThis. Necessário porque webpack bundling em Next.js App Router
 * pode duplicar o módulo em chunks diferentes (server/client/cada route group),
 * criando Maps separados. globalThis garante 1 instância real compartilhada.
 */
const REGISTRY_KEY = '__lesson_components_registry__';
type RegistryMap = Map<string, LessonComponent<unknown>>;
const g = globalThis as unknown as Record<string, RegistryMap | undefined>;
const registry: RegistryMap = g[REGISTRY_KEY] ?? (g[REGISTRY_KEY] = new Map());

export function registerLessonComponent<C>(plugin: LessonComponent<C> | undefined): void {
  // Silencia chamadas inválidas — Next.js Fast Refresh às vezes invoca com
  // referências de componente React (function) em vez do objeto plugin.
  if (!plugin || typeof plugin !== 'object' || !plugin.kind) return;

  // Idempotente: mesma referência já registrada → no-op
  const existing = registry.get(plugin.kind);
  if (existing === plugin) return;

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
