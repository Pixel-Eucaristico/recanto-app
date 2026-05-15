'use client';

import { useState } from 'react';
import { CornerDownRight, Reply } from 'lucide-react';
import type { CommunityReply } from '@/domain/community/types';
import { RichContent } from '@/shared/components/RichContent';
import { ReplyComposer } from '@/features/community/components/ReplyComposer';

export interface ReplyNode extends CommunityReply {
  children: ReplyNode[];
}

interface WallCommentItemProps {
  node: ReplyNode;
  postId: string;
  userId: string;
  userName: string;
  locked: boolean;
  canComment: boolean;
  depth: number;
  onReplied: () => void;
}

export function WallCommentItem({ node, postId, userId, userName, locked, canComment, depth, onReplied }: WallCommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const indent = Math.min(depth, 4);

  return (
    <li style={{ marginLeft: indent * 16 }}>
      <div className="bg-base-200 rounded-lg p-3 space-y-2">
        <p className="text-xs text-base-content/60 flex items-center gap-1">
          {depth > 0 && <CornerDownRight className="w-3.5 h-3.5" />}
          {node.created_by_name} · {new Date(node.created_at).toLocaleString('pt-BR')}
        </p>
        <RichContent markdown={node.body} className="text-sm" />
        {canComment && !locked && (
          <div className="flex justify-end">
            <button type="button" className="btn btn-ghost btn-xs gap-1" onClick={() => setReplyOpen(v => !v)}>
              <Reply className="w-3.5 h-3.5" />
              {replyOpen ? 'Cancelar' : 'Responder'}
            </button>
          </div>
        )}
        {replyOpen && canComment && !locked && (
          <ReplyComposer
            postId={postId}
            parentReplyId={node.id}
            userId={userId}
            userName={userName}
            onReplied={() => { setReplyOpen(false); onReplied(); }}
            onCancel={() => setReplyOpen(false)}
          />
        )}
      </div>

      {node.children.length > 0 && (
        <ul className="space-y-2 mt-2">
          {node.children.map(child => (
            <WallCommentItem
              key={child.id}
              node={child}
              postId={postId}
              userId={userId}
              userName={userName}
              locked={locked}
              canComment={canComment}
              depth={depth + 1}
              onReplied={onReplied}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
