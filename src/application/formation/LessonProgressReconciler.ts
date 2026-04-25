/**
 * Reconcilia LessonProgress com estado real de outras collections.
 *
 * Casos resolvidos:
 * 1. Vídeo atingiu mínimo mas video_completed_at ainda null (ex: queda de energia antes do save).
 * 2. Reflexão existe com status submitted/reviewed mas reflection_submitted=false.
 * 3. Quiz tem attempt passed=true mas quiz_passed=false.
 * 4. Usuário postou no fórum da aula mas forum_post_made=false.
 *
 * Rodado uma vez por load da página da aula — idempotente, só atualiza se divergente.
 */
import { LessonProgress, FormationLesson } from '@/domain/formation/types';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';
import { reflectionService } from '@/application/spiritual-notebook/ReflectionService';
import { quizService } from '@/application/quiz/QuizService';
import { communityPostRepository } from '@/infrastructure/community/CommunityPostRepository';

export interface ReconcileResult {
  updated: boolean;
  changed: string[];
  progress: LessonProgress;
}

export class LessonProgressReconciler {
  /**
   * Checa divergências e upserta quando necessário.
   * Retorna o progress final + lista do que mudou (pra log/UI).
   */
  async reconcile(
    userId: string,
    lesson: FormationLesson,
    moduleId: string,
    trackId: string,
  ): Promise<ReconcileResult> {
    const current = await progressRepository.getOrCreate(userId, lesson.id, moduleId, trackId);
    const patch: Partial<LessonProgress> = {};
    const changed: string[] = [];

    // 1. Vídeo atingiu mínimo mas completed_at null
    const min = lesson.min_watch_percent ?? 0;
    if (min > 0 && current.video_watch_percent >= min && !current.video_completed_at) {
      patch.video_completed_at = new Date().toISOString();
      changed.push('video_completed_at');
    }

    // 2. Reflexão enviada mas flag false
    if (!current.reflection_submitted && lesson.requires_reflection) {
      const ref = await reflectionService.findByLesson(userId, lesson.id);
      if (ref && (ref.status === 'submitted' || ref.status === 'reviewed')) {
        patch.reflection_submitted = true;
        changed.push('reflection_submitted');
      }
    }

    // 3. Quiz aprovado mas flag false
    if (!current.quiz_passed && lesson.requires_quiz && lesson.quiz_id) {
      const passed = await quizService.hasPassed(userId, lesson.quiz_id);
      if (passed) {
        patch.quiz_passed = true;
        changed.push('quiz_passed');
      }
    }

    // 4. Post no fórum da aula mas flag false
    if (!current.forum_post_made && lesson.requires_forum_post) {
      const posts = await communityPostRepository.findByLesson(trackId, lesson.id);
      if (posts.some(p => p.created_by === userId && p.kind === 'forum')) {
        patch.forum_post_made = true;
        changed.push('forum_post_made');
      }
    }

    // 5. Auto-complete: obrigatórias feitas → status=completed (desbloqueia próxima aula)
    const merged = { ...current, ...patch };
    const videoOk = (lesson.min_watch_percent ?? 0) === 0 || (merged.video_watch_percent ?? 0) >= (lesson.min_watch_percent ?? 0);
    const reflectionOk = !lesson.requires_reflection || !!merged.reflection_submitted;
    const quizOk = !lesson.requires_quiz || !!merged.quiz_passed;
    const forumOk = !lesson.requires_forum_post || !!merged.forum_post_made;
    const allRequiredOk = videoOk && reflectionOk && quizOk && forumOk;

    if (allRequiredOk && merged.status !== 'completed') {
      patch.status = 'completed';
      if (!merged.completed_at) patch.completed_at = new Date().toISOString();
      changed.push('status=completed');
    }

    if (changed.length === 0) {
      return { updated: false, changed: [], progress: current };
    }

    const updated = await progressRepository.upsert(userId, lesson.id, patch);
    return { updated: true, changed, progress: updated };
  }
}

export const lessonProgressReconciler = new LessonProgressReconciler();
