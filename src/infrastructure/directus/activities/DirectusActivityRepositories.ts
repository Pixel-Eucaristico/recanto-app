import { DirectusRepository } from '../DirectusRepository';
import type {
  CaseRunRepositoryContract,
  CaseStudyRepositoryContract,
  CrosswordRepositoryContract,
  FlashcardDeckRepositoryContract,
  FlashcardReviewRepositoryContract,
  HabitLogRepositoryContract,
  HabitRepositoryContract,
  MindMapTemplateRepositoryContract,
  NotificationRepositoryContract,
  PrayerIntentionRepositoryContract,
  PrayerLogRepositoryContract,
  QuizAttemptRepositoryContract,
  QuizRepositoryContract,
  ReflectionRepositoryContract,
  StudentMindMapRepositoryContract,
  VideoWatchSessionRepositoryContract,
  WordSearchRepositoryContract,
} from '@/domain/activities/ActivityRepositories';
import type { CaseRun, CaseStudy } from '@/domain/case-studies/types';
import type { CrosswordPuzzle, CrosswordResult } from '@/domain/crossword/types';
import type { FlashcardDeck, FlashcardReview } from '@/domain/flashcards/types';
import type { Habit, HabitLog, HabitSource } from '@/domain/habits/types';
import type { MindMapTemplate, StudentMindMap } from '@/domain/mind-maps/types';
import type { Notification } from '@/domain/notifications/types';
import type { PrayerIntention, PrayerLog } from '@/domain/prayer/types';
import type { Quiz, QuizAttempt } from '@/domain/quiz/types';
import type { Reflection } from '@/domain/spiritual-notebook/types';
import type { VideoWatchSession } from '@/domain/video-player/types';
import type { WordSearchPuzzle, WordSearchResult } from '@/domain/word-search/types';

function composedId(...parts: string[]): string {
  return parts.join('_');
}

class DirectusLessonActivityRepository<T extends { id: string; lesson_id: string }>
  extends DirectusRepository<T>
{
  constructor(collection: string) {
    super(collection);
  }

  findById(id: string): Promise<T | null> {
    return this.get(id);
  }

  findByLesson(lessonId: string): Promise<T | null> {
    return this.findOneBy({ lesson_id: lessonId });
  }

  remove(id: string): Promise<void> {
    return this.delete(id);
  }
}

class DirectusCrosswordResultRepository extends DirectusRepository<CrosswordResult> {
  constructor() {
    super('crossword_results');
  }

  async findLatest(userId: string, puzzleId: string): Promise<CrosswordResult | null> {
    const results = await this.findManyWhere(
      { user_id: { _eq: userId }, puzzle_id: { _eq: puzzleId } },
      { sort: '-completed_at', limit: 1 },
    );
    return results[0] ?? null;
  }
}

class DirectusWordSearchResultRepository extends DirectusRepository<WordSearchResult> {
  constructor() {
    super('word_search_results');
  }

  async findLatest(userId: string, puzzleId: string): Promise<WordSearchResult | null> {
    const results = await this.findManyWhere(
      { user_id: { _eq: userId }, puzzle_id: { _eq: puzzleId } },
      { sort: '-completed_at', limit: 1 },
    );
    return results[0] ?? null;
  }
}

const directusCrosswordResultRepository = new DirectusCrosswordResultRepository();
const directusWordSearchResultRepository = new DirectusWordSearchResultRepository();

export class DirectusQuizRepository
  extends DirectusLessonActivityRepository<Quiz>
  implements QuizRepositoryContract
{
  constructor() {
    super('quizzes');
  }
}

export class DirectusQuizAttemptRepository
  extends DirectusRepository<QuizAttempt>
  implements QuizAttemptRepositoryContract
{
  constructor() {
    super('quiz_attempts');
  }

  findById(id: string): Promise<QuizAttempt | null> {
    return this.get(id);
  }

  findByUserAndQuiz(userId: string, quizId: string): Promise<QuizAttempt[]> {
    return this.findManyBy({ user_id: userId, quiz_id: quizId }, '-attempted_at');
  }

  async findLatestPassed(userId: string, quizId: string): Promise<QuizAttempt | null> {
    const attempts = await this.findManyWhere(
      { user_id: { _eq: userId }, quiz_id: { _eq: quizId }, passed: { _eq: true } },
      { sort: '-attempted_at', limit: 1 },
    );
    return attempts[0] ?? null;
  }
}

export class DirectusFlashcardDeckRepository
  extends DirectusLessonActivityRepository<FlashcardDeck>
  implements FlashcardDeckRepositoryContract
{
  constructor() {
    super('flashcard_decks');
  }
}

