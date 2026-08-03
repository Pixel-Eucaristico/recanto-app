import type { AuthRepository } from '@/domain/auth/AuthRepository';
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
import type {
  AppConfigRepository,
  CmsMenuRepository,
  CmsModRepository,
  CmsPageRepository,
} from '@/domain/cms/CmsRepositories';
import type {
  CommunityCategoryRepositoryContract,
  CommunityPostRepositoryContract,
  CommunityReplyRepositoryContract,
  PollVoteRepositoryContract,
} from '@/domain/community/CommunityRepositories';
import type { EventRepository } from '@/domain/events/EventRepository';
import type {
  LessonRepositoryContract,
  ModuleRepositoryContract,
  ProgressRepositoryContract,
  TrackRepositoryContract,
  TrackTypeRepositoryContract,
} from '@/domain/formation/FormationRepositories';
import type {
  BookCategoryRepositoryContract,
  BookChapterRepositoryContract,
  BookCommentRepositoryContract,
  BookHighlightRepositoryContract,
  BookReadingProgressRepositoryContract,
  BookRepositoryContract,
  BookTagRepositoryContract,
} from '@/domain/library/LibraryRepositories';
import type { MediaRegistryRepository } from '@/domain/media/MediaRepository';
import type { ContentGrantRepository } from '@/domain/permissions/PermissionsRepository';
import type { UserRepository } from '@/domain/users/UserRepository';

export type BackendProvider = 'firebase' | 'directus';

export interface CmsBackend {
  pages: CmsPageRepository;
  mods: CmsModRepository;
  menu: CmsMenuRepository;
  appConfig: AppConfigRepository;
}

export interface PermissionsBackend {
  contentGrants: ContentGrantRepository;
}

export interface MediaBackend {
  registry: MediaRegistryRepository;
}

export interface LibraryBackend {
  books: BookRepositoryContract;
  categories: BookCategoryRepositoryContract;
  chapters: BookChapterRepositoryContract;
  progress: BookReadingProgressRepositoryContract;
  highlights: BookHighlightRepositoryContract;
  comments: BookCommentRepositoryContract;
  tags: BookTagRepositoryContract;
}

export interface FormationBackend {
  trackTypes: TrackTypeRepositoryContract;
  tracks: TrackRepositoryContract;
  modules: ModuleRepositoryContract;
  lessons: LessonRepositoryContract;
  progress: ProgressRepositoryContract;
}

export interface CommunityBackend {
  categories: CommunityCategoryRepositoryContract;
  posts: CommunityPostRepositoryContract;
  replies: CommunityReplyRepositoryContract;
  votes: PollVoteRepositoryContract;
}

export interface ActivitiesBackend {
  quiz: QuizRepositoryContract;
  quizAttempts: QuizAttemptRepositoryContract;
  flashcardDecks: FlashcardDeckRepositoryContract;
  flashcardReviews: FlashcardReviewRepositoryContract;
  habits: HabitRepositoryContract;
  habitLogs: HabitLogRepositoryContract;
  caseStudies: CaseStudyRepositoryContract;
  caseRuns: CaseRunRepositoryContract;
  crossword: CrosswordRepositoryContract;
  wordSearch: WordSearchRepositoryContract;
  mindMapTemplates: MindMapTemplateRepositoryContract;
  studentMindMaps: StudentMindMapRepositoryContract;
  reflections: ReflectionRepositoryContract;
  prayerIntentions: PrayerIntentionRepositoryContract;
  prayerLogs: PrayerLogRepositoryContract;
  notifications: NotificationRepositoryContract;
  videoWatchSessions: VideoWatchSessionRepositoryContract;
}

export interface Backend {
  provider: BackendProvider;
  auth: AuthRepository;
  users: UserRepository;
  events: EventRepository;
  cms: CmsBackend;
  permissions: PermissionsBackend;
  media: MediaBackend;
  library: LibraryBackend;
  formation: FormationBackend;
  community: CommunityBackend;
  activities: ActivitiesBackend;
}
