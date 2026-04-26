'use client';

import { ChevronLeft, FolderOpen, BarChart3, Settings, BookOpen } from 'lucide-react';
import type { CommunityVisibility } from '@/domain/community/types';
import { CategoryManager } from '@/features/community/components/CategoryManager';
import { WallPostCard } from '@/features/community/components/WallPostCard';
import { CategoryCard } from './components/CategoryCard';
import { ComposerBar } from './components/ComposerBar';
import { PostsFeed } from './components/PostsFeed';
import { filterByCategory } from './utils/filterByCategory';
import { useForumHome } from './hooks/useForumHome';

interface ForumHomeProps {
  scope: CommunityVisibility;
  userId: string;
  userName: string;
  canManage?: boolean;
  canPost?: boolean;
  canComment?: boolean;
  canVote?: boolean;
}

export function ForumHome({
  scope, userId, userName,
  canManage = false, canPost = true, canComment = true, canVote = true,
}: ForumHomeProps) {
  const {
    view, setView,
    activeCategory,
    selectedPost,
    composer, setComposer,
    categories, loadingCats,
    posts, loading,
    virtualCourseCategories,
    virtualPollsCategory,
    pollsCount,
    adminCounts,
    totalCourseCount,
    navigateToCategory,
    navigateToPost,
    closeComposer,
  } = useForumHome({ scope });

  // ── Manage ──
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

  // ── Post detail ──
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

  // ── Category detail ──
  if (view === 'category' && activeCategory) {
    const filtered = filterByCategory(posts, activeCategory);
    const lockedCategory = activeCategory.type === 'admin' ? activeCategory.id : undefined;
    const allowForum = activeCategory.type === 'admin' || activeCategory.virtualKind === 'course';
    const allowPoll = activeCategory.type === 'admin' || activeCategory.virtualKind === 'polls' || activeCategory.virtualKind === 'course';

    return (
      <div className="space-y-4">
        <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => setView('home')}>
          <ChevronLeft className="w-4 h-4" /> Categorias
        </button>
        <h2 className="text-xl font-bold text-base-content">{activeCategory.name}</h2>
        {activeCategory.description && <p className="text-sm text-base-content/60">{activeCategory.description}</p>}
        {canPost && (allowForum || allowPoll) && (
          <ComposerBar
            composer={composer} setComposer={setComposer}
            scope={scope} userId={userId} userName={userName}
            lockedCategoryId={lockedCategory}
            allowForum={allowForum} allowPoll={allowPoll}
            onCreated={closeComposer}
          />
        )}
        <PostsFeed posts={filtered} userId={userId} canVote={canVote} onOpenPost={navigateToPost} />
      </div>
    );
  }

  // ── Courses list ──
  if (view === 'courses') {
    return (
      <div className="space-y-4">
        <button type="button" className="btn btn-ghost btn-sm gap-1" onClick={() => setView('home')}>
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <h2 className="text-xl font-bold text-base-content">Cursos</h2>
        <p className="text-sm text-base-content/60">Discussões e enquetes vinculadas a cada curso.</p>
        {virtualCourseCategories.length === 0 && (
          <div className="text-center py-6 text-base-content/60 text-sm">Nenhum curso tem posts ainda.</div>
        )}
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {virtualCourseCategories.map(c => (
            <li key={c.id}>
              <CategoryCard
                name={c.name} description={c.description}
                count={posts.filter(p => {
                  const v = p.visibility;
                  if (v.scope === 'global') return false;
                  return (v as { track_id?: string }).track_id === c.trackId;
                }).length}
                icon={<BookOpen className="w-4 h-4 text-primary" />}
                automatic
                onClick={() => navigateToCategory(c)}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // ── Home ──
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
          <li>
            <CategoryCard
              name={virtualPollsCategory.name}
              description={virtualPollsCategory.description}
              count={pollsCount}
              icon={<BarChart3 className="w-4 h-4 text-primary" />}
              automatic
              onClick={() => navigateToCategory(virtualPollsCategory)}
            />
          </li>
          {categories.map(c => (
            <li key={c.id}>
              <CategoryCard
                name={c.name}
                description={c.description}
                count={adminCounts.get(c.id) ?? 0}
                icon={<FolderOpen className="w-4 h-4 text-primary" />}
                onClick={() => navigateToCategory({ type: 'admin', id: c.id, name: c.name, description: c.description })}
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
            composer={composer} setComposer={setComposer}
            scope={scope} userId={userId} userName={userName}
            allowForum allowPoll
            onCreated={closeComposer}
          />
        </section>
      )}

      {loading && <div className="alert alert-info text-sm"><span>Carregando...</span></div>}
    </div>
  );
}
