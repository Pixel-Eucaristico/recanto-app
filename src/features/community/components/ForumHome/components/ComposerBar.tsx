'use client';

import { MessageSquare, BarChart3 } from 'lucide-react';
import type { CommunityVisibility } from '@/domain/community/types';
import { PostComposer } from '@/features/community/components/PostComposer';
import { PollComposer } from '@/features/community/components/PollComposer';
import type { ComposerMode } from '../types';

interface ComposerBarProps {
  composer: ComposerMode;
  setComposer: (m: ComposerMode) => void;
  scope: CommunityVisibility;
  userId: string;
  userName: string;
  lockedCategoryId?: string;
  allowForum: boolean;
  allowPoll: boolean;
  onCreated: () => void;
}

export function ComposerBar({
  composer, setComposer, scope, userId, userName,
  lockedCategoryId, allowForum, allowPoll, onCreated,
}: ComposerBarProps) {
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
