/**
 * Testes da linha do tempo de atividades.
 *
 * Ponto central: as atividades (quiz, cruzadinha, flashcards…) só têm `lesson_id`,
 * sem `track_id`. O escopo sai do `formation_progress` do aluno. Se esse mapa falhar,
 * um formador veria atividade de curso que não acompanha.
 */

const mockGetMyTracks = jest.fn();
const mockProgressFindByUser = jest.fn();
const mockLessonFindByIds = jest.fn();
const mockAttemptFindByUser = jest.fn();
const mockCrosswordFindByUser = jest.fn();
const mockWordSearchFindByUser = jest.fn();
const mockFlashcardFindByUser = jest.fn();
const mockCaseFindByUser = jest.fn();
const mockVideoFindByUser = jest.fn();
const mockHabitLogFindByUser = jest.fn();
const mockHabitListAll = jest.fn();
const mockReflectionFindByUser = jest.fn();
const mockPostFindByUser = jest.fn();
const mockPostFindByIds = jest.fn();
const mockReplyFindByUser = jest.fn();

jest.mock('@/application/formation/FormatorService', () => ({
  formatorService: { getMyTracks: (...a: unknown[]) => mockGetMyTracks(...a) },
}));
jest.mock('@/infrastructure/formation/ProgressRepository', () => ({
  progressRepository: { findByUser: (...a: unknown[]) => mockProgressFindByUser(...a) },
}));
jest.mock('@/infrastructure/formation/LessonRepository', () => ({
  lessonRepository: { findByIds: (...a: unknown[]) => mockLessonFindByIds(...a) },
}));
jest.mock('@/infrastructure/quiz/AttemptRepository', () => ({
  attemptRepository: { findByUser: (...a: unknown[]) => mockAttemptFindByUser(...a) },
}));
jest.mock('@/infrastructure/crossword/CrosswordRepository', () => ({
  crosswordResultRepository: { findByUser: (...a: unknown[]) => mockCrosswordFindByUser(...a) },
}));
jest.mock('@/infrastructure/word-search/WordSearchRepository', () => ({
  wordSearchResultRepository: { findByUser: (...a: unknown[]) => mockWordSearchFindByUser(...a) },
}));
jest.mock('@/infrastructure/flashcards/FlashcardReviewRepository', () => ({
  flashcardReviewRepository: { findByUser: (...a: unknown[]) => mockFlashcardFindByUser(...a) },
}));
jest.mock('@/infrastructure/case-studies/CaseRunRepository', () => ({
  caseRunRepository: { findByUser: (...a: unknown[]) => mockCaseFindByUser(...a) },
}));
jest.mock('@/infrastructure/video-player/VideoWatchSessionRepository', () => ({
  videoWatchSessionRepository: { findByUser: (...a: unknown[]) => mockVideoFindByUser(...a) },
}));
jest.mock('@/infrastructure/habits/HabitLogRepository', () => ({
  habitLogRepository: { findByUser: (...a: unknown[]) => mockHabitLogFindByUser(...a) },
}));
jest.mock('@/infrastructure/habits/HabitRepository', () => ({
  habitRepository: { listAll: (...a: unknown[]) => mockHabitListAll(...a) },
}));
jest.mock('@/infrastructure/spiritual-notebook/ReflectionRepository', () => ({
  reflectionRepository: { findByUser: (...a: unknown[]) => mockReflectionFindByUser(...a) },
}));
jest.mock('@/infrastructure/community/CommunityPostRepository', () => ({
  communityPostRepository: {
    findByUser: (...a: unknown[]) => mockPostFindByUser(...a),
    findByIds: (...a: unknown[]) => mockPostFindByIds(...a),
  },
}));
jest.mock('@/infrastructure/community/CommunityReplyRepository', () => ({
  communityReplyRepository: { findByUser: (...a: unknown[]) => mockReplyFindByUser(...a) },
}));

import { studentActivityService } from '@/application/formation/StudentActivityService';

const TRACK_A = { id: 't-a', title: 'Trilha A', formator_ids: ['u-formador'] };
const TRACK_B = { id: 't-b', title: 'Trilha B', formator_ids: ['u-outro'] };

/** Aula da trilha A — dentro do escopo do formador. */
const progressA = {
  id: 'aluno1_l1', user_id: 'aluno1', lesson_id: 'l1', module_id: 'm1', track_id: 't-a',
  status: 'in_progress', created_at: '2026-01-01T00:00:00.000Z',
};

