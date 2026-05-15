import { differenceInHours, parseISO } from 'date-fns';
import { FormationLesson, LessonProgress, UnlockBlocker, UnlockResult } from '@/domain/formation/types';
import type { LessonComponentRuntimeContext } from '@/domain/lesson-components/types';
import { getLessonComponent } from '@/application/lesson/LessonComponentRegistry';

interface UnlockContext {
  lesson: FormationLesson;
  progress: LessonProgress | null;
  userHabitsBlocked: boolean;
  previousLessonCompleted: boolean;
  /**
   * Quando false, gate de % de conclusão dos hábitos da aula anterior não foi cumprido.
   * Default true (sem gate ou gate cumprido).
   */
  previousLessonHabitGateMet?: boolean;
}

export class UnlockRuleEngine {
  /**
   * "isUnlocked" significa que o aluno PODE ABRIR a aula.
   * Os requisitos da aula em si (vídeo/reflexão/quiz/fórum) são tracked no checklist
   * e marcam status='completed' quando cumpridos via reconciler.
   *
   * Bloqueios reais pra abrir:
   *  - aula anterior não concluída
   *  - hábitos do aluno em atraso
   *  - tempo de reflexão (time_lock) ainda contando após completar o vídeo
   */
  static evaluate(ctx: UnlockContext): UnlockResult {
    if (!ctx.previousLessonCompleted) {
      return { isUnlocked: false, blockedBy: ['previous_lesson'] };
    }

    if (ctx.userHabitsBlocked) {
      return { isUnlocked: false, blockedBy: ['habits'] };
    }

    if (ctx.previousLessonHabitGateMet === false) {
      return { isUnlocked: false, blockedBy: ['habits'] };
    }

    const { lesson, progress } = ctx;

    // Time-lock só conta após o vídeo ter sido concluído nessa aula.
    // Se o aluno ainda não terminou o vídeo, ele pode entrar e começar.
    if (lesson.unlock_after_hours > 0 && progress?.video_completed_at) {
      const elapsed = differenceInHours(new Date(), parseISO(progress.video_completed_at));
      if (elapsed < lesson.unlock_after_hours) {
        return {
          isUnlocked: false,
          blockedBy: ['time_lock'],
          timeRemainingSeconds: this.calcTimeLockRemaining(lesson, progress),
        };
      }
    }

    return { isUnlocked: true, blockedBy: [] };
  }

  static calcTimeLockRemaining(lesson: FormationLesson, progress: LessonProgress | null): number | undefined {
    if (!lesson.unlock_after_hours || !progress?.video_completed_at) return undefined;
    const elapsed = differenceInHours(new Date(), parseISO(progress.video_completed_at));
    const remaining = lesson.unlock_after_hours - elapsed;
    if (remaining <= 0) return 0;
    return remaining * 3600;
  }

  /**
   * Avalia componentes-plugin da aula. Retorna ids dos componentes obrigatórios
   * que ainda não foram concluídos. Quando vazio, aluno passou.
   *
   * Quando lesson.components for undefined, retorna [] (caller usa fallback nos flags).
   */
  static async evaluateComponents(
    lesson: FormationLesson,
    ctx: LessonComponentRuntimeContext,
  ): Promise<string[]> {
    const components = lesson.components ?? [];
    if (components.length === 0) return [];
    const required = components.filter(c => c.required);
    const checks = await Promise.all(required.map(async c => {
      const plugin = getLessonComponent(c.kind);
      if (!plugin) return { id: c.id, ok: true }; // sem plugin = não bloqueia
      const ok = await plugin.isCompleted(c.config, ctx).catch(() => false);
      return { id: c.id, ok };
    }));
    return checks.filter(r => !r.ok).map(r => r.id);
  }

  static blockerLabel(blocker: UnlockBlocker): string {
    const labels: Record<UnlockBlocker, string> = {
      video: 'Assista o vídeo completamente',
      time_lock: 'Aguarde o tempo de reflexão',
      reflection: 'Envie o Caderno Espiritual',
      quiz: 'Complete o Quiz',
      forum: 'Publique no Fórum',
      habits: 'Retome seus hábitos diários',
      previous_lesson: 'Conclua a aula anterior',
    };
    return labels[blocker];
  }
}
