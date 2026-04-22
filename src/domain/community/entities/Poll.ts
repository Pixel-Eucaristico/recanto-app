import { CommunityPost, PollOption, PollTally, PollVote } from '@/domain/community/types';

export class PollEntity {
  static validate(post: CommunityPost): string[] {
    const errors: string[] = [];
    if (post.kind !== 'poll') {
      errors.push('Post não é uma enquete.');
      return errors;
    }
    const opts = post.poll_options ?? [];
    if (opts.length < 2) errors.push('Enquete precisa de ao menos 2 opções.');
    const labels = opts.map(o => o.label.trim().toLowerCase());
    if (new Set(labels).size !== labels.length) errors.push('Opções com rótulo duplicado.');
    opts.forEach((o, i) => {
      if (!o.label || o.label.trim().length === 0) errors.push(`Opção ${i + 1}: rótulo vazio.`);
      if (!o.id || o.id.trim().length === 0) errors.push(`Opção ${i + 1}: id vazio.`);
    });
    return errors;
  }

  static isClosed(post: CommunityPost, now: Date = new Date()): boolean {
    if (!post.poll_closes_at) return false;
    return new Date(post.poll_closes_at).getTime() <= now.getTime();
  }

  /** Id determinístico do voto — 1 por (poll, user). Permite mudar voto via setDoc merge. */
  static voteId(pollId: string, userId: string): string {
    return `${pollId}_${userId}`;
  }

  static tally(options: PollOption[], votes: PollVote[]): PollTally[] {
    const counts = new Map<string, number>();
    for (const v of votes) counts.set(v.option_id, (counts.get(v.option_id) ?? 0) + 1);
    const total = votes.length;
    return options.map(o => {
      const count = counts.get(o.id) ?? 0;
      const percent = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
      return { option_id: o.id, label: o.label, count, percent };
    });
  }
}
