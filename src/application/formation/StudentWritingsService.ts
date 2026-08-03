/**
 * StudentWritingsService — o que o aluno ESCREVEU dentro de um curso.
 *
 * O FormatorService responde "quanto o aluno avançou" (flags e percentuais).
 * Este responde "o que ele escreveu": reflexões do caderno, perguntas e respostas
 * no fórum, e o histórico de edições de cada um.
 *
 * Escopo: formador vê apenas as trilhas onde está em `formator_ids`; admin vê todas.
 * A mesma regra é aplicada nas Firestore rules (`isTrackFormator`) — o filtro aqui é
 * usabilidade, não a barreira de segurança.
 */

import { formatorService } from '@/application/formation/FormatorService';
import { contentVersionService } from '@/application/content-versions/ContentVersionService';
import { reflectionRepository } from '@/infrastructure/spiritual-notebook/ReflectionRepository';
import { communityPostRepository } from '@/infrastructure/community/CommunityPostRepository';
import { communityReplyRepository } from '@/infrastructure/community/CommunityReplyRepository';
import { userService } from '@/services/firebase';
import type { FormationTrack } from '@/domain/formation/types';
import type { Reflection } from '@/domain/spiritual-notebook/types';
import type { CommunityPost, CommunityReply, CommunityVisibility } from '@/domain/community/types';
import type { ContentVersion } from '@/domain/content-versions/types';
import type { FirebaseUser } from '@/types/firebase-entities';
import type {
  StudentWriting,
  WritingKind,
  WritingVersion,
  WritingsCounts,
  WritingsFilter,
} from '@/domain/formation/writings';

export interface WritingsScopeInput {
  viewerId: string;
  isAdmin: boolean;
  filter?: WritingsFilter;
}

export interface WritingsResult {
  tracks: FormationTrack[];
  writings: StudentWriting[];
  counts: WritingsCounts;
  /** True quando a listagem foi cortada por `SCOPE_LIMIT`. */
  truncated: boolean;
  /**
   * Fontes que falharam. Uma lista vazia por `permission-denied` ou índice ausente
   * é indistinguível de "o aluno não escreveu nada" — sem isso o erro fica invisível.
   */
  warnings: string[];
}

/** Teto da visão agregada — evita varrer o banco inteiro numa trilha grande. */
const SCOPE_LIMIT = 300;

const EMPTY_COUNTS: WritingsCounts = {
  total: 0, pendingReview: 0, reviewed: 0, drafts: 0,
  byKind: { reflection: 0, forum_post: 0, forum_reply: 0, mind_map: 0 },
  byTrack: [],
};

export class StudentWritingsService {
  /** Trilhas que o viewer pode acompanhar. Fonte única de escopo. */
  async getScopeTracks(viewerId: string, isAdmin: boolean): Promise<FormationTrack[]> {
    return formatorService.getMyTracks(viewerId, isAdmin);
  }

  /**
   * Escritos de UM aluno, cortados pelas trilhas do viewer.
   * Inclui respostas de fórum (resolvidas via post pai).
   */
  async listForStudent(input: WritingsScopeInput & { studentId: string }): Promise<WritingsResult> {
    const { viewerId, isAdmin, studentId, filter } = input;
    const tracks = await this.getScopeTracks(viewerId, isAdmin);
    if (tracks.length === 0) return emptyResult();

    const trackById = new Map(tracks.map(t => [t.id, t] as const));
    const student = await userService.get(studentId).catch(() => null);
    const studentName = displayName(student, studentId);
    const warnings: string[] = [];

    const [reflections, posts, replies, versions] = await Promise.all([
      guard(() => reflectionRepository.findByUser(studentId), 'reflexões', warnings, [] as Reflection[]),
      guard(() => communityPostRepository.findByUser(studentId, 100), 'perguntas do fórum', warnings, [] as CommunityPost[]),
      guard(() => communityReplyRepository.findByUser(studentId, 100), 'respostas do fórum', warnings, [] as CommunityReply[]),
      guard(() => contentVersionService.listByUser(studentId), 'histórico de edições', warnings, [] as ContentVersion[]),
    ]);

    const versionCounts = countVersionsByTarget(versions);

    const writings: StudentWriting[] = [];

    for (const r of reflections) {
      if (!trackById.has(r.track_id)) continue;
      writings.push(reflectionToWriting(r, studentName, versionCounts));
    }

    for (const p of posts) {
      const trackId = scopeTrackId(p.visibility);
      if (!trackId || !trackById.has(trackId)) continue;
      writings.push(postToWriting(p, studentName, trackById.get(trackId)!, versionCounts));
    }

    // Replies não carregam escopo — resolve pelo post pai e descarta o que estiver fora.
    const parentPosts = await guard(
      () => communityPostRepository.findByIds(replies.map(r => r.post_id)),
      'posts das respostas', warnings, [] as CommunityPost[],
    );
    const postById = new Map(parentPosts.map(p => [p.id, p] as const));

    for (const reply of replies) {
      const parent = postById.get(reply.post_id);
      const trackId = scopeTrackId(parent?.visibility);
      if (!trackId || !trackById.has(trackId)) continue;
      writings.push(replyToWriting(reply, parent!, studentName, trackById.get(trackId)!, versionCounts));
    }

    const filtered = applyFilter(sortByDateDesc(writings), filter);

    // Teto obrigatório: cada escrito monta um `ReactMarkdown` na UI. Um aluno com
    // 400 escritos travava a página montando 400 parsers de markdown.
    const limitado = filtered.slice(0, SCOPE_LIMIT);

    return {
      tracks,
      writings: limitado,
      // Contadores vêm do conjunto COMPLETO — o resumo não pode mentir por causa
      // do corte de exibição.
      counts: buildCounts(filtered, trackById),
      truncated: filtered.length > SCOPE_LIMIT,
      warnings,
    };
  }

