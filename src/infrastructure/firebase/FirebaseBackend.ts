import type { Backend } from '@/backend/backend.types';
import type { AppGlobalConfigType } from '@/services/firebase/AppConfigService';
import type { CMSPage, MenuConfig, ModConfig } from '@/types/cms-types';
import { attemptRepository } from '@/infrastructure/quiz/AttemptRepository';
import { authService } from '@/services/firebase/AuthService';
import { appConfigService } from '@/services/firebase/AppConfigService';
import { bookCategoryRepository } from '@/infrastructure/library/BookCategoryRepository';
import { bookChapterRepository } from '@/infrastructure/library/BookChapterRepository';
import { bookCommentRepository } from '@/infrastructure/library/BookCommentRepository';
import { bookHighlightRepository } from '@/infrastructure/library/BookHighlightRepository';
import { bookReadingProgressRepository } from '@/infrastructure/library/BookReadingProgressRepository';
import { bookRepository } from '@/infrastructure/library/BookRepository';
import { bookTagRepository } from '@/infrastructure/library/BookTagRepository';
import { caseRunRepository } from '@/infrastructure/case-studies/CaseRunRepository';
import { caseStudyRepository } from '@/infrastructure/case-studies/CaseStudyRepository';
import { communityCategoryRepository } from '@/infrastructure/community/CommunityCategoryRepository';
import { communityPostRepository } from '@/infrastructure/community/CommunityPostRepository';
import { communityReplyRepository } from '@/infrastructure/community/CommunityReplyRepository';
import { contentGrantRepository } from '@/infrastructure/content-access/ContentGrantRepository';
import { contentPageService } from '@/services/firebase/ContentPageService';
import { crosswordRepository, crosswordResultRepository } from '@/infrastructure/crossword/CrosswordRepository';
import { eventService } from '@/services/firebase/EventService';
import { flashcardDeckRepository } from '@/infrastructure/flashcards/FlashcardDeckRepository';
import { flashcardReviewRepository } from '@/infrastructure/flashcards/FlashcardReviewRepository';
import { habitLogRepository } from '@/infrastructure/habits/HabitLogRepository';
import { habitRepository } from '@/infrastructure/habits/HabitRepository';
import { lessonRepository } from '@/infrastructure/formation/LessonRepository';
import { mediaRegistryRepository } from '@/infrastructure/media/MediaRegistryRepository';
import { menuConfigService } from '@/services/firebase/MenuConfigService';
import { mindMapTemplateRepository } from '@/infrastructure/mind-maps/MindMapTemplateRepository';
import { modConfigService } from '@/services/firebase/ModConfigService';
import { moduleRepository } from '@/infrastructure/formation/ModuleRepository';
import { notificationRepository } from '@/infrastructure/notifications/NotificationRepository';
import { pollVoteRepository } from '@/infrastructure/community/PollVoteRepository';
import { prayerIntentionRepository, prayerLogRepository } from '@/infrastructure/prayer/PrayerRepository';
import { progressRepository } from '@/infrastructure/formation/ProgressRepository';
import { quizRepository } from '@/infrastructure/quiz/QuizRepository';
import { reflectionRepository } from '@/infrastructure/spiritual-notebook/ReflectionRepository';
import { studentMindMapRepository } from '@/infrastructure/mind-maps/StudentMindMapRepository';
import { trackRepository } from '@/infrastructure/formation/TrackRepository';
import { trackTypeRepository } from '@/infrastructure/formation/TrackTypeRepository';
import { userService } from '@/services/firebase/UserService';
import { videoWatchSessionRepository } from '@/infrastructure/video-player/VideoWatchSessionRepository';
import { wordSearchRepository, wordSearchResultRepository } from '@/infrastructure/word-search/WordSearchRepository';

function asContract<T>(implementation: unknown): T {
  return implementation as T;
}

const cmsPages = {
  ...contentPageService,
  create: contentPageService.create.bind(contentPageService),
  get: contentPageService.get.bind(contentPageService),
  list: contentPageService.list.bind(contentPageService),
  update: contentPageService.update.bind(contentPageService),
  delete: contentPageService.delete.bind(contentPageService),
  getBySlug: contentPageService.getBySlug.bind(contentPageService),
  getPublished: contentPageService.listPublished.bind(contentPageService),
  getMenuPages: async (): Promise<CMSPage[]> => {
    const pages = await contentPageService.listPublished();
    return pages.filter(page => page.show_in_menu);
  },
};

const cmsMods = {
  create: modConfigService.create.bind(modConfigService),
  get: modConfigService.get.bind(modConfigService),
  list: modConfigService.list.bind(modConfigService),
  update: modConfigService.update.bind(modConfigService),
  delete: modConfigService.delete.bind(modConfigService),
  getActive: async (): Promise<ModConfig[]> => modConfigService.list(),
};

