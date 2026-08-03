/**
 * Testes do StudentWritingsService.
 *
 * O que importa aqui não é "lista escritos" — é o RECORTE. Um formador só pode ver
 * alunos das trilhas onde está em `formator_ids`; admin vê todas. E o `batchSize`
 * das queries multi-trilha é requisito de segurança, não performance: com batch
 * grande, os `get()` da rule `isTrackFormator` estouram o limite de access-calls do
 * Firestore e a query falha inteira.
 */

const mockGetMyTracks = jest.fn();
const mockReflectionFindByUser = jest.fn();
const mockReflectionFindByTracks = jest.fn();
const mockReflectionFindByTracksAndStatus = jest.fn();
const mockPostFindByUser = jest.fn();
const mockPostFindByIds = jest.fn();
const mockPostFindByTrackIds = jest.fn();
const mockReplyFindByUser = jest.fn();
const mockVersionListByUser = jest.fn();
const mockVersionListByTarget = jest.fn();
const mockUserGet = jest.fn();

jest.mock('@/application/formation/FormatorService', () => ({
  formatorService: { getMyTracks: (...a: unknown[]) => mockGetMyTracks(...a) },
}));

jest.mock('@/infrastructure/spiritual-notebook/ReflectionRepository', () => ({
  reflectionRepository: {
    findByUser: (...a: unknown[]) => mockReflectionFindByUser(...a),
    findByTracks: (...a: unknown[]) => mockReflectionFindByTracks(...a),
    findByTracksAndStatus: (...a: unknown[]) => mockReflectionFindByTracksAndStatus(...a),
  },
}));

jest.mock('@/infrastructure/community/CommunityPostRepository', () => ({
  communityPostRepository: {
    findByUser: (...a: unknown[]) => mockPostFindByUser(...a),
    findByIds: (...a: unknown[]) => mockPostFindByIds(...a),
    findByTrackIds: (...a: unknown[]) => mockPostFindByTrackIds(...a),
  },
}));

jest.mock('@/infrastructure/community/CommunityReplyRepository', () => ({
  communityReplyRepository: { findByUser: (...a: unknown[]) => mockReplyFindByUser(...a) },
}));

jest.mock('@/application/content-versions/ContentVersionService', () => ({
  contentVersionService: {
    listByUser: (...a: unknown[]) => mockVersionListByUser(...a),
    listByTarget: (...a: unknown[]) => mockVersionListByTarget(...a),
  },
}));

jest.mock('@/services/firebase', () => ({
  userService: { get: (...a: unknown[]) => mockUserGet(...a) },
}));

import { studentWritingsService } from '@/application/formation/StudentWritingsService';

// ─── Fixtures ──────────────────────────────────────────────────────────────

const TRACK_A = { id: 't-a', title: 'Trilha A', formator_ids: ['u-formador'] };
const TRACK_B = { id: 't-b', title: 'Trilha B', formator_ids: ['u-outro'] };

const reflectionA = {
  id: 'r1', user_id: 'aluno1', lesson_id: 'l1', lesson_title: 'Aula 1',
  module_title: 'Módulo 1', track_id: 't-a', track_title: 'Trilha A',
  content: 'Minha reflexão sobre a misericórdia.', status: 'submitted',
  created_at: '2026-01-10T10:00:00.000Z', submitted_at: '2026-01-10T10:00:00.000Z',
};

/** Fora do escopo do formador — mora na trilha B. */
const reflectionB = {
  ...reflectionA, id: 'r2', user_id: 'aluno2',
  track_id: 't-b', track_title: 'Trilha B',
  content: 'Reflexão de outra trilha.', created_at: '2026-01-11T10:00:00.000Z',
};

const postLesson = {
  id: 'p1', kind: 'forum', title: 'Dúvida da aula', body: 'Não entendi o trecho.',
  visibility: { scope: 'lesson', track_id: 't-a', lesson_id: 'l1' },
  created_by: 'aluno1', created_by_name: 'Aluno Um',
  created_at: '2026-01-12T10:00:00.000Z',
};

const postGlobal = {
  id: 'p2', kind: 'forum', title: 'Assunto geral', body: 'Fora de curso.',
  visibility: { scope: 'global' },
  created_by: 'aluno1', created_by_name: 'Aluno Um',
  created_at: '2026-01-13T10:00:00.000Z',
};