export class DirectusFlashcardReviewRepository
  extends DirectusRepository<FlashcardReview>
  implements FlashcardReviewRepositoryContract
{
  constructor() {
    super('flashcard_reviews');
  }

  findById(id: string): Promise<FlashcardReview | null> {
    return this.get(id);
  }

  findByUserAndDeck(userId: string, deckId: string): Promise<FlashcardReview[]> {
    return this.findManyBy({ user_id: userId, deck_id: deckId }, '-reviewed_at');
  }
}

export class DirectusHabitRepository
  extends DirectusRepository<Habit>
  implements HabitRepositoryContract
{
  constructor() {
    super('habits');
  }

  listAll(): Promise<Habit[]> {
    return this.list('order', 'asc');
  }

  findCommunity(): Promise<Habit[]> {
    return this.findBySource('community');
  }

  findByCourse(courseId: string): Promise<Habit[]> {
    return this.findManyBy({ course_id: courseId }, 'order');
  }

  findByLesson(lessonId: string): Promise<Habit[]> {
    return this.findManyBy({ lesson_id: lessonId }, 'order');
  }

  findByOwner(userId: string): Promise<Habit[]> {
    return this.findManyBy({ owner_user_id: userId }, 'order');
  }

  findBySource(source: HabitSource): Promise<Habit[]> {
    return this.findManyBy({ source }, 'order');
  }
}

export class DirectusHabitLogRepository
  extends DirectusRepository<HabitLog>
  implements HabitLogRepositoryContract
{
  constructor() {
    super('habit_logs');
  }

  async log(habitId: string, userId: string, dateKey: string): Promise<HabitLog> {
    const id = composedId(userId, habitId, dateKey);
    const payload: HabitLog = {
      id,
      user_id: userId,
      habit_id: habitId,
      log_date: dateKey,
      logged_at: new Date().toISOString(),
    };
    const existing = await this.get(id);
    if (existing) return existing;
    return this.create(payload);
  }

  async unlog(habitId: string, userId: string, dateKey: string): Promise<void> {
    await this.delete(composedId(userId, habitId, dateKey));
  }

  findByUserAndHabit(userId: string, habitId: string): Promise<HabitLog[]> {
    return this.findManyBy({ user_id: userId, habit_id: habitId }, '-log_date');
  }

  findByUser(userId: string): Promise<HabitLog[]> {
    return this.findManyBy({ user_id: userId }, '-log_date');
  }

  async checkLogged(habitId: string, userId: string, dateKey: string): Promise<boolean> {
    return Boolean(await this.get(composedId(userId, habitId, dateKey)));
  }
}

export class DirectusCaseStudyRepository
  extends DirectusLessonActivityRepository<CaseStudy>
  implements CaseStudyRepositoryContract
{
  constructor() {
    super('case_studies');
  }
}

export class DirectusCaseRunRepository
  extends DirectusRepository<CaseRun>
  implements CaseRunRepositoryContract
{
  constructor() {
    super('case_runs');
  }

  findByUserAndCase(userId: string, caseId: string): Promise<CaseRun[]> {
    return this.findManyBy({ user_id: userId, case_id: caseId }, '-run_at');
  }

  async findLatest(userId: string, caseId: string): Promise<CaseRun | null> {
    const runs = await this.findByUserAndCase(userId, caseId);
    return runs[0] ?? null;
  }
}

export class DirectusCrosswordRepository
  extends DirectusLessonActivityRepository<CrosswordPuzzle>
  implements CrosswordRepositoryContract
{
  constructor() {
    super('crosswords');
  }

  saveResult(result: Omit<CrosswordResult, 'id'>): Promise<CrosswordResult> {
    return directusCrosswordResultRepository.create(result);
  }

  findResult(userId: string, puzzleId: string): Promise<CrosswordResult | null> {
    return directusCrosswordResultRepository.findLatest(userId, puzzleId);
  }
}

export class DirectusWordSearchRepository
  extends DirectusLessonActivityRepository<WordSearchPuzzle>
  implements WordSearchRepositoryContract
{
  constructor() {
    super('word_searches');
  }

  saveResult(result: Omit<WordSearchResult, 'id'>): Promise<WordSearchResult> {
    return directusWordSearchResultRepository.create(result);
  }

  findResult(userId: string, puzzleId: string): Promise<WordSearchResult | null> {
    return directusWordSearchResultRepository.findLatest(userId, puzzleId);
  }
}

