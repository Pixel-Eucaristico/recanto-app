'use client';

import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';

export function CreatorView() {
  return (
    <section>
      <h2 className="font-semibold text-sm sm:text-base flex items-center gap-1 mb-2">
        <Users className="w-4 h-4 text-accent" /> Como formador
      </h2>

      <Link href="/app/dashboard/admin/formation" className="card bg-base-100 border border-accent/30 hover:border-accent block">
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