const replyInScope = {
  id: 'rep1', post_id: 'p1', body: 'Também fiquei com essa dúvida.',
  created_by: 'aluno1', created_by_name: 'Aluno Um',
  created_at: '2026-01-14T10:00:00.000Z',
};

const replyOutOfScope = {
  id: 'rep2', post_id: 'p2', body: 'Comentário no post global.',
  created_by: 'aluno1', created_by_name: 'Aluno Um',
  created_at: '2026-01-15T10:00:00.000Z',
};

function resetAll() {
  jest.clearAllMocks();
  mockGetMyTracks.mockResolvedValue([TRACK_A]);
  mockReflectionFindByUser.mockResolvedValue([]);
  mockReflectionFindByTracks.mockResolvedValue([]);
  mockReflectionFindByTracksAndStatus.mockResolvedValue([]);
  mockPostFindByUser.mockResolvedValue([]);
  mockPostFindByIds.mockResolvedValue([]);
  mockPostFindByTrackIds.mockResolvedValue([]);
  mockReplyFindByUser.mockResolvedValue([]);
  mockVersionListByUser.mockResolvedValue([]);
  mockVersionListByTarget.mockResolvedValue([]);
  mockUserGet.mockResolvedValue({ id: 'aluno1', name: 'Aluno Um', email: 'a1@x.com' });
}

beforeEach(resetAll);

// ─── listForStudent ────────────────────────────────────────────────────────