/** Aula da trilha B — fora do escopo. */
const progressB = {
  id: 'aluno1_l9', user_id: 'aluno1', lesson_id: 'l9', module_id: 'm9', track_id: 't-b',
  status: 'in_progress', created_at: '2026-01-01T00:00:00.000Z',
};

const base = { viewerId: 'u-formador', isAdmin: false, studentId: 'aluno1' };

function resetAll() {
  jest.clearAllMocks();
  mockGetMyTracks.mockResolvedValue([TRACK_A]);
  mockProgressFindByUser.mockResolvedValue([progressA]);
  mockLessonFindByIds.mockResolvedValue([{ id: 'l1', title: 'Aula 1', habit_ids: [] }]);
  mockAttemptFindByUser.mockResolvedValue([]);
  mockCrosswordFindByUser.mockResolvedValue([]);
  mockWordSearchFindByUser.mockResolvedValue([]);
  mockFlashcardFindByUser.mockResolvedValue([]);
  mockCaseFindByUser.mockResolvedValue([]);
  mockVideoFindByUser.mockResolvedValue([]);
  mockHabitLogFindByUser.mockResolvedValue([]);
  mockHabitListAll.mockResolvedValue([]);
  mockReflectionFindByUser.mockResolvedValue([]);
  mockPostFindByUser.mockResolvedValue([]);
  mockPostFindByIds.mockResolvedValue([]);
  mockReplyFindByUser.mockResolvedValue([]);
}

beforeEach(resetAll);

describe('escopo', () => {
  it('não consulta nada sem trilhas', async () => {
    mockGetMyTracks.mockResolvedValue([]);

    const result = await studentActivityService.listForStudent(base);

    expect(result.events).toEqual([]);
    expect(mockProgressFindByUser).not.toHaveBeenCalled();
  });

  it('para cedo quando o aluno não tem progresso nas trilhas do viewer', async () => {
    mockProgressFindByUser.mockResolvedValue([progressB]);

    const result = await studentActivityService.listForStudent(base);

    expect(result.events).toEqual([]);
    expect(mockAttemptFindByUser).not.toHaveBeenCalled();
  });

  it('descarta atividade de aula fora do escopo', async () => {
    mockProgressFindByUser.mockResolvedValue([progressA, progressB]);
    mockAttemptFindByUser.mockResolvedValue([
      { id: 'q1', lesson_id: 'l1', score: 80, passed: true, attempted_at: '2026-02-01T10:00:00.000Z' },
      { id: 'q9', lesson_id: 'l9', score: 90, passed: true, attempted_at: '2026-02-02T10:00:00.000Z' },
    ]);

    const { events } = await studentActivityService.listForStudent(base);

    const quizzes = events.filter(e => e.kind === 'quiz');
    expect(quizzes).toHaveLength(1);
    expect(quizzes[0].key).toBe('quiz:q1');
  });

  it('admin vê as duas trilhas', async () => {
    mockGetMyTracks.mockResolvedValue([TRACK_A, TRACK_B]);
    mockProgressFindByUser.mockResolvedValue([progressA, progressB]);
    mockLessonFindByIds.mockResolvedValue([
      { id: 'l1', title: 'Aula 1' }, { id: 'l9', title: 'Aula 9' },
    ]);
    mockAttemptFindByUser.mockResolvedValue([
      { id: 'q1', lesson_id: 'l1', score: 80, passed: true, attempted_at: '2026-02-01T10:00:00.000Z' },
      { id: 'q9', lesson_id: 'l9', score: 90, passed: true, attempted_at: '2026-02-02T10:00:00.000Z' },
    ]);

    const { events } = await studentActivityService.listForStudent({
      viewerId: 'u-admin', isAdmin: true, studentId: 'aluno1',
    });

    expect(events.filter(e => e.kind === 'quiz')).toHaveLength(2);
  });
});

