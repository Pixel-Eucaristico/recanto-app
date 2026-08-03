import { FormationService } from '@/application/formation/FormationService';

/**
 * `getTrackLessonCounts` é a origem do denominador honesto. Se ela errar ou custar
 * caro, o bug do percentual volta — ou a lista de alunos fica lenta.
 */

jest.mock('@/application/habits/HabitService', () => ({
  habitService: { meetsCompletionGate: jest.fn().mockResolvedValue(true) },
}));

// O módulo cria um singleton no rodapé, e importar os repositórios reais
// inicializa o Firebase. A classe é instanciada com stubs nos testes.
jest.mock('@/infrastructure/formation/TrackRepository', () => ({ trackRepository: {} }));
jest.mock('@/infrastructure/formation/ModuleRepository', () => ({ moduleRepository: {} }));
jest.mock('@/infrastructure/formation/LessonRepository', () => ({ lessonRepository: {} }));
jest.mock('@/infrastructure/formation/ProgressRepository', () => ({ progressRepository: {} }));

function build(overrides?: {
  tracks?: Record<string, { id: string; module_ids: string[] }>;
  modules?: Record<string, { id: string; lesson_ids: string[] }>;
}) {
  const tracks = overrides?.tracks ?? {
    't-a': { id: 't-a', module_ids: ['m1', 'm2'] },
    't-b': { id: 't-b', module_ids: ['m3'] },
  };
  const modules = overrides?.modules ?? {
    m1: { id: 'm1', lesson_ids: ['l1', 'l2', 'l3'] },
    m2: { id: 'm2', lesson_ids: ['l4', 'l5'] },
    m3: { id: 'm3', lesson_ids: ['l6'] },
  };

  const findById = jest.fn(async (id: string) => tracks[id] ?? null);
  const findByIds = jest.fn(async (ids: string[]) =>
    ids.map(id => modules[id]).filter(Boolean));

  const service = new FormationService(
    { findById } as never,
    { findByIds } as never,
    {} as never,
    {} as never,
  );

  return { service, findById, findByIds };
}

describe('getTrackLessonCounts', () => {
  it('soma as aulas de todos os módulos da trilha', async () => {
    const { service } = build();
    const counts = await service.getTrackLessonCounts(['t-a', 't-b']);

    expect(counts.get('t-a')).toBe(5); // 3 + 2
    expect(counts.get('t-b')).toBe(1);
  });

  it('busca os módulos de todas as trilhas numa chamada só', async () => {
    const { service, findByIds } = build();
    await service.getTrackLessonCounts(['t-a', 't-b']);

    // Um findByIds para os 3 módulos — não um por trilha.
    expect(findByIds).toHaveBeenCalledTimes(1);
    expect(findByIds.mock.calls[0][0].sort()).toEqual(['m1', 'm2', 'm3']);
  });

  it('memoiza — a segunda chamada não relê nada', async () => {
    const { service, findById, findByIds } = build();

    await service.getTrackLessonCounts(['t-a']);
    findById.mockClear();
    findByIds.mockClear();

    const counts = await service.getTrackLessonCounts(['t-a']);
    expect(counts.get('t-a')).toBe(5);
    expect(findById).not.toHaveBeenCalled();
    expect(findByIds).not.toHaveBeenCalled();
  });

  it('busca só as trilhas ausentes do cache', async () => {
    const { service, findById } = build();

    await service.getTrackLessonCounts(['t-a']);
    findById.mockClear();

    const counts = await service.getTrackLessonCounts(['t-a', 't-b']);
    expect(findById).toHaveBeenCalledTimes(1);
    expect(findById).toHaveBeenCalledWith('t-b');
    expect(counts.get('t-a')).toBe(5);
    expect(counts.get('t-b')).toBe(1);
  });

  it('deduplica ids repetidos', async () => {
    const { service, findById } = build();
    await service.getTrackLessonCounts(['t-a', 't-a', 't-a']);
    expect(findById).toHaveBeenCalledTimes(1);
  });

  it('devolve vazio sem consultar quando a lista é vazia', async () => {
    const { service, findById, findByIds } = build();
    await expect(service.getTrackLessonCounts([])).resolves.toEqual(new Map());
    expect(findById).not.toHaveBeenCalled();
    expect(findByIds).not.toHaveBeenCalled();
  });

  it('omite trilha inexistente em vez de gravar zero', async () => {
    const { service } = build();
    const counts = await service.getTrackLessonCounts(['fantasma']);
    // Zero viraria "0%"; ausente vira "—", que é honesto.
    expect(counts.has('fantasma')).toBe(false);
  });

  it('conta zero para trilha sem módulos', async () => {
    const { service } = build({ tracks: { vazia: { id: 'vazia', module_ids: [] } } });
    const counts = await service.getTrackLessonCounts(['vazia']);
    expect(counts.get('vazia')).toBe(0);
  });

  it('ignora módulo referenciado que não existe mais', async () => {
    const { service } = build({
      tracks: { 't-x': { id: 't-x', module_ids: ['m1', 'sumiu'] } },
      modules: { m1: { id: 'm1', lesson_ids: ['l1', 'l2'] } },
    });
    const counts = await service.getTrackLessonCounts(['t-x']);
    expect(counts.get('t-x')).toBe(2);
  });

  it('clearLessonCountCache força releitura', async () => {
    const { service, findById } = build();
    await service.getTrackLessonCounts(['t-a']);
    service.clearLessonCountCache();
    findById.mockClear();

    await service.getTrackLessonCounts(['t-a']);
    expect(findById).toHaveBeenCalledTimes(1);
  });
});