describe('listForStudent', () => {
  const base = { viewerId: 'u-formador', isAdmin: false, studentId: 'aluno1' };

  it('não consulta nada quando o formador não tem trilhas', async () => {
    mockGetMyTracks.mockResolvedValue([]);

    const result = await studentWritingsService.listForStudent(base);

    expect(result.writings).toEqual([]);
    expect(result.counts.total).toBe(0);
    // A guarda evita gastar leitura — e evita expor dados se o escopo vier vazio.
    expect(mockReflectionFindByUser).not.toHaveBeenCalled();
    expect(mockPostFindByUser).not.toHaveBeenCalled();
  });

  it('inclui reflexão da trilha do formador', async () => {
    mockReflectionFindByUser.mockResolvedValue([reflectionA]);

    const { writings } = await studentWritingsService.listForStudent(base);

    expect(writings).toHaveLength(1);
    expect(writings[0]).toMatchObject({
      key: 'reflection:r1',
      kind: 'reflection',
      content: 'Minha reflexão sobre a misericórdia.',
      status: 'submitted',
      track_title: 'Trilha A',
      href: '/app/dashboard/formation/t-a/l1',
    });
  });

  it('descarta reflexão de trilha fora do escopo', async () => {
    mockReflectionFindByUser.mockResolvedValue([reflectionA, reflectionB]);

    const { writings } = await studentWritingsService.listForStudent(base);

    expect(writings.map(w => w.doc_id)).toEqual(['r1']);
  });

  it('inclui post com escopo de aula e descarta post global', async () => {
    mockPostFindByUser.mockResolvedValue([postLesson, postGlobal]);

    const { writings } = await studentWritingsService.listForStudent(base);

    expect(writings.map(w => w.doc_id)).toEqual(['p1']);
    expect(writings[0]).toMatchObject({
      kind: 'forum_post',
      title: 'Dúvida da aula',
      content: 'Não entendi o trecho.',
      track_id: 't-a',
    });
  });

  it('resolve a trilha da resposta pelo post pai', async () => {
    mockReplyFindByUser.mockResolvedValue([replyInScope]);
    mockPostFindByIds.mockResolvedValue([postLesson]);

    const { writings } = await studentWritingsService.listForStudent(base);

    expect(mockPostFindByIds).toHaveBeenCalledWith(['p1']);
    expect(writings).toHaveLength(1);
    expect(writings[0]).toMatchObject({
      kind: 'forum_reply',
      doc_id: 'rep1',
      track_id: 't-a',
      title: 'Em: Dúvida da aula',
    });
  });

  it('descarta resposta cujo post pai está fora do escopo', async () => {
    mockReplyFindByUser.mockResolvedValue([replyOutOfScope]);
    mockPostFindByIds.mockResolvedValue([postGlobal]);

    const { writings } = await studentWritingsService.listForStudent(base);

    expect(writings).toEqual([]);
  });

  it('conta edições por escrito numa query só, sem N+1', async () => {
    mockReflectionFindByUser.mockResolvedValue([reflectionA]);
    mockPostFindByUser.mockResolvedValue([postLesson]);
    mockVersionListByUser.mockResolvedValue([
      { id: 'v1', target_collection: 'spiritual_reflections', target_id: 'r1', created_at: '2026-01-09T00:00:00.000Z', payload: {} },
      { id: 'v2', target_collection: 'spiritual_reflections', target_id: 'r1', created_at: '2026-01-08T00:00:00.000Z', payload: {} },
    ]);

    const { writings } = await studentWritingsService.listForStudent(base);

    expect(mockVersionListByUser).toHaveBeenCalledTimes(1);
    expect(writings.find(w => w.doc_id === 'r1')?.version_count).toBe(2);
    // Post nunca editado: aparece na lista, mas sem histórico.
    expect(writings.find(w => w.doc_id === 'p1')?.version_count).toBe(0);
  });

  it('mostra escrito sem nenhuma versão — getHistory dos plugins não cobriria isso', async () => {
    mockPostFindByUser.mockResolvedValue([postLesson]);
    mockVersionListByUser.mockResolvedValue([]);

    const { writings } = await studentWritingsService.listForStudent(base);

    expect(writings).toHaveLength(1);
    expect(writings[0].content).toBe('Não entendi o trecho.');
    expect(writings[0].version_count).toBe(0);
  });

  it('ordena do mais recente pro mais antigo', async () => {
    mockReflectionFindByUser.mockResolvedValue([reflectionA]);
    mockPostFindByUser.mockResolvedValue([postLesson]);

    const { writings } = await studentWritingsService.listForStudent(base);

    expect(writings.map(w => w.doc_id)).toEqual(['p1', 'r1']);
  });

  it('registra warning em vez de virar lista vazia silenciosa', async () => {
    mockReflectionFindByUser.mockRejectedValue(new Error('Missing or insufficient permissions'));
    mockPostFindByUser.mockResolvedValue([postLesson]);

    const { writings, warnings } = await studentWritingsService.listForStudent(base);

    // A falha de uma fonte não derruba as outras...
    expect(writings.map(w => w.doc_id)).toEqual(['p1']);
    // ...mas fica visível.
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('reflexões');
    expect(warnings[0]).toContain('insufficient permissions');
  });

  it('admin enxerga aluno de qualquer trilha', async () => {
    mockGetMyTracks.mockResolvedValue([TRACK_A, TRACK_B]);
    mockReflectionFindByUser.mockResolvedValue([reflectionA, reflectionB]);

    const { writings } = await studentWritingsService.listForStudent({
      viewerId: 'u-admin', isAdmin: true, studentId: 'aluno1',
    });

    expect(writings.map(w => w.doc_id).sort()).toEqual(['r1', 'r2']);
  });

  it('usa o nome do usuário resolvido, com fallback pro id', async () => {
    mockReflectionFindByUser.mockResolvedValue([reflectionA]);
    mockUserGet.mockResolvedValue(null);

    const { writings } = await studentWritingsService.listForStudent(base);

    expect(writings[0].student_name).toBe('aluno1');
  });
});

// ─── listForScope ──────────────────────────────────────────────────────────