describe('tipos de atividade', () => {
  it('registra quiz aprovado e reprovado com desfecho distinto', async () => {
    mockAttemptFindByUser.mockResolvedValue([
      { id: 'q1', lesson_id: 'l1', score: 80, passed: true, attempted_at: '2026-02-02T10:00:00.000Z' },
      { id: 'q2', lesson_id: 'l1', score: 40, passed: false, attempted_at: '2026-02-01T10:00:00.000Z' },
    ]);

    const { events } = await studentActivityService.listForStudent(base);

    const [aprovado, reprovado] = events.filter(e => e.kind === 'quiz');
    expect(aprovado).toMatchObject({ title: 'Passou no quiz', detail: '80%', outcome: 'success' });
    expect(reprovado).toMatchObject({ title: 'Tentou o quiz', detail: '40%', outcome: 'fail' });
  });

  it('distingue vídeo concluído de vídeo em andamento', async () => {
    mockVideoFindByUser.mockResolvedValue([
      { id: 's1', lesson_id: 'l1', started_at: '2026-02-01T10:00:00.000Z', ended_at: '2026-02-01T10:20:00.000Z', seconds_watched: 600 },
      { id: 's2', lesson_id: 'l1', started_at: '2026-02-02T10:00:00.000Z', seconds_watched: 30 },
    ]);

    const { events } = await studentActivityService.listForStudent(base);
    const sessions = events.filter(e => e.kind === 'video_watch');

    expect(sessions.find(e => e.key === 'video_watch:s1')).toMatchObject({
      title: 'Assistiu o vídeo', detail: '10 min',
    });
    expect(sessions.find(e => e.key === 'video_watch:s2')).toMatchObject({
      title: 'Começou a assistir', detail: '30s',
    });
  });

  it('inclui cruzadinha, caça-palavras, flashcards e estudo de caso', async () => {
    mockCrosswordFindByUser.mockResolvedValue([{ id: 'c1', lesson_id: 'l1', score: 90, completed_at: '2026-02-01T10:00:00.000Z' }]);
    mockWordSearchFindByUser.mockResolvedValue([{ id: 'w1', lesson_id: 'l1', score: 60, completed_at: '2026-02-02T10:00:00.000Z' }]);
    mockFlashcardFindByUser.mockResolvedValue([{ id: 'f1', lesson_id: 'l1', score: 100, correct_count: 8, reviewed_at: '2026-02-03T10:00:00.000Z' }]);
    mockCaseFindByUser.mockResolvedValue([{ id: 'cs1', lesson_id: 'l1', run_at: '2026-02-04T10:00:00.000Z' }]);

    const { events, counts } = await studentActivityService.listForStudent(base);

    expect(counts.byKind.crossword).toBe(1);
    expect(counts.byKind.word_search).toBe(1);
    expect(counts.byKind.flashcards).toBe(1);
    expect(counts.byKind.case_study).toBe(1);
    expect(events.find(e => e.kind === 'flashcards')?.detail).toBe('8 acertos · 100%');
    // score < 70 não é sucesso.
    expect(events.find(e => e.kind === 'word_search')?.outcome).toBe('neutral');
  });

  it('marca conclusão da aula, e liberação só quando não concluiu', async () => {
    mockProgressFindByUser.mockResolvedValue([
      { ...progressA, unlocked_at: '2026-01-05T00:00:00.000Z', completed_at: '2026-01-06T00:00:00.000Z' },
    ]);

    const { events } = await studentActivityService.listForStudent(base);

    expect(events.filter(e => e.kind === 'lesson_completed')).toHaveLength(1);
    expect(events.filter(e => e.kind === 'lesson_unlocked')).toHaveLength(0);
  });

  it('inclui reflexão com trecho, sem despejar o texto inteiro', async () => {
    const longo = 'a'.repeat(300);
    mockReflectionFindByUser.mockResolvedValue([{
      id: 'r1', user_id: 'aluno1', lesson_id: 'l1', lesson_title: 'Aula 1',
      track_id: 't-a', track_title: 'Trilha A', content: longo, status: 'submitted',
      created_at: '2026-02-01T10:00:00.000Z', submitted_at: '2026-02-01T10:00:00.000Z',
    }]);

    const { events } = await studentActivityService.listForStudent(base);
    const reflexao = events.find(e => e.kind === 'reflection')!;

    expect(reflexao.title).toBe('Enviou a reflexão');
    expect(reflexao.detail!.length).toBeLessThan(120);
    expect(reflexao.detail!.endsWith('…')).toBe(true);
  });

  it('resolve a resposta do fórum pelo post pai e descarta fora do escopo', async () => {
    mockReplyFindByUser.mockResolvedValue([
      { id: 'rep1', post_id: 'p1', body: 'Concordo', created_at: '2026-02-01T10:00:00.000Z' },
      { id: 'rep2', post_id: 'p2', body: 'Global', created_at: '2026-02-02T10:00:00.000Z' },
    ]);
    mockPostFindByIds.mockResolvedValue([
      { id: 'p1', title: 'Dúvida', visibility: { scope: 'lesson', track_id: 't-a', lesson_id: 'l1' } },
      { id: 'p2', title: 'Geral', visibility: { scope: 'global' } },
    ]);

    const { events } = await studentActivityService.listForStudent(base);
    const respostas = events.filter(e => e.kind === 'forum_reply');

    expect(respostas).toHaveLength(1);
    expect(respostas[0].key).toBe('forum_reply:rep1');
  });
});

