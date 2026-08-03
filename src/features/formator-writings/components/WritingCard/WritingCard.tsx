'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import {
  CornerDownRight, ExternalLink, History, MessageCircle,
  Network, PenLine, Send,
} from 'lucide-react';
import type { StudentWriting, WritingKind } from '@/domain/formation/writings';
import { WRITING_KIND_LABELS } from '@/domain/formation/writings';

interface WritingCardProps {
  writing: StudentWriting;
  /** Esconde o nome do aluno quando a lista já é de um aluno só. */
  hideStudent?: boolean;
  onOpenHistory: (writing: StudentWriting) => void;
  onReview: (writing: StudentWriting) => void;
}

/** Acima disso o texto abre colapsado, pra lista longa continuar navegável. */
const COLLAPSE_THRESHOLD = 400;

export function WritingCard({ writing, hideStudent, onOpenHistory, onReview }: WritingCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isLong = writing.content.length > COLLAPSE_THRESHOLD;
  const shown = isLong && !expanded
    ? `${writing.content.slice(0, COLLAPSE_THRESHOLD).trimEnd()}…`
    : writing.content;

  const canReview = writing.kind === 'reflection' && writing.status === 'submitted';

  return (
    <article className="card bg-base-100 border border-base-300">
      <div className="card-body p-3 sm:p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <KindIcon kind={writing.kind} />
            <div className="min-w-0">
              {!hideStudent && (
                <p className="text-sm font-semibold truncate">{writing.student_name}</p>
              )}
              <p className="text-xs text-base-content/50 truncate">
                {writing.track_title}
                {writing.module_title ? ` · ${writing.module_title}` : ''}
                {writing.lesson_title ? ` · ${writing.lesson_title}` : ''}
              </p>
            </div>
          </div>
          <StatusBadge writing={writing} />
        </div>

        {writing.title && (
          <p className="text-sm font-medium text-base-content">{writing.title}</p>
        )}

        {/* `break-words` + rolagem própria: markdown livre do aluno pode ter tabela,
            bloco de código ou URL longa, que estouravam a página no mobile. */}
        <div className="prose prose-sm max-w-none text-base-content/80 break-words overflow-x-auto">
          <ReactMarkdown>{shown || '_(sem texto)_'}</ReactMarkdown>
        </div>

        {isLong && (
          <button
            type="button"
            className="btn btn-ghost btn-xs self-start"
            onClick={() => setExpanded(v => !v)}
          >
            {expanded ? 'Mostrar menos' : 'Ler tudo'}
          </button>
        )}

        {writing.review_notes && (
          <div className="bg-base-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-base-content/60 mb-1">Comentário do formador</div>
            <p className="text-sm text-base-content/80">{writing.review_notes}</p>
          </div>
        )}

        <div className="flex items-center gap-1 flex-wrap pt-1">
          <span className="text-[10px] text-base-content/40 mr-auto">
            {WRITING_KIND_LABELS[writing.kind]} · {formatDate(writing.updated_at ?? writing.created_at)}
          </span>

          {writing.version_count > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-xs gap-1"
              onClick={() => onOpenHistory(writing)}
            >
              <History className="w-3.5 h-3.5" />
              Histórico ({writing.version_count})
            </button>
          )}

          {writing.href && (
            <Link href={writing.href} className="btn btn-ghost btn-xs gap-1">
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir aula
            </Link>
          )}

          {canReview && (
            <button
              type="button"
              className="btn btn-primary btn-xs gap-1"
              onClick={() => onReview(writing)}
            >
              <Send className="w-3.5 h-3.5" />
              Revisar
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function KindIcon({ kind }: { kind: WritingKind }) {
  const className = 'w-4 h-4 shrink-0 mt-0.5';
  if (kind === 'reflection') return <PenLine className={`${className} text-primary`} />;
  if (kind === 'forum_post') return <MessageCircle className={`${className} text-accent`} />;
  if (kind === 'forum_reply') return <CornerDownRight className={`${className} text-info`} />;
  return <Network className={`${className} text-secondary`} />;
}

function StatusBadge({ writing }: { writing: StudentWriting }) {
  if (writing.status === 'submitted') {
    return <span className="badge badge-warning badge-sm shrink-0">Aguardando revisão</span>;
  }
  if (writing.status === 'reviewed') {
    return <span className="badge badge-success badge-sm shrink-0">Revisado</span>;
  }
  if (writing.status === 'draft') {
    return <span className="badge badge-ghost badge-sm shrink-0">Rascunho</span>;
  }
  return null;
}

function formatDate(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86400000);
  if (days === 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 7) return `${days} dias atrás`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}