describe('listForScope', () => {
  it('formador consulta UMA trilha por query (batchSize 1)', async () => {
    mockGetMyTracks.mockResolvedValue([TRACK_A]);

    await studentWritingsService.listForScope({ viewerId: 'u-formador', isAdmin: false });

    // batchSize > 1 faria a rule isTrackFormator estourar o limite de access-calls.
    expect(mockReflectionFindByTracks).toHaveBeenCalledWith(
      ['t-a'],
      expect.objectContaining({ batchSize: 1 }),
    );
    expect(mockPostFindByTrackIds).toHaveBeenCalledWith(
      ['t-a'],
      expect.objectContaining({ batchSize: 1 }),
    );
  });

  it('admin pode usar batch grande — isAdmin() curto-circuita a rule', async () => {
    mockGetMyTracks.mockResolvedValue([TRACK_A, TRACK_B]);

    await studentWritingsService.listForScope({ viewerId: 'u-admin', isAdmin: true });

    expect(mockReflectionFindByTracks).toHaveBeenCalledWith(
      ['t-a', 't-b'],
      expect.objectContaining({ batchSize: 30 }),
    );
  });

  it('devolve vazio e não consulta quando não há trilhas', async () => {
    mockGetMyTracks.mockResolvedValue([]);

    const result = await studentWritingsService.listForScope({ viewerId: 'u-x', isAdmin: false });

    expect(result.writings).toEqual([]);
    expect(mockReflectionFindByTracks).not.toHaveBeenCalled();
  });

  it('respeita o filtro de trilha, mas ainda devolve todas as trilhas do escopo', async () => {
    mockGetMyTracks.mockResolvedValue([TRACK_A, TRACK_B]);

    const result = await studentWritingsService.listForScope({
      viewerId: 'u-admin', isAdmin: true, filter: { trackIds: ['t-b'] },
    });

    expect(mockReflectionFindByTracks).toHaveBeenCalledWith(['t-b'], expect.anything());
    // O select de filtro precisa continuar listando todas as opções.
    expect(result.tracks).toHaveLength(2);
  });

  it('agrega contadores por status e por trilha', async () => {
    mockGetMyTracks.mockResolvedValue([TRACK_A]);
    mockReflectionFindByTracks.mockResolvedValue([
      reflectionA,
      { ...reflectionA, id: 'r3', status: 'reviewed', review_notes: 'Muito bom.' },
      { ...reflectionA, id: 'r4', status: 'draft' },
    ]);

    const { counts } = await studentWritingsService.listForScope({
      viewerId: 'u-formador', isAdmin: false,
    });

    expect(counts.total).toBe(3);
    expect(counts.pendingReview).toBe(1);
    expect(counts.reviewed).toBe(1);
    expect(counts.drafts).toBe(1);
    expect(counts.byKind.reflection).toBe(3);
    expect(counts.byTrack).toEqual([
      { track_id: 't-a', track_title: 'Trilha A', total: 3, pending: 1 },
    ]);
  });

  it('sinaliza truncamento quando bate no teto', async () => {
    mockGetMyTracks.mockResolvedValue([TRACK_A]);
    mockReflectionFindByTracks.mockResolvedValue(
      Array.from({ length: 300 }, (_, i) => ({ ...reflectionA, id: `r${i}` })),
    );

    const { truncated } = await studentWritingsService.listForScope({
      viewerId: 'u-formador', isAdmin: false,
    });

    expect(truncated).toBe(true);
  });
});

// ─── Filtros ───────────────────────────────────────────────────────────────

describe('filtros', () => {
  const base = { viewerId: 'u-formador', isAdmin: false, studentId: 'aluno1' };

  beforeEach(() => {
    mockReflectionFindByUser.mockResolvedValue([reflectionA]);
    mockPostFindByUser.mockResolvedValue([postLesson]);
  });

  it('filtra por tipo', async () => {
    const { writings } = await studentWritingsService.listForStudent({
      ...base, filter: { kinds: ['reflection'] },
    });
    expect(writings.map(w => w.doc_id)).toEqual(['r1']);
  });

  it('filtra por status', async () => {
    const { writings } = await studentWritingsService.listForStudent({
      ...base, filter: { statuses: ['submitted'] },
    });
    expect(writings.map(w => w.doc_id)).toEqual(['r1']);
  });

  it('filtra por período', async () => {
    const { writings } = await studentWritingsService.listForStudent({
      ...base, filter: { from: '2026-01-11', to: '2026-01-13' },
    });
    expect(writings.map(w => w.doc_id)).toEqual(['p1']);
  });

  it('busca no texto, no título e no nome do aluno', async () => {
    const porTexto = await studentWritingsService.listForStudent({
      ...base, filter: { search: 'misericórdia' },
    });
    expect(porTexto.writings.map(w => w.doc_id)).toEqual(['r1']);

    const porTitulo = await studentWritingsService.listForStudent({
      ...base, filter: { search: 'Dúvida' },
    });
    expect(porTitulo.writings.map(w => w.doc_id)).toEqual(['p1']);

    const porAluno = await studentWritingsService.listForStudent({
      ...base, filter: { search: 'aluno um' },
    });
    expect(porAluno.writings).toHaveLength(2);
  });
});

