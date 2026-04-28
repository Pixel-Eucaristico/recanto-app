/**
 * Bootstrap dos plugins de aula. Importa cada plugin → ele se auto-registra
 * via registerLessonComponent.
 *
 * Adicionar plugin novo: criar arquivo em features/lesson/activities/{nome}-plugin/
 * com export default + registrar aqui.
 *
 * Importar este módulo em algum lugar que sempre carrega (ex: dashboard layout)
 * pra garantir que registry está populado antes de qualquer render que usa plugins.
 */

import { registerLessonComponent } from './LessonComponentRegistry';
import VideoPlugin from '@/features/lesson/activities/video-plugin/VideoPlugin';
import ReflectionPlugin from '@/features/lesson/activities/reflection-plugin/ReflectionPlugin';
import QuizPlugin from '@/features/lesson/activities/quiz-plugin/QuizPlugin';
import FlashcardsPlugin from '@/features/lesson/activities/flashcards-plugin/FlashcardsPlugin';
import CaseStudyPlugin from '@/features/lesson/activities/case-study-plugin/CaseStudyPlugin';
import WordSearchPlugin from '@/features/lesson/activities/word-search-plugin/WordSearchPlugin';
import CrosswordPlugin from '@/features/lesson/activities/crossword-plugin/CrosswordPlugin';
import MindMapPlugin from '@/features/lesson/activities/mind-map-plugin/MindMapPlugin';
import ForumAskPlugin from '@/features/lesson/activities/forum-ask-plugin/ForumAskPlugin';
import ForumReplyPlugin from '@/features/lesson/activities/forum-reply-plugin/ForumReplyPlugin';
import TimeWaitDaysPlugin from '@/features/lesson/activities/time-wait-days-plugin/TimeWaitDaysPlugin';
import HabitDaysPlugin from '@/features/lesson/activities/habit-days-plugin/HabitDaysPlugin';

let registered = false;

export function registerAllLessonPlugins(): void {
  if (registered) return;
  registerLessonComponent(VideoPlugin);
  registerLessonComponent(ReflectionPlugin);
  registerLessonComponent(QuizPlugin);
  registerLessonComponent(FlashcardsPlugin);
  registerLessonComponent(CaseStudyPlugin);
  registerLessonComponent(WordSearchPlugin);
  registerLessonComponent(CrosswordPlugin);
  registerLessonComponent(MindMapPlugin);
  registerLessonComponent(ForumAskPlugin);
  registerLessonComponent(ForumReplyPlugin);
  registerLessonComponent(TimeWaitDaysPlugin);
  registerLessonComponent(HabitDaysPlugin);
  registered = true;
}

// Auto-execução em import — facilita uso (basta importar o módulo).
registerAllLessonPlugins();
