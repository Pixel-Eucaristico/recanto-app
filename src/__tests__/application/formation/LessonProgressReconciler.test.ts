import { LessonProgressReconciler } from '@/application/formation/LessonProgressReconciler';
import { flagsToComponents } from '@/domain/lesson-components/migrationShim';
import type { FormationLesson, LessonProgress } from '@/domain/formation/types';

/**
 * Mapa mental é atividade exploratória — sempre opcional. O builder liga
 * `requires_mind_map` só pra marcar que a aula tem mapa; se isso virar requisito,
 * o aluno fica preso na aula até salvar o mapa.
 */

const getOrCreate = jest.fn();
const upsert = jest.fn();
const getTemplateByLesson = jest.fn();
const findByUserAndTemplate = jest.fn();

jest.mock('@/infrastructure/formation/ProgressRepository', () => ({
  progressRepository: {
    getOrCreate: (...a: unknown[]) => getOrCreate(...a),
    upsert: (...a: unknown[]) => upsert(...a),
  },
}));
jest.mock('@/application/mind-maps/MindMapService', () => ({
  mindMapService: { getTemplateByLesson: (...a: unknown[]) => getTemplateByLesson(...a) },
}));
jest.mock('@/infrastructure/mind-maps/StudentMindMapRepository', () => ({
  studentMindMapRepository: { findByUserAndTemplate: (...a: unknown[]) => findByUserAndTemplate(...a) },
}));
jest.mock('@/application/spiritual-notebook/ReflectionService', () => ({ reflectionService: {} }));
jest.mock('@/application/quiz/QuizService', () => ({ quizService: {} }));
jest.mock('@/infrastructure/community/CommunityPostRepository', () => ({ communityPostRepository: {} }));
jest.mock('@/application/crossword/CrosswordService', () => ({ crosswordService: {} }));
jest.mock('@/application/word-search/WordSearchService', () => ({ wordSearchService: {} }));
jest.mock('@/application/flashcards/FlashcardService', () => ({ flashcardService: {} }));
jest.mock('@/application/case-studies/CaseStudyService', () => ({ caseStudyService: {} }));

function lesson(overrides: Partial<FormationLesson> = {}): FormationLesson {
  return {
    id: 'l1',
    module_id: 'm1',
    title: 'Aula',
    min_watch_percent: 80,
    requires_reflection: false,
    requires_quiz: false,
    requires_forum_post: false,
    requires_mind_map: true,
    unlock_after_hours: 0,
    highlight_quotes: [],
    ...overrides,
  } as FormationLesson;
}

function progress(overrides: Partial<LessonProgress> = {}): LessonProgress {
  return {
    id: 'u1_l1',
    user_id: 'u1',
    lesson_id: 'l1',
    module_id: 'm1',
    track_id: 't1',
    status: 'in_progress',
    video_watch_percent: 100,
    video_watch_seconds: 0,
    video_last_position_seconds: 0,
    video_completed_at: '2026-09-29T10:00:00.000Z',
    reflection_submitted: false,
    quiz_passed: false,
    forum_post_made: false,
    created_at: '2026-09-29T09:00:00.000Z',
    ...overrides,
  } as LessonProgress;
}

beforeEach(() => {
  jest.clearAllMocks();
  upsert.mockImplementation(async (_u: string, _l: string, patch: Partial<LessonProgress>) => progress(patch));
  getTemplateByLesson.mockResolvedValue({ id: 'tpl1' });
});

describe('LessonProgressReconciler — mapa mental', () => {
  it('conclui a aula mesmo sem o aluno ter salvo o mapa mental', async () => {
    getOrCreate.mockResolvedValue(progress());
    findByUserAndTemplate.mockResolvedValue(null);

    const res = await new LessonProgressReconciler().reconcile('u1', lesson(), 'm1', 't1');

    expect(res.changed).toContain('status=completed');
    expect(res.changed).not.toContain('mind_map_passed');
    expect(upsert).toHaveBeenCalledWith('u1', 'l1', expect.objectContaining({ status: 'completed' }));
  });

  it('continua registrando mind_map_passed quando o aluno salvou o mapa', async () => {
    getOrCreate.mockResolvedValue(progress());
    findByUserAndTemplate.mockResolvedValue({ id: 'u1_tpl1' });

    const res = await new LessonProgressReconciler().reconcile('u1', lesson(), 'm1', 't1');

    expect(res.changed).toEqual(expect.arrayContaining(['mind_map_passed', 'status=completed']));
  });

  it('ainda exige o vídeo — mapa opcional não libera a aula sozinho', async () => {
    getOrCreate.mockResolvedValue(progress({ video_watch_percent: 10, video_completed_at: undefined }));
    findByUserAndTemplate.mockResolvedValue({ id: 'u1_tpl1' });

    const res = await new LessonProgressReconciler().reconcile('u1', lesson(), 'm1', 't1');

    expect(res.changed).not.toContain('status=completed');
  });
});

describe('flagsToComponents — mapa mental', () => {
  it('deriva o mapa mental como componente opcional', () => {
    const mindMap = flagsToComponents(lesson()).find(c => c.kind === 'mind_map');
    expect(mindMap).toBeDefined();
    expect(mindMap?.required).toBe(false);
  });

  it('mantém as demais atividades obrigatórias', () => {
    const comps = flagsToComponents(lesson({ requires_quiz: true, quiz_id: 'q1', requires_crossword: true }));
    expect(comps.find(c => c.kind === 'quiz')?.required).toBe(true);
    expect(comps.find(c => c.kind === 'crossword')?.required).toBe(true);
  });
});