export class DirectusMindMapTemplateRepository
  extends DirectusLessonActivityRepository<MindMapTemplate>
  implements MindMapTemplateRepositoryContract
{
  constructor() {
    super('mind_map_templates');
  }
}

export class DirectusStudentMindMapRepository
  extends DirectusRepository<StudentMindMap>
  implements StudentMindMapRepositoryContract
{
  constructor() {
    super('student_mind_maps');
  }

  findByUserAndTemplate(userId: string, templateId: string): Promise<StudentMindMap | null> {
    return this.get(composedId(userId, templateId));
  }

  findByUser(userId: string): Promise<StudentMindMap[]> {
    return this.findManyBy({ user_id: userId }, '-updated_at');
  }
}

export class DirectusReflectionRepository
  extends DirectusRepository<Reflection>
  implements ReflectionRepositoryContract
{
  constructor() {
    super('spiritual_reflections');
  }

  findByUserAndLesson(userId: string, lessonId: string): Promise<Reflection | null> {
    return this.findOneBy({ user_id: userId, lesson_id: lessonId });
  }

  findByUser(userId: string): Promise<Reflection[]> {
    return this.findManyBy({ user_id: userId }, '-created_at');
  }
}

export class DirectusPrayerIntentionRepository
  extends DirectusRepository<PrayerIntention>
  implements PrayerIntentionRepositoryContract
{
  constructor() {
    super('prayer_intentions');
  }

  listRecent(limitCount = 30): Promise<PrayerIntention[]> {
    return this.findManyWhere({}, { sort: '-created_at', limit: limitCount });
  }

  listByUser(userId: string): Promise<PrayerIntention[]> {
    return this.findManyBy({ created_by: userId }, '-created_at');
  }
}

export class DirectusPrayerLogRepository
  extends DirectusRepository<PrayerLog>
  implements PrayerLogRepositoryContract
{
  constructor() {
    super('prayer_logs');
  }

  findByUserAndIntention(userId: string, intentionId: string): Promise<PrayerLog | null> {
    return this.findOneBy({ user_id: userId, intention_id: intentionId });
  }
}

export class DirectusNotificationRepository
  extends DirectusRepository<Notification>
  implements NotificationRepositoryContract
{
  constructor() {
    super('notifications');
  }

  findUnreadByUser(userId: string): Promise<Notification[]> {
    return this.findManyWhere(
      { user_id: { _eq: userId }, read: { _eq: false } },
      { sort: '-created_at', limit: 50 },
    );
  }

  async markAsRead(id: string): Promise<void> {
    await this.update(id, { read: true });
  }
}

export class DirectusVideoWatchSessionRepository
  extends DirectusRepository<VideoWatchSession>
  implements VideoWatchSessionRepositoryContract
{
  constructor() {
    super('video_watch_sessions');
  }

  async findByUserAndLesson(userId: string, lessonId: string): Promise<VideoWatchSession | null> {
    const sessions = await this.findManyWhere(
      { user_id: { _eq: userId }, lesson_id: { _eq: lessonId } },
      { sort: '-started_at', limit: 1 },
    );
    return sessions[0] ?? null;
  }

  findByUser(userId: string): Promise<VideoWatchSession[]> {
    return this.findManyBy({ user_id: userId }, '-started_at');
  }
}

export const directusQuizRepository = new DirectusQuizRepository();
export const directusQuizAttemptRepository = new DirectusQuizAttemptRepository();
export const directusFlashcardDeckRepository = new DirectusFlashcardDeckRepository();
export const directusFlashcardReviewRepository = new DirectusFlashcardReviewRepository();
export const directusHabitRepository = new DirectusHabitRepository();
export const directusHabitLogRepository = new DirectusHabitLogRepository();
export const directusCaseStudyRepository = new DirectusCaseStudyRepository();
export const directusCaseRunRepository = new DirectusCaseRunRepository();
export const directusCrosswordRepository = new DirectusCrosswordRepository();
export const directusWordSearchRepository = new DirectusWordSearchRepository();
export const directusMindMapTemplateRepository = new DirectusMindMapTemplateRepository();
export const directusStudentMindMapRepository = new DirectusStudentMindMapRepository();
export const directusReflectionRepository = new DirectusReflectionRepository();
export const directusPrayerIntentionRepository = new DirectusPrayerIntentionRepository();
export const directusPrayerLogRepository = new DirectusPrayerLogRepository();
export const directusNotificationRepository = new DirectusNotificationRepository();
export const directusVideoWatchSessionRepository = new DirectusVideoWatchSessionRepository();
