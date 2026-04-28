'use client';

import { BarChart3, Check, Lock } from 'lucide-react';
import { CommunityPost } from '@/domain/community/types';
import { RichContent } from '@/shared/components/RichContent';
import { usePoll } from '@/features/community/hooks/usePoll';

interface QuickPollProps {
  /** Post (já carregado) — evita refetch desnecessário; usePoll ainda re-carrega pra manter sync. */
  post: CommunityPost;
  userId: string;
  /** Oculta controles de voto (ex: usuário sem post:community). */
  canVote?: boolean;
}

export function QuickPoll({ post, userId, canVote = true }: QuickPollProps) {
  const { post: fresh, tally, userVote, totalVotes, isClosed, error, voting, vote } = usePoll(post.id, userId);
  const view = fresh ?? post;

  return (
    <article className="card bg-base-100 border border-base-300">
      <div className="card-body gap-3 p-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="text-base font-semibold text-base-content flex-1">{view.title}</h3>
          {isClosed && (
            <span className="badge badge-warning gap-1">
              <Lock className="w-3 h-3" /> Encerrada
            </span>
          )}
        </div>

        <p className="text-xs text-base-content/60">
          {view.created_by_name} · {new Date(view.created_at).toLocaleString('pt-BR')}
        </p>

        {view.body && view.body.trim().length > 1 && <RichContent markdown={view.body} />}

        <ul className="space-y-2">
          {tally.map(t => {
            const isChoice = userVote === t.option_id;
            const clickable = canVote && !isClosed;
            return (
              <li key={t.option_id}>
                <button
                  type="button"
                  onClick={() => clickable && vote(t.option_id)}
                  disabled={!clickable || voting}
                  className={`w-full text-left rounded-lg border transition-colors ${
                    isChoice ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-primary/50'
                  } ${!clickable ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="relative overflow-hidden rounded-lg">
                    <div
                      className={`absolute inset-y-0 left-0 ${isChoice ? 'bg-primary/25' : 'bg-base-200'}`}
                      style={{ width: `${t.percent}%` }}
                    />
                    <div className="relative flex items-center justify-between gap-2 p-3">
                      <span className="text-sm text-base-content flex items-center gap-1">
                        {isChoice && <Check className="w-3.5 h-3.5 text-primary" />}
                        {t.label}
                      </span>
                      <span className="text-xs text-base-content/70 whitespace-nowrap">
                        {t.count} {t.count === 1 ? 'voto' : 'votos'} · {t.percent}%
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between text-xs text-base-content/60">
          <span>{totalVotes} {totalVotes === 1 ? 'voto total' : 'votos totais'}</span>
          {userVote && !isClosed && canVote && (
            <span className="text-success">Seu voto está registrado. Clique em outra opção pra trocar.</span>
          )}
          {view.poll_closes_at && !isClosed && (
            <span>Encerra em {new Date(view.poll_closes_at).toLocaleString('pt-BR')}</span>
          )}
        </div>

        {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}
      </div>
    </article>
  );
}