  /**
   * Visão agregada — todos os alunos das trilhas do viewer.
   *
   * Não inclui respostas de fórum na v1: `community_replies` não tem `track_id` nem
   * `lesson_id`, então agregá-las exigiria ler todos os posts do escopo e depois as
   * respostas de cada um (N+1 sem teto). Elas aparecem na visão por aluno.
   */
  async listForScope(input: WritingsScopeInput): Promise<WritingsResult> {
    const { viewerId, isAdmin, filter } = input;
    const tracks = await this.getScopeTracks(viewerId, isAdmin);
    if (tracks.length === 0) return emptyResult();

    const scoped = filter?.trackIds?.length
      ? tracks.filter(t => filter.trackIds!.includes(t.id))
      : tracks;
    if (scoped.length === 0) return { ...emptyResult(), tracks };

    const trackById = new Map(tracks.map(t => [t.id, t] as const));
    const trackIds = scoped.map(t => t.id);
    const opts = { batchSize: batchSizeFor(isAdmin), limitCount: SCOPE_LIMIT };
    const warnings: string[] = [];

    const [reflections, posts] = await Promise.all([
      guard(() => reflectionRepository.findByTracks(trackIds, opts), 'reflexões', warnings, [] as Reflection[]),
      guard(() => communityPostRepository.findByTrackIds(trackIds, opts), 'posts do fórum', warnings, [] as CommunityPost[]),
    ]);

    const truncated = reflections.length >= SCOPE_LIMIT || posts.length >= SCOPE_LIMIT;

    const names = await this.resolveNames([
      ...reflections.map(r => r.user_id),
      ...posts.map(p => p.created_by),
    ]);

    const writings: StudentWriting[] = [
      ...reflections.map(r => reflectionToWriting(r, names.get(r.user_id) ?? r.user_id)),
      ...posts
        .map(p => {
          const trackId = scopeTrackId(p.visibility);
          const track = trackId ? trackById.get(trackId) : undefined;
          return track ? postToWriting(p, names.get(p.created_by) ?? p.created_by, track) : null;
        })
        .filter((w): w is StudentWriting => w !== null),
    ];

    const filtered = applyFilter(sortByDateDesc(writings), filter);
    return { tracks, writings: filtered, counts: buildCounts(filtered, trackById), truncated, warnings };
  }

  /** Reflexões aguardando revisão nas trilhas do viewer. */
  async listPendingReviews(input: {
    viewerId: string;
    isAdmin: boolean;
    trackIds?: string[];
  }): Promise<StudentWriting[]> {
    const { viewerId, isAdmin } = input;
    const tracks = await this.getScopeTracks(viewerId, isAdmin);
    if (tracks.length === 0) return [];

    const ids = input.trackIds?.length
      ? tracks.filter(t => input.trackIds!.includes(t.id)).map(t => t.id)
      : tracks.map(t => t.id);
    if (ids.length === 0) return [];

    const pending = await reflectionRepository
      .findByTracksAndStatus(ids, 'submitted', { batchSize: batchSizeFor(isAdmin), limitCount: SCOPE_LIMIT })
      .catch(() => [] as Reflection[]); // badge/contador: falhar silencioso é aceitável

    const names = await this.resolveNames(pending.map(r => r.user_id));
    return sortByDateDesc(pending.map(r => reflectionToWriting(r, names.get(r.user_id) ?? r.user_id)));
  }

  /** Contagem pro badge de "aguardando revisão". */
  async countPendingReviews(viewerId: string, isAdmin: boolean): Promise<number> {
    const list = await this.listPendingReviews({ viewerId, isAdmin }).catch(() => []);
    return list.length;
  }

