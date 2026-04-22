'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, FolderOpen, MessageSquare, BarChart3, Settings, BookOpen } from 'lucide-react';
import { CommunityCategory, CommunityPost, CommunityVisibility } from '@/domain/community/types';
import { useCommunityFeed } from '@/features/community/hooks/useCommunityFeed';
import { useCategories } from '@/features/community/hooks/useCategories';
import { PostComposer } from '@/features/community/components/PostComposer';
import { PollComposer } from '@/features/community/components/PollComposer';
import { WallPostCard } from '@/features/community/components/WallPostCard';
import { QuickPoll } from '@/features/community/components/QuickPoll';
import { CategoryManager } from '@/features/community/components/CategoryManager';

interface ForumHomeProps {
  scope: CommunityVisibility;
  userId: string;
  userName: string;
  canManage?: boolean;
  canPost?: boolean;
  canComment?: boolean;
  canVote?: boolean;
}

type ComposerMode = 'closed' | 'forum' | 'poll';
type View = 'home' | 'courses' | 'category' | 'post' | 'manage';

type VirtualKind = 'polls' | 'course';
interface CategoryView {
  type: 'admin' | 'virtual';
  id: string;
  name: string;
  description?: string;
  virtualKind?: VirtualKind;
  trackId?: string;
}

/** Filtra posts baseado no tipo de categoria (admin/virtual). */
function filterByCategory(posts: CommunityPost[], cat: CategoryView): CommunityPost[] {
  if (cat.type === 'admin') {
    return posts.filter(p => p.category_id === cat.id);
  }
  if (cat.virtualKind === 'polls') {
    return posts.filter(p => p.kind === 'poll');
  }
  if (cat.virtualKind === 'course' && cat.trackId) {
    return posts.filter(p => {
      const v = p.visibility;
      if (v.scope === 'global') return false;
      return (v as { track_id?: string }).track_id === cat.trackId;
    });
  }
  return [];
}

