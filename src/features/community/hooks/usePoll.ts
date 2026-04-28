'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { communityPostRepository } from '@/infrastructure/community/CommunityPostRepository';
import { pollVoteRepository } from '@/infrastructure/community/PollVoteRepository';
import { communityService } from '@/application/community/CommunityService';
import { CommunityPost, PollTally, PollVote } from '@/domain/community/types';
import { PollEntity } from '@/domain/community/entities/Poll';

export function usePoll(pollId: string | null, userId: string | null) {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [votes, setVotes] = useState<PollVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (!pollId) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    communityPostRepository
      .get(pollId)
      .then(p => {
        if (!active) return;
        setPost(p);
      })
      .catch(err => {
        if (!active) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [pollId]);

  // Listener real-time dos votos
  useEffect(() => {
    if (!pollId) return;
    const unsub = pollVoteRepository.subscribeToPoll(pollId, setVotes);
    return () => unsub();
  }, [pollId]);

  const tally: PollTally[] = useMemo(() => {
    if (!post?.poll_options) return [];
    return PollEntity.tally(post.poll_options, votes);
  }, [post, votes]);

  const userVote: string | null = useMemo(() => {
    if (!userId) return null;
    return votes.find(v => v.user_id === userId)?.option_id ?? null;
  }, [votes, userId]);

  const isClosed = useMemo(() => (post ? PollEntity.isClosed(post) : false), [post]);
  const totalVotes = votes.length;

  const vote = useCallback(
    async (optionId: string) => {
      if (!pollId || !userId) return;
      setError(null);
      setVoting(true);
      try {
        await communityService.castVote(pollId, userId, optionId);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setVoting(false);
      }
    },
    [pollId, userId],
  );

  return { post, tally, userVote, totalVotes, isClosed, loading, error, voting, vote };
}