  /** Histórico de edições de UM escrito. Carregado sob demanda. */
  async loadVersions(kind: WritingKind, docId: string): Promise<WritingVersion[]> {
    const collectionName = targetCollectionFor(kind);
    if (!collectionName) return [];
    const versions = await contentVersionService.listByTarget(collectionName, docId);
    return versions.map(v => ({
      id: v.id,
      created_at: v.created_at,
      label: v.label ?? 'Edição',
      // Usa a coleção que já conhecemos, não `v.target_collection` — o campo do doc
      // é redundante aqui e confiar nele quebra se vier ausente.
      text: versionText(collectionName, v.payload),
      title: readString(v.payload, 'title'),
    }));
  }

  /** Resolve nomes de alunos com cache local — evita N+1 em listas grandes. */
  private async resolveNames(userIds: string[]): Promise<Map<string, string>> {
    const unique = Array.from(new Set(userIds.filter(Boolean)));
    const out = new Map<string, string>();
    await Promise.all(unique.map(async uid => {
      const user = await userService.get(uid).catch(() => null);
      out.set(uid, displayName(user, uid));
    }));
    return out;
  }
}

export const studentWritingsService = new StudentWritingsService();

// ─── Helpers ───────────────────────────────────────────────────────────────

function emptyResult(): WritingsResult {
  return { tracks: [], writings: [], counts: EMPTY_COUNTS, truncated: false, warnings: [] };
}

/**
 * Roda uma fonte e registra a falha em vez de propagá-la.
 *
 * Falha parcial não pode derrubar a tela inteira (um índice faltando em posts
 * esconderia as reflexões), mas também não pode virar lista vazia silenciosa —
 * `permission-denied` pareceria "o aluno não escreveu nada".
 */
async function guard<T>(
  run: () => Promise<T>,
  sourceLabel: string,
  warnings: string[],
  fallback: T,
): Promise<T> {
  try {
    return await run();
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    warnings.push(`Não foi possível carregar ${sourceLabel}: ${reason}`);
    return fallback;
  }
}

/**
 * Admin usa batches grandes porque `isAdmin()` curto-circuita a rule antes do
 * `isTrackFormator`. Formador precisa de 1 trilha por query, senão os `get()` da
 * rule estouram o limite de 20 access-calls e a query falha inteira.
 */
function batchSizeFor(isAdmin: boolean): number {
  return isAdmin ? 30 : 1;
}

function targetCollectionFor(kind: WritingKind): string | null {
  if (kind === 'reflection') return 'spiritual_reflections';
  if (kind === 'forum_post') return 'community_posts';
  if (kind === 'forum_reply') return 'community_replies';
  if (kind === 'mind_map') return 'student_mind_maps';
  return null;
}

function scopeTrackId(visibility?: CommunityVisibility): string | null {
  if (!visibility || visibility.scope === 'global') return null;
  return visibility.track_id ?? null;
}

function scopeLessonId(visibility?: CommunityVisibility): string | null {
  if (!visibility || visibility.scope !== 'lesson') return null;
  return visibility.lesson_id ?? null;
}

function displayName(user: FirebaseUser | null, fallback: string): string {
  return user?.name || user?.email || fallback;
}

