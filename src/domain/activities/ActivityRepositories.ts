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
import type { Repository } from '@/domain/shared/Repository';

export interface QuizRepositoryContract extends Repository<Quiz> {
  findById(id: string): Promise<Quiz | null>;
  findByLesson(lessonId: string): Promise<Quiz | null>;
  remove(id: string): Promise<void>;
}

export interface QuizAttemptRepositoryContract extends Repository<QuizAttempt> {
  findById(id: string): Promise<QuizAttempt | null>;
  findByUserAndQuiz(userId: string, quizId: string): Promise<QuizAttempt[]>;
  findLatestPassed(userId: string, quizId: string): Promise<QuizAttempt | null>;
}

export interface FlashcardDeckRepositoryContract extends Repository<FlashcardDeck> {
  findById(id: string): Promise<FlashcardDeck | null>;
  findByLesson(lessonId: string): Promise<FlashcardDeck | null>;
  remove(id: string): Promise<void>;
}

export interface FlashcardReviewRepositoryContract extends Repository<FlashcardReview> {
  findById(id: string): Promise<FlashcardReview | null>;
  findByUserAndDeck(userId: string, deckId: string): Promise<FlashcardReview[]>;
}

export interface HabitRepositoryContract extends Repository<Habit> {
  listAll(): Promise<Habit[]>;
  findCommunity(): Promise<Habit[]>;
  findByCourse(courseId: string): Promise<Habit[]>;
  findByLesson(lessonId: string): Promise<Habit[]>;
  findByOwner(userId: string): Promise<Habit[]>;
  findBySource(source: HabitSource): Promise<Habit[]>;
}

export interface HabitLogRepositoryContract {
  log(habitId: string, userId: string, dateKey: string): Promise<HabitLog>;
  unlog(habitId: string, userId: string, dateKey: string): Promise<void>;
  findByUserAndHabit(userId: string, habitId: string): Promise<HabitLog[]>;
  findByUser(userId: string): Promise<HabitLog[]>;
  checkLogged(habitId: string, userId: string, dateKey: string): Promise<boolean>;
}

export interface CaseStudyRepositoryContract extends Repository<CaseStudy> {
  findById(id: string): Promise<CaseStudy | null>;
  findByLesson(lessonId: string): Promise<CaseStudy | null>;
  remove(id: string): Promise<void>;
}

export interface CaseRunRepositoryContract extends Repository<CaseRun> {
  findByUserAndCase(userId: string, caseId: string): Promise<CaseRun[]>;
  findLatest(userId: string, caseId: string): Promise<CaseRun | null>;
}

export interface CrosswordRepositoryContract extends Repository<CrosswordPuzzle> {
  findByLesson(lessonId: string): Promise<CrosswordPuzzle | null>;
  saveResult(result: Omit<CrosswordResult, 'id'>): Promise<CrosswordResult>;
  findResult(userId: string, puzzleId: string): Promise<CrosswordResult | null>;
}

export interface WordSearchRepositoryContract extends Repository<WordSearchPuzzle> {
  findByLesson(lessonId: string): Promise<WordSearchPuzzle | null>;
  saveResult(result: Omit<WordSearchResult, 'id'>): Promise<WordSearchResult>;
  findResult(userId: string, puzzleId: string): Promise<WordSearchResult | null>;
}

export interface MindMapTemplateRepositoryContract extends Repository<MindMapTemplate> {
  findByLesson(lessonId: string): Promise<MindMapTemplate | null>;
}

export interface StudentMindMapRepositoryContract extends Repository<StudentMindMap> {
  findByUserAndTemplate(userId: string, templateId: string): Promise<StudentMindMap | null>;
  findByUser(userId: string): Promise<StudentMindMap[]>;
}

export interface ReflectionRepositoryContract extends Repository<Reflection> {
  findByUserAndLesson(userId: string, lessonId: string): Promise<Reflection | null>;
  findByUser(userId: string): Promise<Reflection[]>;
}

export interface PrayerIntentionRepositoryContract extends Repository<PrayerIntention> {
  listRecent(limitCount?: number): Promise<PrayerIntention[]>;
  listByUser(userId: string): Promise<PrayerIntention[]>;
}

export interface PrayerLogRepositoryContract extends Repository<PrayerLog> {
  findByUserAndIntention(userId: string, intentionId: string): Promise<PrayerLog | null>;
}

export interface NotificationRepositoryContract extends Repository<Notification> {
  findUnreadByUser(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
}

export interface VideoWatchSessionRepositoryContract extends Repository<VideoWatchSession> {
  findByUserAndLesson(userId: string, lessonId: string): Promise<VideoWatchSession | null>;
  findByUser(userId: string): Promise<VideoWatchSession[]>;
}