const cmsMenu = {
  getMainMenu: menuConfigService.get.bind(menuConfigService),
  saveMainMenu: menuConfigService.save.bind(menuConfigService),
  create: async (data: Omit<MenuConfig, 'id'>): Promise<MenuConfig> => menuConfigService.save(data),
  get: menuConfigService.get.bind(menuConfigService),
  list: async (): Promise<MenuConfig[]> => {
    const config = await menuConfigService.get();
    return config ? [config] : [];
  },
  update: async (_id: string, data: Partial<Omit<MenuConfig, 'id'>>): Promise<MenuConfig | null> => {
    const current = await menuConfigService.get();
    if (!current) return null;
    return menuConfigService.save({ ...current, ...data });
  },
  delete: async (): Promise<void> => {
    throw new Error('Main menu singleton cannot be deleted through Backend.cms.menu');
  },
};

const cmsAppConfig = {
  getGlobalConfig: appConfigService.getGlobalConfig.bind(appConfigService),
  updateGlobalConfig: async (
    data: Partial<AppGlobalConfigType>,
  ): Promise<AppGlobalConfigType | null> => {
    await appConfigService.updateGlobalConfig(data);
    return appConfigService.getGlobalConfig();
  },
};

const contentGrants = {
  ...contentGrantRepository,
  create: contentGrantRepository.create.bind(contentGrantRepository),
  get: contentGrantRepository.get.bind(contentGrantRepository),
  list: contentGrantRepository.list.bind(contentGrantRepository),
  update: contentGrantRepository.update.bind(contentGrantRepository),
  delete: contentGrantRepository.delete.bind(contentGrantRepository),
  findByUser: async (userId: string) => contentGrantRepository.queryByFilters([
    { field: 'user_id', operator: '==', value: userId },
  ]),
  findByContent: (contentType: Parameters<typeof contentGrantRepository.listForContent>[1], contentId: string) =>
    contentGrantRepository.listForContent(contentId, contentType),
  findUserGrant: (
    userId: string,
    contentType: Parameters<typeof contentGrantRepository.findOne>[2],
    contentId: string,
  ) => contentGrantRepository.findOne(userId, contentId, contentType),
  revoke: contentGrantRepository.delete.bind(contentGrantRepository),
};

const crossword = {
  ...crosswordRepository,
  saveResult: crosswordResultRepository.create.bind(crosswordResultRepository),
  findResult: async (userId: string, puzzleId: string) => {
    const results = await crosswordResultRepository.findByUserAndPuzzle(userId, puzzleId);
    return results[0] ?? null;
  },
};

const wordSearch = {
  ...wordSearchRepository,
  saveResult: wordSearchResultRepository.create.bind(wordSearchResultRepository),
  findResult: async (userId: string, puzzleId: string) => {
    const results = await wordSearchResultRepository.findByUserAndPuzzle(userId, puzzleId);
    return results[0] ?? null;
  },
};

const reflections = {
  ...reflectionRepository,
  findByUserAndLesson: reflectionRepository.findByLesson.bind(reflectionRepository),
};

const notifications = {
  ...notificationRepository,
  markAsRead: notificationRepository.markRead.bind(notificationRepository),
};

export function createFirebaseBackend(): Backend {
  return {
    provider: 'firebase',
    auth: authService,
    users: userService,
    events: eventService,
    cms: {
      pages: asContract(cmsPages),
      mods: asContract(cmsMods),
      menu: asContract(cmsMenu),
      appConfig: asContract(cmsAppConfig),
    },
    permissions: {
      contentGrants: asContract(contentGrants),
    },
    media: {
      registry: asContract(mediaRegistryRepository),
    },
    library: {
      books: asContract(bookRepository),
      categories: asContract(bookCategoryRepository),
      chapters: asContract(bookChapterRepository),
      progress: asContract(bookReadingProgressRepository),
      highlights: asContract(bookHighlightRepository),
      comments: asContract(bookCommentRepository),
      tags: asContract(bookTagRepository),
    },
    formation: {
      trackTypes: asContract(trackTypeRepository),
      tracks: asContract(trackRepository),
      modules: asContract(moduleRepository),
      lessons: asContract(lessonRepository),
      progress: asContract(progressRepository),
    },
    community: {
      categories: asContract(communityCategoryRepository),
      posts: asContract(communityPostRepository),
      replies: asContract(communityReplyRepository),
      votes: asContract(pollVoteRepository),
    },
    activities: {
      quiz: asContract(quizRepository),
      quizAttempts: asContract(attemptRepository),
      flashcardDecks: asContract(flashcardDeckRepository),
      flashcardReviews: asContract(flashcardReviewRepository),
      habits: asContract(habitRepository),
      habitLogs: asContract(habitLogRepository),
      caseStudies: asContract(caseStudyRepository),
      caseRuns: asContract(caseRunRepository),
      crossword: asContract(crossword),
      wordSearch: asContract(wordSearch),
      mindMapTemplates: asContract(mindMapTemplateRepository),
      studentMindMaps: asContract(studentMindMapRepository),
      reflections: asContract(reflections),
      prayerIntentions: asContract(prayerIntentionRepository),
      prayerLogs: asContract(prayerLogRepository),
      notifications: asContract(notifications),
      videoWatchSessions: asContract(videoWatchSessionRepository),
    },
  };
}
