'use client';

import Link from 'next/link';
import { Users, ArrowRight, GraduationCap, ShieldCheck, PenLine } from 'lucide-react';

interface CreatorViewProps {
  /** Reflexões aguardando revisão nas trilhas do formador. */
  pendingReviews?: number;
}

export function CreatorView({ pendingReviews = 0 }: CreatorViewProps) {
  return (
    <section className="space-y-2">
      <h2 className="font-semibold text-sm sm:text-base flex items-center gap-1">
        <Users className="w-4 h-4 text-accent" /> Como formador
      </h2>

      <Link
        href="/app/dashboard/formator/students"
        className="card bg-base-100 border border-accent/30 hover:border-accent block"
      >
        <div className="card-body p-3 sm:p-4 flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <GraduationCap className="w-5 h-5 text-accent shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Meus alunos</p>
              <p className="text-xs text-base-content/60 mt-0.5">
                Acompanhe o progresso dos alunos das suas trilhas
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-accent" />
        </div>
      </Link>

      <Link
        href="/app/dashboard/formator/writings"
        className="card bg-base-100 border border-base-300 hover:border-accent block"
      >
        <div className="card-body p-3 sm:p-4 flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <PenLine className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Escritos dos alunos</p>
              <p className="text-xs text-base-content/60 mt-0.5">
                Reflexões, posts e histórico de edições
              </p>
            </div>
          </div>
          {pendingReviews > 0 && (
            <span className="badge badge-warning badge-sm shrink-0">{pendingReviews}</span>
          )}
          <ArrowRight className="w-5 h-5 text-accent" />
        </div>
      </Link>

      <Link
        href="/app/dashboard/formator/approvals"
        className="card bg-base-100 border border-base-300 hover:border-accent block"
      >
        <div className="card-body p-3 sm:p-4 flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <ShieldCheck className="w-5 h-5 text-warning shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Aprovações pendentes</p>
              <p className="text-xs text-base-content/60 mt-0.5">
                Aprove ou rejeite solicitações de acesso às trilhas
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-accent" />
        </div>
      </Link>

      <Link
        href="/app/dashboard/admin/formation"
        className="card bg-base-100 border border-base-300 hover:border-accent block"
      >
        <div className="card-body p-3 sm:p-4 flex-row items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Gerenciar trilhas e aulas</p>
            <p className="text-xs text-base-content/60 mt-0.5">
              Criar/editar trilhas, módulos, aulas e atividades
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-accent" />
        </div>
      </Link>
    </section>
  );
}
