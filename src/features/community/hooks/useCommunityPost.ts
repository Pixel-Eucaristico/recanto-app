'use client';

import { useCallback, useEffect, useState } from 'react';
import { communityService } from '@/application/community/CommunityService';
import { communityPostRepository } from '@/infrastructure/community/CommunityPostRepository';
import { CommunityPost, CommunityReply } from '@/domain/community/types';

export function useCommunityPost(postId: string | null) {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!postId) {
      setPost(null);
      setReplies([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [p, r] = await Promise.all([
        communityPostRepository.get(postId),
        communityService.listReplies(postId),
      ]);
      setPost(p);
      setReplies(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { post, replies, loading, error, reload };
}
