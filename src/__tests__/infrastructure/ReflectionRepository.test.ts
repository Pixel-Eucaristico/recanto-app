/**
 * Testes do batching multi-trilha.
 *
 * Não é detalhe de performance: a rule `isTrackFormator` faz exists()+get() por
 * trilha distinta na query, e o Firestore corta em 20 access-calls. Um `in` grande
 * derruba a query inteira com `permission-denied`, sem dizer o porquê. Por isso o
 * formador consulta uma trilha por vez.
 */

const mockQueryByFilters = jest.fn();

jest.mock('@/shared/firebase/BaseRepository', () => ({
  BaseRepository: class {
    protected collectionName: string;
    constructor(name: string) { this.collectionName = name; }
    queryByFilters(...args: unknown[]) { return mockQueryByFilters(...args); }
    get() { return Promise.resolve(null); }
    delete() { return Promise.resolve(); }
  },
}));

import { FirebaseReflectionRepository } from '@/infrastructure/spiritual-notebook/ReflectionRepository';

const repo = new FirebaseReflectionRepository();

function reflection(id: string, created_at: string, track_id = 't-a') {
  return { id, track_id, created_at, user_id: 'aluno1', content: '', status: 'draft' };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockQueryByFilters.mockResolvedValue([]);
});

describe('findByTracks', () => {
  it('devolve vazio sem consultar quando não há trilhas', async () => {
    await expect(repo.findByTracks([])).resolves.toEqual([]);
    expect(mockQueryByFilters).not.toHaveBeenCalled();
  });

  it('usa operador == quando o batch tem uma trilha só', async () => {
    await repo.findByTracks(['t-a'], { batchSize: 1 });

    expect(mockQueryByFilters).toHaveBeenCalledTimes(1);
    const [filters] = mockQueryByFilters.mock.calls[0];
    expect(filters).toEqual([{ field: 'track_id', operator: '==', value: 't-a' }]);
  });

  it('faz uma query por trilha quando batchSize é 1 — o caso do formador', async () => {
    await repo.findByTracks(['t-a', 't-b', 't-c'], { batchSize: 1 });

    expect(mockQueryByFilters).toHaveBeenCalledTimes(3);
    const operators = mockQueryByFilters.mock.calls.map(c => c[0][0].operator);
    expect(operators).toEqual(['==', '==', '==']);
  });

  it('usa operador in quando o batch é maior — o caso do admin', async () => {
    await repo.findByTracks(['t-a', 't-b', 't-c'], { batchSize: 30 });

    expect(mockQueryByFilters).toHaveBeenCalledTimes(1);
    const [filters] = mockQueryByFilters.mock.calls[0];
    expect(filters).toEqual([{ field: 'track_id', operator: 'in', value: ['t-a', 't-b', 't-c'] }]);
  });

  it('nunca ultrapassa 30 por batch — limite do operador in', async () => {
    const ids = Array.from({ length: 65 }, (_, i) => `t-${i}`);

    await repo.findByTracks(ids, { batchSize: 999 });

    expect(mockQueryByFilters).toHaveBeenCalledTimes(3); // 30 + 30 + 5
    for (const call of mockQueryByFilters.mock.calls) {
      const value = call[0][0].value;
      expect(Array.isArray(value) ? value.length : 1).toBeLessThanOrEqual(30);
    }
  });

  it('trata batchSize inválido como 1 em vez de quebrar', async () => {
    await repo.findByTracks(['t-a', 't-b'], { batchSize: 0 });
    expect(mockQueryByFilters).toHaveBeenCalledTimes(2);
  });

  it('ordena entre batches e reaplica o teto global', async () => {
    mockQueryByFilters
      .mockResolvedValueOnce([reflection('r1', '2026-01-01T00:00:00.000Z')])
      .mockResolvedValueOnce([reflection('r2', '2026-03-01T00:00:00.000Z')])
      .mockResolvedValueOnce([reflection('r3', '2026-02-01T00:00:00.000Z')]);

    const result = await repo.findByTracks(['t-a', 't-b', 't-c'], { batchSize: 1, limitCount: 2 });

    // Cada batch respeita o limite isolado; sem o corte final voltariam 3.
    expect(result.map(r => r.id)).toEqual(['r2', 'r3']);
  });
});

describe('findByTracksAndStatus', () => {
  it('adiciona o filtro de status e ordena por submitted_at', async () => {
    await repo.findByTracksAndStatus(['t-a'], 'submitted', { batchSize: 1 });

    const [filters, opts] = mockQueryByFilters.mock.calls[0];
    expect(filters).toEqual([
      { field: 'track_id', operator: '==', value: 't-a' },
      { field: 'status', operator: '==', value: 'submitted' },
    ]);
    expect(opts).toMatchObject({ orderByField: 'submitted_at', direction: 'desc' });
  });

  it('devolve vazio sem consultar quando não há trilhas', async () => {
    await expect(repo.findByTracksAndStatus([], 'submitted')).resolves.toEqual([]);
    expect(mockQueryByFilters).not.toHaveBeenCalled();
  });
});