describe('hábitos', () => {
  it('só mostra hábitos referenciados pelas aulas do escopo', async () => {
    mockLessonFindByIds.mockResolvedValue([{ id: 'l1', title: 'Aula 1', habit_ids: ['h-oracao'] }]);
    mockHabitLogFindByUser.mockResolvedValue([
      { id: 'log1', habit_id: 'h-oracao', log_date: '2026-02-01', logged_at: '2026-02-01T08:00:00.000Z' },
      { id: 'log2', habit_id: 'h-outro', log_date: '2026-02-01', logged_at: '2026-02-01T09:00:00.000Z' },
    ]);
    mockHabitListAll.mockResolvedValue([{ id: 'h-oracao', title: 'Oração diária' }]);

    const { events } = await studentActivityService.listForStudent(base);
    const habitos = events.filter(e => e.kind === 'habit_log');

    expect(habitos).toHaveLength(1);
    expect(habitos[0].title).toBe('Registrou: Oração diária');
  });

  it('nem consulta hábitos quando nenhuma aula do escopo referencia algum', async () => {
    mockLessonFindByIds.mockResolvedValue([{ id: 'l1', title: 'Aula 1', habit_ids: [] }]);

    await studentActivityService.listForStudent(base);

    expect(mockHabitLogFindByUser).not.toHaveBeenCalled();
  });
});

describe('ordenação e contadores', () => {
  it('ordena do mais recente pro mais antigo', async () => {
    mockAttemptFindByUser.mockResolvedValue([
      { id: 'q1', lesson_id: 'l1', score: 50, passed: false, attempted_at: '2026-01-01T10:00:00.000Z' },
    ]);
    mockCaseFindByUser.mockResolvedValue([{ id: 'cs1', lesson_id: 'l1', run_at: '2026-03-01T10:00:00.000Z' }]);

    const { events } = await studentActivityService.listForStudent(base);

    expect(events.map(e => e.kind)).toEqual(['case_study', 'quiz']);
  });

  it('conta total, tipos, última atividade e dias ativos', async () => {
    mockAttemptFindByUser.mockResolvedValue([
      { id: 'q1', lesson_id: 'l1', score: 80, passed: true, attempted_at: '2026-02-01T10:00:00.000Z' },
      { id: 'q2', lesson_id: 'l1', score: 90, passed: true, attempted_at: '2026-02-01T18:00:00.000Z' },
      { id: 'q3', lesson_id: 'l1', score: 70, passed: true, attempted_at: '2026-02-05T10:00:00.000Z' },
    ]);

    const { counts } = await studentActivityService.listForStudent(base);

    expect(counts.total).toBe(3);
    expect(counts.byKind.quiz).toBe(3);
    expect(counts.lastAt).toBe('2026-02-05T10:00:00.000Z');
    // Dois eventos no mesmo dia contam como um dia ativo.
    expect(counts.activeDays).toBe(2);
  });
});

describe('falha parcial', () => {
  it('avisa em vez de fingir que o aluno não fez nada', async () => {
    mockAttemptFindByUser.mockRejectedValue(new Error('Missing or insufficient permissions'));
    mockCaseFindByUser.mockResolvedValue([{ id: 'cs1', lesson_id: 'l1', run_at: '2026-02-01T10:00:00.000Z' }]);

    const { events, warnings } = await studentActivityService.listForStudent(base);

    expect(events.filter(e => e.kind === 'case_study')).toHaveLength(1);
    expect(warnings.some(w => w.includes('quizzes'))).toBe(true);
  });
});
