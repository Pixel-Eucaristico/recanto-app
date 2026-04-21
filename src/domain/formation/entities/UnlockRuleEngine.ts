import { differenceInHours, parseISO } from 'date-fns';
import { FormationLesson, LessonProgress, UnlockBlocker, UnlockResult } from '@/domain/formation/types';

interface UnlockContext {
  lesson: FormationLesson;
  progress: LessonProgress | null;
  userHabitsBlocked: boolean;
  previousLessonCompleted: boolean;
}

export class UnlockRuleEngine {
  static evaluate(ctx: UnlockContext): UnlockResult {
    if (!ctx.previousLessonCompleted) {
      return { isUnlocked: false, blockedBy: ['previous_lesson'] };
    }

    if (!ctx.progress) {
      return { isUnlocked: false, blockedBy: ['video'] };
    }

    const blockers: UnlockBlocker[] = [];
    const { lesson, progress } = ctx;

    if (progress.video_watch_percent < lesson.min_watch_percent) {
      blockers.push('video');
    }

    if (
      lesson.unlock_after_hours > 0 &&
      progress.video_completed_at
    ) {
      const elapsed = differenceInHours(new Date(), parseISO(progress.video_completed_at));
      if (elapsed < lesson.unlock_after_hours) {
        blockers.push('time_lock');
      }
    } else if (lesson.unlock_after_hours > 0 && !progress.video_completed_at) {
      blockers.push('time_lock');
    }

    if (lesson.requires_reflection && !progress.reflection_submitted) {
      blockers.push('reflection');
    }

    if (lesson.requires_quiz && !progress.quiz_passed) {
      blockers.push('quiz');
    }

    if (lesson.requires_forum_post && !progress.forum_post_made) {
      blockers.push('forum');
    }

    if (ctx.userHabitsBlocked) {
      blockers.push('habits');
    }

    const timeRemainingSeconds = this.calcTimeLockRemaining(lesson, progress);

    return {
      isUnlocked: blockers.length === 0,
      blockedBy: blockers,
      timeRemainingSeconds,
    };
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
