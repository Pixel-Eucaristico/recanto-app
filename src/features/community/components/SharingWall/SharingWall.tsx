'use client';

import { CommunityVisibility } from '@/domain/community/types';
import { useCommunityFeed } from '@/features/community/hooks/useCommunityFeed';
import { PostComposer } from '@/features/community/components/PostComposer';
import { WallPostCard } from '@/features/community/components/WallPostCard';

interface SharingWallProps {
  scope: CommunityVisibility;
  userId: string;
  userName: string;
  canPost?: boolean;
  canComment?: boolean;
}

export function SharingWall({ scope, userId, userName, canPost = true, canComment = true }: SharingWallProps) {
  const { posts, loading, error, reload } = useCommunityFeed({ scope, kind: 'wall' });

  return (
    <div className="space-y-4">
      {canPost && (
        <PostComposer
          kind="wall"
          visibility={scope}
          userId={userId}
          userName={userName}
          onCreated={() => reload()}
        />
      )}

      {loading && <div className="alert alert-info text-sm"><span>Carregando depoimentos...</span></div>}
      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

      {!loading && posts.length === 0 && (
        <div className="text-center py-8 text-base-content/60 text-sm">
          Nenhum depoimento ainda. Compartilhe uma experiência de fé.
        </div>
      )}

      <div className="space-y-3">
        {posts.map(p => (
          <WallPostCard
            key={p.id}
            post={p}
            userId={userId}
            userName={userName}
            canComment={canComment}
          />
        ))}
      </div>
    </div>
  );
}