// ─── listPendingReviews / countPendingReviews ──────────────────────────────

describe('fila de revisão', () => {
  it('busca só reflexões submetidas, escopadas', async () => {
    mockGetMyTracks.mockResolvedValue([TRACK_A]);
    mockReflectionFindByTracksAndStatus.mockResolvedValue([reflectionA]);

    const pending = await studentWritingsService.listPendingReviews({
      viewerId: 'u-formador', isAdmin: false,
    });

    expect(mockReflectionFindByTracksAndStatus).toHaveBeenCalledWith(
      ['t-a'], 'submitted', expect.objectContaining({ batchSize: 1 }),
    );
    expect(pending).toHaveLength(1);
    expect(pending[0].status).toBe('submitted');
  });

  it('conta zero quando o formador não tem trilha', async () => {
    mockGetMyTracks.mockResolvedValue([]);
    await expect(
      studentWritingsService.countPendingReviews('u-x', false),
    ).resolves.toBe(0);
  });

  it('conta os pendentes pro badge', async () => {
    mockGetMyTracks.mockResolvedValue([TRACK_A]);
    mockReflectionFindByTracksAndStatus.mockResolvedValue([reflectionA, { ...reflectionA, id: 'r9' }]);

    await expect(
      studentWritingsService.countPendingReviews('u-formador', false),
    ).resolves.toBe(2);
  });
});

// ─── loadVersions ──────────────────────────────────────────────────────────

describe('loadVersions', () => {
  it('extrai o texto do payload da reflexão', async () => {
    mockVersionListByTarget.mockResolvedValue([
      { id: 'v1', created_at: '2026-01-09T00:00:00.000Z', label: 'Rascunho anterior', payload: { content: 'Texto antigo.' } },
    ]);

    const versions = await studentWritingsService.loadVersions('reflection', 'r1');

    expect(mockVersionListByTarget).toHaveBeenCalledWith('spiritual_reflections', 'r1');
    expect(versions[0]).toMatchObject({ label: 'Rascunho anterior', text: 'Texto antigo.' });
  });

  it('extrai body e título do payload do post', async () => {
    mockVersionListByTarget.mockResolvedValue([
      { id: 'v2', created_at: '2026-01-09T00:00:00.000Z', payload: { body: 'Corpo antigo.', title: 'Título antigo' } },
    ]);

    const versions = await studentWritingsService.loadVersions('forum_post', 'p1');

    expect(mockVersionListByTarget).toHaveBeenCalledWith('community_posts', 'p1');
    expect(versions[0].text).toBe('Corpo antigo.');
    expect(versions[0].title).toBe('Título antigo');
  });

  it('nunca serializa JSON pra tela — payload desconhecido vira aviso legível', async () => {
    mockVersionListByTarget.mockResolvedValue([
      { id: 'v3', created_at: '2026-01-09T00:00:00.000Z', payload: { algo: { estranho: true } } },
    ]);

    const versions = await studentWritingsService.loadVersions('mind_map', 'm1');

    expect(versions[0].text).toBe('(mapa mental)');
    expect(versions[0].text).not.toContain('{');
  });

  it('resume os nós do mapa mental em texto', async () => {
    mockVersionListByTarget.mockResolvedValue([
      {
        id: 'v4', created_at: '2026-01-09T00:00:00.000Z',
        payload: { nodes: [{ label: 'Misericórdia' }, { data: { label: 'Perdão' } }] },
      },
    ]);

    const versions = await studentWritingsService.loadVersions('mind_map', 'm1');

    expect(versions[0].text).toBe('Misericórdia · Perdão');
  });

  it('usa label padrão quando a versão não tem', async () => {
    mockVersionListByTarget.mockResolvedValue([
      { id: 'v5', created_at: '2026-01-09T00:00:00.000Z', payload: { content: 'x' } },
    ]);

    const versions = await studentWritingsService.loadVersions('reflection', 'r1');

    expect(versions[0].label).toBe('Edição');
  });
});