function countVersionsByTarget(versions: ContentVersion[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const v of versions) {
    const key = `${v.target_collection}:${v.target_id}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

function versionCountOf(
  counts: Map<string, number> | undefined,
  collectionName: string,
  docId: string,
): number {
  return counts?.get(`${collectionName}:${docId}`) ?? 0;
}

function lessonHref(trackId: string | null, lessonId: string | null): string | undefined {
  if (!trackId || !lessonId) return undefined;
  return `/app/dashboard/formation/${trackId}/${lessonId}`;
}

function reflectionToWriting(
  r: Reflection,
  studentName: string,
  versionCounts?: Map<string, number>,
): StudentWriting {
  return {
    key: `reflection:${r.id}`,
    doc_id: r.id,
    kind: 'reflection',
    student_id: r.user_id,
    student_name: studentName,
    track_id: r.track_id,
    track_title: r.track_title,
    lesson_id: r.lesson_id,
    lesson_title: r.lesson_title,
    module_title: r.module_title,
    content: r.content,
    status: r.status,
    review_notes: r.review_notes,
    reviewed_by: r.reviewed_by,
    created_at: r.created_at,
    updated_at: r.updated_at,
    version_count: versionCountOf(versionCounts, 'spiritual_reflections', r.id),
    href: lessonHref(r.track_id, r.lesson_id),
  };
}

function postToWriting(
  p: CommunityPost,
  studentName: string,
  track: FormationTrack,
  versionCounts?: Map<string, number>,
): StudentWriting {
  const lessonId = scopeLessonId(p.visibility);
  return {
    key: `forum_post:${p.id}`,
    doc_id: p.id,
    kind: 'forum_post',
    student_id: p.created_by,
    student_name: p.created_by_name || studentName,
    track_id: track.id,
    track_title: track.title,
    lesson_id: lessonId,
    lesson_title: lessonId ? 'Aula do curso' : 'Trilha',
    title: p.title,
    content: p.body,
    created_at: p.created_at,
    updated_at: p.updated_at,
    version_count: versionCountOf(versionCounts, 'community_posts', p.id),
    href: lessonHref(track.id, lessonId),
  };
}

function replyToWriting(
  reply: CommunityReply,
  parent: CommunityPost,
  studentName: string,
  track: FormationTrack,
  versionCounts?: Map<string, number>,
): StudentWriting {
  const lessonId = scopeLessonId(parent.visibility);
  return {
    key: `forum_reply:${reply.id}`,
    doc_id: reply.id,
    kind: 'forum_reply',
    student_id: reply.created_by,
    student_name: reply.created_by_name || studentName,
    track_id: track.id,
    track_title: track.title,
    lesson_id: lessonId,
    lesson_title: lessonId ? 'Aula do curso' : 'Trilha',
    title: parent.title ? `Em: ${parent.title}` : undefined,
    content: reply.body,
    created_at: reply.created_at,
    updated_at: reply.updated_at,
    version_count: versionCountOf(versionCounts, 'community_replies', reply.id),
    href: lessonHref(track.id, lessonId),
  };
}

function readString(payload: unknown, key: string): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
}

/**
 * Texto legível de uma versão. Nunca serializa o payload: a UI é usada por leigos e
 * o projeto proíbe expor JSON cru.
 */
function versionText(targetCollection: string, payload: unknown): string {
  const byCollection: Record<string, string> = {
    spiritual_reflections: 'content',
    community_posts: 'body',
    community_replies: 'body',
  };
  const field = byCollection[targetCollection];
  if (field) return readString(payload, field) ?? '';

  if (targetCollection === 'student_mind_maps') {
    const nodes = (payload as { nodes?: Array<{ label?: string; data?: { label?: string } }> })?.nodes;
    if (Array.isArray(nodes)) {
      const labels = nodes.map(n => n.label ?? n.data?.label).filter(Boolean);
      if (labels.length > 0) return labels.join(' · ');
    }
    return '(mapa mental)';
  }

  return '(conteúdo não textual)';
}

function sortByDateDesc(list: StudentWriting[]): StudentWriting[] {
  return [...list].sort((a, b) =>
    (b.updated_at ?? b.created_at).localeCompare(a.updated_at ?? a.created_at));
}

function applyFilter(list: StudentWriting[], filter?: WritingsFilter): StudentWriting[] {
  if (!filter) return list;
  let out = list;

  if (filter.trackIds?.length) {
    out = out.filter(w => w.track_id && filter.trackIds!.includes(w.track_id));
  }
  if (filter.kinds?.length) {
    out = out.filter(w => filter.kinds!.includes(w.kind));
  }
  if (filter.statuses?.length) {
    out = out.filter(w => w.status !== undefined && filter.statuses!.includes(w.status));
  }
  if (filter.from) {
    out = out.filter(w => w.created_at.slice(0, 10) >= filter.from!);
  }
  if (filter.to) {
    out = out.filter(w => w.created_at.slice(0, 10) <= filter.to!);
  }
  if (filter.search?.trim()) {
    const q = filter.search.trim().toLowerCase();
    out = out.filter(w =>
      w.content.toLowerCase().includes(q)
      || (w.title ?? '').toLowerCase().includes(q)
      || w.student_name.toLowerCase().includes(q)
      || w.lesson_title.toLowerCase().includes(q));
  }
  return out;
}

function buildCounts(
  list: StudentWriting[],
  trackById: Map<string, FormationTrack>,
): WritingsCounts {
  const byKind: Record<WritingKind, number> = {
    reflection: 0, forum_post: 0, forum_reply: 0, mind_map: 0,
  };
  const perTrack = new Map<string, { total: number; pending: number }>();

  let pendingReview = 0, reviewed = 0, drafts = 0;

  for (const w of list) {
    byKind[w.kind] += 1;
    if (w.status === 'submitted') pendingReview++;
    else if (w.status === 'reviewed') reviewed++;
    else if (w.status === 'draft') drafts++;

    if (w.track_id) {
      const entry = perTrack.get(w.track_id) ?? { total: 0, pending: 0 };
      entry.total += 1;
      if (w.status === 'submitted') entry.pending += 1;
      perTrack.set(w.track_id, entry);
    }
  }

  const byTrack = Array.from(perTrack.entries())
    .map(([track_id, agg]) => ({
      track_id,
      track_title: trackById.get(track_id)?.title ?? 'Trilha',
      total: agg.total,
      pending: agg.pending,
    }))
    .sort((a, b) => b.total - a.total);

  return { total: list.length, pendingReview, reviewed, drafts, byKind, byTrack };
}
