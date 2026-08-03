import { Role } from '@/shared/types/role';
import {
  FormationTrack,
  FormationModule,
  FormationLesson,
  LessonProgress,
  TrackWithProgress,
  ModuleWithProgress,
  LessonWithProgress,
  UnlockResult,
} from '@/domain/formation/types';
import { UnlockRuleEngine } from '@/domain/formation/entities/UnlockRuleEngine';
import { ITrackRepository } from '@/infrastructure/formation/TrackRepository';
import { IModuleRepository } from '@/infrastructure/formation/ModuleRepository';
import { ILessonRepository } from '@/infrastructure/formation/LessonRepository';
import { IProgressRepository } from '@/infrastructure/formation/ProgressRepository';
import { habitService } from '@/application/habits/HabitService';
import type { LessonComponentRuntimeContext } from '@/domain/lesson-components/types';

/**
 * Aula anterior considerada concluída quando:
 * - components definidos: todos `required` passam em `evaluateComponents`
 * - components ausentes: status === 'completed' (via reconciler tradicional)
 */
async function isPreviousLessonComplete(
  prevLesson: FormationLesson | null,
  prevProgress: LessonProgress | null,
  ctxBase: Omit<LessonComponentRuntimeContext, 'lessonId'>,
): Promise<boolean> {
  if (!prevLesson) return true;
  if (prevLesson.components && prevLesson.components.length > 0) {
    const blocked = await UnlockRuleEngine.evaluateComponents(prevLesson, {
      ...ctxBase,
      lessonId: prevLesson.id,
    });
    return blocked.length === 0;
  }
  return prevProgress?.status === 'completed';
}

/**
 * Avalia se gate de hábitos da aula anterior está cumprido.
 * Retorna false só se algum habit_id da aula anterior tem `required_completion_percent`
 * e o aluno ainda não cumpriu.
 */
async function evaluatePrevHabitGate(
  prevLesson: FormationLesson | null,
  userId: string,
): Promise<boolean> {
  if (!prevLesson || !prevLesson.habit_ids?.length) return true;
  for (const habitId of prevLesson.habit_ids) {
    const ok = await habitService.meetsCompletionGate(habitId, userId);
    if (!ok) return false;
  }
  return true;
}

export class FormationService {
  /** trackId → total de aulas. Currículo muda pouco; evita reler módulos por render. */
  private readonly lessonCountCache = new Map<string, number>();

  constructor(
    private readonly tracks: ITrackRepository,
    private readonly modules: IModuleRepository,
    private readonly lessons: ILessonRepository,
    private readonly progress: IProgressRepository,
  ) {}

  async getTracksForUser(role: Role): Promise<FormationTrack[]> {
    return this.tracks.findByRole(role);
  }

  async getAllTracks(): Promise<FormationTrack[]> {
    return this.tracks.findAll();
  }

  /**
   * Total REAL de aulas por trilha: `module_ids` → módulos → soma de `lesson_ids`.
   *
   * Existe porque as listas mostravam progresso como `concluídas ÷ aulas abertas`.
   * Quem abria 3 de 40 aulas e concluía as 3 via 100%. `getTrackWithProgress`
   * calcula o total certo, mas avalia gate de hábito e completude por aula — caro
   * demais para uma lista de trilhas ou de alunos.
   *
   * Só lê `formation_modules`, não `formation_lessons`: `lesson_ids.length` basta
   * para contar. Resultado é memoizado por instância do serviço.
   */
  async getTrackLessonCounts(trackIds: string[]): Promise<Map<string, number>> {
    const unicos = Array.from(new Set(trackIds.filter(Boolean)));
    const resultado = new Map<string, number>();

    const faltando = unicos.filter(id => {
      const cache = this.lessonCountCache.get(id);
      if (cache !== undefined) resultado.set(id, cache);
      return cache === undefined;
    });
    if (faltando.length === 0) return resultado;

    const trilhas = await Promise.all(faltando.map(id => this.tracks.findById(id).catch(() => null)));

    // Um único fetch de módulos para todas as trilhas que faltam.
    const moduleIds = trilhas.flatMap(t => t?.module_ids ?? []);
    const modulos = await this.modules.findByIds(Array.from(new Set(moduleIds)));
    const contagemPorModulo = new Map(modulos.map(m => [m.id, m.lesson_ids?.length ?? 0] as const));

    for (const trilha of trilhas) {
      if (!trilha) continue;
      const total = (trilha.module_ids ?? [])
        .reduce((soma, moduleId) => soma + (contagemPorModulo.get(moduleId) ?? 0), 0);
      this.lessonCountCache.set(trilha.id, total);
      resultado.set(trilha.id, total);
    }

    return resultado;
  }

