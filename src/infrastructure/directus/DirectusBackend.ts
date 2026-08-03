import type { Backend } from '@/backend/backend.types';
import { directusAuthRepository } from './auth/DirectusAuthRepository';
import {
  directusAppConfigRepository,
  directusCmsMenuRepository,
  directusCmsModRepository,
  directusCmsPageRepository,
} from './cms/DirectusCmsRepositories';
import { directusEventRepository } from './events/DirectusEventRepository';
import {
  directusBookCategoryRepository,
  directusBookChapterRepository,
  directusBookCommentRepository,
  directusBookHighlightRepository,
  directusBookReadingProgressRepository,
  directusBookRepository,
  directusBookTagRepository,
} from './library/DirectusLibraryRepositories';
import {
  directusLessonRepository,
  directusModuleRepository,
  directusProgressRepository,
  directusTrackRepository,
  directusTrackTypeRepository,
} from './formation/DirectusFormationRepositories';
import {
  directusCommunityCategoryRepository,
  directusCommunityPostRepository,
  directusCommunityReplyRepository,
  directusPollVoteRepository,
} from './community/DirectusCommunityRepositories';
import {
  directusCaseRunRepository,
  directusCaseStudyRepository,
  directusCrosswordRepository,
  directusFlashcardDeckRepository,
  directusFlashcardReviewRepository,
  directusHabitLogRepository,
  directusHabitRepository,
  directusMindMapTemplateRepository,
  directusNotificationRepository,
  directusPrayerIntentionRepository,
  directusPrayerLogRepository,
  directusQuizAttemptRepository,
  directusQuizRepository,
  directusReflectionRepository,
  directusStudentMindMapRepository,
  directusVideoWatchSessionRepository,
  directusWordSearchRepository,
} from './activities/DirectusActivityRepositories';
import { directusContentGrantRepository } from './permissions/DirectusContentGrantRepository';
import { directusUserRepository } from './users/DirectusUserRepository';

function notImplemented(method: string): never {
  throw new Error(
    `Directus backend ainda nao implementa "${method}". Use Firebase enquanto o adapter Directus e a infra declarativa estiverem sendo migrados.`,
  );
}

function unavailable<T extends object>(scope: string): T {
  return new Proxy(
    {},
    {
      get(_target, property) {
        if (property === 'then') return undefined;
        return () => notImplemented(`${scope}.${String(property)}`);
      },
    },
  ) as T;
}

export function createDirectusBackend(): Backend {
  return {
    provider: 'directus',
    auth: directusAuthRepository,
    users: directusUserRepository,
    events: directusEventRepository,
    cms: {
      pages: directusCmsPageRepository,
      mods: directusCmsModRepository,
      menu: directusCmsMenuRepository,
      appConfig: directusAppConfigRepository,
    },
    permissions: {
      contentGrants: directusContentGrantRepository,
    },
    media: {
      registry: unavailable('media.registry'),
    },
    library: {
      books: directusBookRepository,
      categories: directusBookCategoryRepository,
      chapters: directusBookChapterRepository,
      progress: directusBookReadingProgressRepository,
      highlights: directusBookHighlightRepository,
      comments: directusBookCommentRepository,
      tags: directusBookTagRepository,
    },
    formation: {
      trackTypes: directusTrackTypeRepository,
      tracks: directusTrackRepository,
      modules: directusModuleRepository,
      lessons: directusLessonRepository,
      progress: directusProgressRepository,
    },
    community: {
      categories: directusCommunityCategoryRepository,
      posts: directusCommunityPostRepository,
      replies: directusCommunityReplyRepository,
      votes: directusPollVoteRepository,
    },
    activities: {
      quiz: directusQuizRepository,
      quizAttempts: directusQuizAttemptRepository,
      flashcardDecks: directusFlashcardDeckRepository,
      flashcardReviews: directusFlashcardReviewRepository,
      habits: directusHabitRepository,
      habitLogs: directusHabitLogRepository,
      caseStudies: directusCaseStudyRepository,
      caseRuns: directusCaseRunRepository,
      crossword: directusCrosswordRepository,
      wordSearch: directusWordSearchRepository,
      mindMapTemplates: directusMindMapTemplateRepository,
      studentMindMaps: directusStudentMindMapRepository,
      reflections: directusReflectionRepository,
      prayerIntentions: directusPrayerIntentionRepository,
      prayerLogs: directusPrayerLogRepository,
      notifications: directusNotificationRepository,
      videoWatchSessions: directusVideoWatchSessionRepository,
    },
  };
}
