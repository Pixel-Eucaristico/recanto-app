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
import { crosswordService } from '@/application/crossword/CrosswordService';
import { wordSearchService } from '@/application/word-search/WordSearchService';
import { flashcardService } from '@/application/flashcards/FlashcardService';
import { caseStudyService } from '@/application/case-studies/CaseStudyService';
import { mindMapService } from '@/application/mind-maps/MindMapService';
import { studentMindMapRepository } from '@/infrastructure/mind-maps/StudentMindMapRepository';

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

    // 5. Crossword finalizado mas flag false
    if (!current.crossword_passed && lesson.requires_crossword) {
      try {
        const puzzle = await crosswordService.getByLesson(lesson.id);
        if (puzzle) {
          const res = await crosswordService.getLatestResult(userId, puzzle.id);
          if (res && res.correct === res.total) {
            patch.crossword_passed = true;
            changed.push('crossword_passed');
          }
        }
      } catch {}
    }

    // 6. Word search finalizado mas flag false
    if (!current.word_search_passed && lesson.requires_word_search) {
      try {
        const puzzle = await wordSearchService.getByLesson(lesson.id);
        if (puzzle) {
          const done = await wordSearchService.hasCompleted(userId, puzzle.id);
          if (done) {
            patch.word_search_passed = true;
            changed.push('word_search_passed');
          }
        }
      } catch {}
    }

    // 7. Flashcards revisado mas flag false
    if (!current.flashcards_passed && lesson.requires_flashcards) {
      try {
        const deck = await flashcardService.getDeckByLesson(lesson.id);
        if (deck) {
          const done = await flashcardService.hasReviewed(userId, deck.id);
          if (done) {
            patch.flashcards_passed = true;
            changed.push('flashcards_passed');
          }
        }
      } catch {}
    }

    // 8. Case study finalizado mas flag false
    if (!current.case_study_passed && lesson.requires_case_study) {
      try {
        const cs = await caseStudyService.getByLesson(lesson.id);
        if (cs) {
          const done = await caseStudyService.hasRun(userId, cs.id);
          if (done) {
            patch.case_study_passed = true;
            changed.push('case_study_passed');
          }
        }
      } catch {}
    }

    // 9. Mind map salvo mas flag false
    if (!current.mind_map_passed && lesson.requires_mind_map) {
      try {
        const tpl = await mindMapService.getTemplateByLesson(lesson.id);
        if (tpl) {
          const saved = await studentMindMapRepository.findByUserAndTemplate(userId, tpl.id);
          if (saved) {
            patch.mind_map_passed = true;
            changed.push('mind_map_passed');
          }
        }
      } catch {}
    }

    // 10. Auto-complete: obrigatórias feitas → status=completed (desbloqueia próxima aula)
    const merged = { ...current, ...patch };
    const videoOk = (lesson.min_watch_percent ?? 0) === 0 || (merged.video_watch_percent ?? 0) >= (lesson.min_watch_percent ?? 0);
    const reflectionOk = !lesson.requires_reflection || !!merged.reflection_submitted;
    const quizOk = !lesson.requires_quiz || !!merged.quiz_passed;
    const forumOk = !lesson.requires_forum_post || !!merged.forum_post_made;
    const crosswordOk = !lesson.requires_crossword || !!merged.crossword_passed;
    const wordSearchOk = !lesson.requires_word_search || !!merged.word_search_passed;
    const flashcardsOk = !lesson.requires_flashcards || !!merged.flashcards_passed;
    const caseStudyOk = !lesson.requires_case_study || !!merged.case_study_passed;
    const mindMapOk = !lesson.requires_mind_map || !!merged.mind_map_passed;
    const allRequiredOk = videoOk && reflectionOk && quizOk && forumOk && crosswordOk && wordSearchOk && flashcardsOk && caseStudyOk && mindMapOk;

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