  /** Invalida o cache de contagem — chamar após editar módulos/aulas. */
  clearLessonCountCache(): void {
    this.lessonCountCache.clear();
  }

  async getTrackWithProgress(trackId: string, userId: string, userHabitsBlocked: boolean): Promise<TrackWithProgress> {
    const track = await this.tracks.findById(trackId);
    if (!track) throw new Error(`Trilha ${trackId} não encontrada`);

    const moduleList = await this.modules.findByIds(track.module_ids);
    const trackProgress = await this.progress.findByUserAndTrack(userId, trackId);
    const progressMap = new Map(trackProgress.map(p => [p.lesson_id, p]));

    // Carrega aulas de cada módulo em paralelo
    const moduleLessons = await Promise.all(
      moduleList.map(m => this.lessons.findByIds(m.lesson_ids).then(ls => ({ module: m, lessons: ls })))
    );

    // Sequência global de aulas em ordem de track → módulo → ordem dentro do módulo
    const flatLessons = moduleLessons.flatMap(ml => ml.lessons);

    let totalLessons = 0;
    let completedLessons = 0;

    // Pré-calcula gate de hábitos pra cada aula (uma única vez)
    const prevHabitGateMap = new Map<string, boolean>();
    for (let i = 0; i < flatLessons.length; i++) {
      const prev = i > 0 ? flatLessons[i - 1] : null;
      prevHabitGateMap.set(flatLessons[i].id, await evaluatePrevHabitGate(prev, userId));
    }

    // Pré-calcula completude da aula anterior (components OU flags legados)
    const prevCompletedMap = new Map<string, boolean>();
    for (let i = 0; i < flatLessons.length; i++) {
      const prev = i > 0 ? flatLessons[i - 1] : null;
      const prevProg = prev ? progressMap.get(prev.id) ?? null : null;
      prevCompletedMap.set(
        flatLessons[i].id,
        await isPreviousLessonComplete(prev, prevProg, {
          userId,
          trackId,
          moduleId: prev?.module_id ?? '',
        }),
      );
    }

    const modulesWithProgress: ModuleWithProgress[] = moduleLessons.map(({ module, lessons }) => {
      let completedCount = 0;

      const lessonsWithProgress: LessonWithProgress[] = lessons.map(lesson => {
        const prog = progressMap.get(lesson.id) ?? null;

        const unlockResult = UnlockRuleEngine.evaluate({
          lesson,
          progress: prog,
          userHabitsBlocked,
          previousLessonCompleted: prevCompletedMap.get(lesson.id) ?? true,
          previousLessonHabitGateMet: prevHabitGateMap.get(lesson.id) ?? true,
        });

        if (prog?.status === 'completed') completedCount++;
        totalLessons++;
        if (prog?.status === 'completed') completedLessons++;

        return { lesson, progress: prog, unlockResult };
      });

      return { module, lessons: lessonsWithProgress, completedCount };
    });

    return { track, modules: modulesWithProgress, completedLessons, totalLessons };
  }

  async getLesson(lessonId: string): Promise<FormationLesson | null> {
    return this.lessons.findById(lessonId);
  }

  async getLessonWithProgress(
    userId: string,
    lessonId: string,
    moduleId: string,
    trackId: string,
    userHabitsBlocked: boolean,
    previousLessonId?: string
  ): Promise<LessonWithProgress> {
    const lesson = await this.lessons.findById(lessonId);
    if (!lesson) throw new Error(`Aula ${lessonId} não encontrada`);

    const prog = await this.progress.getOrCreate(userId, lessonId, moduleId, trackId);

    let previousLessonCompleted = true;
    let previousLesson: FormationLesson | null = null;
    if (previousLessonId) {
      const prevProg = await this.progress.findByUserAndLesson(userId, previousLessonId);
      previousLesson = await this.lessons.findById(previousLessonId);
      previousLessonCompleted = await isPreviousLessonComplete(previousLesson, prevProg, {
        userId,
        trackId,
        moduleId: previousLesson?.module_id ?? '',
      });
    }
    const previousLessonHabitGateMet = await evaluatePrevHabitGate(previousLesson, userId);

    const unlockResult = UnlockRuleEngine.evaluate({
      lesson,
      progress: prog,
      userHabitsBlocked,
      previousLessonCompleted,
      previousLessonHabitGateMet,
    });

    return { lesson, progress: prog, unlockResult };
  }
}

import { trackRepository } from '@/infrastructure/formation/TrackRepository';
import { moduleRepository } from '@/infrastructure/formation/ModuleRepository';
import { lessonRepository } from '@/infrastructure/formation/LessonRepository';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';

export const formationService = new FormationService(
  trackRepository,
  moduleRepository,
  lessonRepository,
  progressRepository,
);
