'use client';

import { CommunityVisibility } from '@/domain/community/types';
import { useCommunityFeed } from '@/features/community/hooks/useCommunityFeed';
import { PollComposer } from '@/features/community/components/PollComposer';
import { QuickPoll } from '@/features/community/components/QuickPoll';

interface PollListProps {
  scope: CommunityVisibility;
  userId: string;
  userName: string;
  canPost?: boolean;
  canVote?: boolean;
}

export function PollList({ scope, userId, userName, canPost = true, canVote = true }: PollListProps) {
  const { posts, loading, error, reload } = useCommunityFeed({ scope, kind: 'poll' });

  return (
    <div className="space-y-4">
      {canPost && (
        <PollComposer
          visibility={scope}
          userId={userId}
          userName={userName}
          onCreated={() => reload()}
        />
      )}

      {loading && <div className="alert alert-info text-sm"><span>Carregando enquetes...</span></div>}
      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

      {!loading && posts.length === 0 && (
        <div className="text-center py-8 text-base-content/60 text-sm">
          Nenhuma enquete ainda.
        </div>
      )}

      <div className="space-y-3">
        {posts.map(p => (
          <QuickPoll key={p.id} post={p} userId={userId} canVote={canVote} />
        ))}
      </div>
    </div>
  );
}
