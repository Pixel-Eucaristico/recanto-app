import { differenceInHours, parseISO } from 'date-fns';
import { FormationLesson, LessonProgress, UnlockBlocker, UnlockResult } from '@/domain/formation/types';

interface UnlockContext {
  lesson: FormationLesson;
  progress: LessonProgress | null;
  userHabitsBlocked: boolean;
  previousLessonCompleted: boolean;
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