export function ForumHome({
  scope,
  userId,
  userName,
  canManage = false,
  canPost = true,
  canComment = true,
  canVote = true,
}: ForumHomeProps) {
  const [view, setView] = useState<View>('home');
  const [activeCategory, setActiveCategory] = useState<CategoryView | null>(null);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [composer, setComposer] = useState<ComposerMode>('closed');

  const { categories, loading: loadingCats } = useCategories();
  // Fórum global agrega TUDO (global + cursos). Dentro de curso/aula filtra por scope.
  const aggregateAll = scope.scope === 'global';
  const { posts, loading, reload } = useCommunityFeed({ scope, kind: ['forum', 'poll'], aggregateAll });

  /** Categorias "Curso X" derivadas dos track_ids presentes nos posts não-globais. */
  const virtualCourseCategories = useMemo<CategoryView[]>(() => {
    const tracks = new Map<string, number>();
    for (const p of posts) {
      const v = p.visibility;
      if (v.scope === 'global') continue;
      const tid = (v as { track_id?: string }).track_id;
      if (!tid) continue;
      tracks.set(tid, (tracks.get(tid) ?? 0) + 1);
    }
    return Array.from(tracks.entries()).map(([tid]) => ({
      type: 'virtual' as const,
      id: `__course_${tid}__`,
      name: `Curso: ${tid}`,
      description: 'Discussões do curso',
      virtualKind: 'course' as const,
      trackId: tid,
    }));
  }, [posts]);

  /** Categoria virtual de enquetes — sempre presente. */
  const virtualPollsCategory: CategoryView = useMemo(() => ({
    type: 'virtual',
    id: '__polls__',
    name: 'Enquetes',
    description: 'Todas as enquetes abertas',
    virtualKind: 'polls',
  }), []);

  const pollsCount = useMemo(() => posts.filter(p => p.kind === 'poll').length, [posts]);

  const adminCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of posts) {
      if (!p.category_id) continue;
      map.set(p.category_id, (map.get(p.category_id) ?? 0) + 1);
    }
    return map;
  }, [posts]);

  // -----------------------
  // Sub-views
  // -----------------------
  if (view === 'manage') {
    return (
      <div className="space-y-4">
        <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => setView('home')}>
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <CategoryManager userId={userId} />
      </div>
    );
  }

  if (view === 'post' && selectedPost) {
    return (
      <div className="space-y-4">
        <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => setView(activeCategory ? 'category' : 'home')}>
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <WallPostCard post={selectedPost} userId={userId} userName={userName} canComment={canComment} />
      </div>
    );
  }

  if (view === 'category' && activeCategory) {
    const filtered = filterByCategory(posts, activeCategory);
    // Composer dentro de categoria admin fixa esse category_id.
    // Virtual: não fixa — enquete sempre vira virtual 'polls', curso depende do scope passado à página.
    const lockedCategory = activeCategory.type === 'admin' ? activeCategory.id : undefined;
    const allowForum = activeCategory.type === 'admin' || activeCategory.virtualKind === 'course';
    const allowPoll = activeCategory.type === 'admin' || activeCategory.virtualKind === 'polls' || activeCategory.virtualKind === 'course';

    return (
      <div className="space-y-4">
        <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => setView('home')}>
          <ChevronLeft className="w-4 h-4" /> Categorias
        </button>
        <h2 className="text-xl font-bold text-base-content">{activeCategory.name}</h2>
        {activeCategory.description && (
          <p className="text-sm text-base-content/60">{activeCategory.description}</p>
        )}

        {canPost && (allowForum || allowPoll) && (
          <ComposerBar
            composer={composer}
            setComposer={setComposer}
            scope={scope}
            userId={userId}
            userName={userName}
            lockedCategoryId={lockedCategory}
            allowForum={allowForum}
            allowPoll={allowPoll}
            onCreated={() => { setComposer('closed'); reload(); }}
          />
        )}

        <PostsFeed
          posts={filtered}
          userId={userId}
          userName={userName}
          canComment={canComment}
          canVote={canVote}
          onOpenPost={p => { setSelectedPost(p); setView('post'); }}
        />
      </div>
    );
  }

  // -----------------------
  // Courses list (drill into Cursos meta-category)
  // -----------------------
  if (view === 'courses') {
    return (
      <div className="space-y-4">
        <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => setView('home')}>
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <h2 className="text-xl font-bold text-base-content">Cursos</h2>
        <p className="text-sm text-base-content/60">Discussões e enquetes vinculadas a cada curso.</p>

        {virtualCourseCategories.length === 0 && (
          <div className="text-center py-6 text-base-content/60 text-sm">
            Nenhum curso tem posts ainda.
          </div>
        )}

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {virtualCourseCategories.map(c => (
            <li key={c.id}>
              <CategoryCard
                name={c.name}
                description={c.description}
                count={posts.filter(p => {
                  const v = p.visibility;
                  if (v.scope === 'global') return false;
                  return (v as { track_id?: string }).track_id === c.trackId;
                }).length}
                icon={<BookOpen className="w-4 h-4 text-primary" />}
                automatic
                onClick={() => {
                  setActiveCategory(c);
                  setView('category');
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // -----------------------
  // Home
  // -----------------------
  const totalCourseCount = posts.filter(p => p.visibility.scope !== 'global').length;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-base-content">Categorias</h2>
          {canManage && (
            <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => setView('manage')}>
              <Settings className="w-4 h-4" /> Gerenciar categorias
            </button>
          )}
        </div>

        {loadingCats && <div className="alert alert-info text-sm"><span>Carregando categorias...</span></div>}

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Cursos (meta-categoria) — click entra numa lista de cursos */}
          <li>
            <CategoryCard
              name="Cursos"
              description={`Discussões dos cursos (${virtualCourseCategories.length} ${virtualCourseCategories.length === 1 ? 'curso' : 'cursos'})`}
              count={totalCourseCount}
              icon={<BookOpen className="w-4 h-4 text-primary" />}
              automatic
              onClick={() => setView('courses')}
            />
          </li>

          {/* Enquetes virtual */}
          <li>
            <CategoryCard
              name={virtualPollsCategory.name}
              description={virtualPollsCategory.description}
              count={pollsCount}
              icon={<BarChart3 className="w-4 h-4 text-primary" />}
              automatic
              onClick={() => {
                setActiveCategory(virtualPollsCategory);
                setView('category');
              }}
            />
          </li>

          {/* Categorias admin (fórum livre) */}
          {categories.map(c => (
            <li key={c.id}>
              <CategoryCard
                name={c.name}
                description={c.description}
                count={adminCounts.get(c.id) ?? 0}
                icon={<FolderOpen className="w-4 h-4 text-primary" />}
                onClick={() => {
                  setActiveCategory({ type: 'admin', id: c.id, name: c.name, description: c.description });
                  setView('category');
                }}
              />
            </li>
          ))}
        </ul>

        {!loadingCats && categories.length === 0 && (
          <p className="text-center text-xs text-base-content/50">
            {canManage ? 'Sem categorias livres do fórum. Clique em "Gerenciar categorias" pra criar.' : 'Só categorias automáticas ativas.'}
          </p>
        )}
      </section>

      {canPost && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-base-content">Criar</h2>
          <ComposerBar
            composer={composer}
            setComposer={setComposer}
            scope={scope}
            userId={userId}
            userName={userName}
            allowForum
            allowPoll
            onCreated={() => { setComposer('closed'); reload(); }}
          />
        </section>
      )}

      {loading && <div className="alert alert-info text-sm"><span>Carregando...</span></div>}
    </div>
  );
}

// ---------- sub-components ----------

function CategoryCard({
  name,
  description,
  count,
  icon,
  automatic,
  onClick,
}: {
  name: string;
  description?: string;
  count: number;
  icon: React.ReactNode;
  automatic?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="w-full text-left card bg-base-100 border border-base-300 hover:border-primary transition-colors"
      onClick={onClick}
    >
      <div className="card-body p-4 gap-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-base-content flex-1">{name}</span>
          {automatic && <span className="badge badge-ghost badge-xs">auto</span>}
          <span className="badge badge-ghost">{count}</span>
        </div>
        {description && <p className="text-xs text-base-content/60">{description}</p>}
      </div>
    </button>
  );
}

function ComposerBar({
  composer,
  setComposer,
  scope,
  userId,
  userName,
  lockedCategoryId,
  allowForum,
  allowPoll,
  onCreated,
}: {
  composer: ComposerMode;
  setComposer: (m: ComposerMode) => void;
  scope: CommunityVisibility;
  userId: string;
  userName: string;
  lockedCategoryId?: string;
  allowForum: boolean;
  allowPoll: boolean;
  onCreated: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {allowForum && (
          <button
            type="button"
            className={`btn btn-sm gap-1 ${composer === 'forum' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setComposer(composer === 'forum' ? 'closed' : 'forum')}
          >
            <MessageSquare className="w-4 h-4" /> Novo tópico
          </button>
        )}
        {allowPoll && (
          <button
            type="button"
            className={`btn btn-sm gap-1 ${composer === 'poll' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setComposer(composer === 'poll' ? 'closed' : 'poll')}
          >
            <BarChart3 className="w-4 h-4" /> Nova enquete
          </button>
        )}
      </div>
      {composer === 'forum' && (
        <PostComposer
          kind="forum"
          visibility={scope}
          userId={userId}
          userName={userName}
          lockedCategoryId={lockedCategoryId}
          onCreated={onCreated}
        />
      )}
      {composer === 'poll' && (
        <PollComposer
          visibility={scope}
          userId={userId}
          userName={userName}
          lockedCategoryId={lockedCategoryId}
          onCreated={onCreated}
        />
      )}
    </div>
  );
}

function PostsFeed({
  posts,
  userId,
  userName: _userName,
  canComment: _canComment,
  canVote,
  onOpenPost,
}: {
  posts: CommunityPost[];
  userId: string;
  userName: string;
  canComment: boolean;
  canVote: boolean;
  onOpenPost: (p: CommunityPost) => void;
}) {
  if (posts.length === 0) {
    return <div className="text-center py-6 text-base-content/60 text-sm">Nenhum post nessa categoria.</div>;
  }
  return (
    <ul className="space-y-2">
      {posts.map(p => {
        if (p.kind === 'poll') {
          return (
            <li key={p.id}>
              <QuickPoll post={p} userId={userId} canVote={canVote} />
            </li>
          );
        }
        return (
          <li key={p.id}>
            <button
              type="button"
              className="w-full text-left card bg-base-100 border border-base-300 hover:border-primary transition-colors"
              onClick={() => onOpenPost(p)}
            >
              <div className="card-body p-4 gap-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary/70" />
                  <h4 className="text-sm font-semibold text-base-content flex-1">{p.title}</h4>
                </div>
                <p className="text-xs text-base-content/60">
                  {p.created_by_name} · {new Date(p.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
