/**
 * Denormalização de escopo nas content_versions.
 *
 * A rule de `content_versions` autoriza o formador por `track_id`. Se a gravação
 * não denormalizar esse campo, a versão fica invisível pra ele — que era o caso das
 * respostas de fórum: `updateReply` não gravava nem `lesson_id` nem `track_id`.
 */

const mockPostGet = jest.fn();
const mockPostUpdate = jest.fn();
const mockReplyGet = jest.fn();
const mockReplyUpdate = jest.fn();
const mockRecord = jest.fn();

jest.mock('@/infrastructure/community/CommunityPostRepository', () => ({
  communityPostRepository: {
    get: (...a: unknown[]) => mockPostGet(...a),
    update: (...a: unknown[]) => mockPostUpdate(...a),
  },
}));

jest.mock('@/infrastructure/community/CommunityReplyRepository', () => ({
  communityReplyRepository: {
    get: (...a: unknown[]) => mockReplyGet(...a),
    update: (...a: unknown[]) => mockReplyUpdate(...a),
  },
}));

jest.mock('@/infrastructure/community/CommunityCategoryRepository', () => ({
  communityCategoryRepository: {},
}));

jest.mock('@/infrastructure/community/PollVoteRepository', () => ({
  pollVoteRepository: {},
}));

jest.mock('@/application/content-versions/ContentVersionService', () => ({
  contentVersionService: { record: (...a: unknown[]) => mockRecord(...a) },
}));

import { CommunityService } from '@/application/community/CommunityService';

const service = new CommunityService();

const lessonPost = {
  id: 'p1', title: 'Antigo', body: 'Corpo antigo', created_by: 'aluno1',
  visibility: { scope: 'lesson', track_id: 't-a', lesson_id: 'l1' },
};

const trackPost = {
  ...lessonPost, id: 'p2', visibility: { scope: 'track', track_id: 't-a' },
};

const globalPost = {
  ...lessonPost, id: 'p3', visibility: { scope: 'global' },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockRecord.mockResolvedValue(undefined);
  mockPostUpdate.mockResolvedValue(null);
  mockReplyUpdate.mockResolvedValue(null);
});

describe('updatePost', () => {
  it('grava track_id e lesson_id para post de aula', async () => {
    mockPostGet.mockResolvedValue(lessonPost);

    await service.updatePost('p1', 'aluno1', { body: 'Corpo novo' });

    expect(mockRecord).toHaveBeenCalledWith(expect.objectContaining({
      target_collection: 'community_posts',
      target_id: 'p1',
      track_id: 't-a',
      lesson_id: 'l1',
      payload: { title: 'Antigo', body: 'Corpo antigo' },
    }));
  });

  it('grava track_id sem lesson_id para post de trilha', async () => {
    mockPostGet.mockResolvedValue(trackPost);

    await service.updatePost('p2', 'aluno1', { body: 'Outro corpo' });

    const arg = mockRecord.mock.calls[0][0];
    expect(arg.track_id).toBe('t-a');
    expect(arg.lesson_id).toBeUndefined();
  });

  it('não inventa trilha para post global', async () => {
    mockPostGet.mockResolvedValue(globalPost);

    await service.updatePost('p3', 'aluno1', { body: 'Corpo global' });

    const arg = mockRecord.mock.calls[0][0];
    expect(arg.track_id).toBeUndefined();
    expect(arg.lesson_id).toBeUndefined();
  });

  it('não grava versão quando nada mudou', async () => {
    mockPostGet.mockResolvedValue(lessonPost);

    await service.updatePost('p1', 'aluno1', { body: 'Corpo antigo' });

    expect(mockRecord).not.toHaveBeenCalled();
  });

  it('recusa edição de quem não é o autor', async () => {
    mockPostGet.mockResolvedValue(lessonPost);

    await expect(
      service.updatePost('p1', 'intruso', { body: 'Hackeado' }),
    ).rejects.toThrow('Apenas o autor pode editar.');
    expect(mockPostUpdate).not.toHaveBeenCalled();
  });
});

describe('updateReply', () => {
  const reply = { id: 'rep1', post_id: 'p1', body: 'Corpo antigo', created_by: 'aluno1' };

  it('herda track_id e lesson_id do post pai — era o gap', async () => {
    mockReplyGet.mockResolvedValue(reply);
    mockPostGet.mockResolvedValue(lessonPost);

    await service.updateReply('rep1', 'aluno1', 'Corpo novo');

    expect(mockPostGet).toHaveBeenCalledWith('p1');
    expect(mockRecord).toHaveBeenCalledWith(expect.objectContaining({
      target_collection: 'community_replies',
      target_id: 'rep1',
      track_id: 't-a',
      lesson_id: 'l1',
      payload: { body: 'Corpo antigo' },
    }));
  });

  it('não quebra quando o post pai sumiu', async () => {
    mockReplyGet.mockResolvedValue(reply);
    mockPostGet.mockResolvedValue(null);

    await service.updateReply('rep1', 'aluno1', 'Corpo novo');

    const arg = mockRecord.mock.calls[0][0];
    expect(arg.track_id).toBeUndefined();
    expect(mockReplyUpdate).toHaveBeenCalledWith('rep1', { body: 'Corpo novo' });
  });

  it('não grava versão quando o texto é idêntico', async () => {
    mockReplyGet.mockResolvedValue(reply);

    await service.updateReply('rep1', 'aluno1', '  Corpo antigo  ');

    expect(mockRecord).not.toHaveBeenCalled();
  });

  it('recusa edição de quem não é o autor', async () => {
    mockReplyGet.mockResolvedValue(reply);

    await expect(
      service.updateReply('rep1', 'intruso', 'Hackeado'),
    ).rejects.toThrow('Apenas o autor pode editar.');
  });
});
