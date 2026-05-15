'use client';

import { History, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { useReadingHistory } from '@/features/library/hooks/useReadingHistory';
import { BookHistoryCard } from '@/features/library/components/BookHistoryCard';
import { BookReadingProgress } from '@/domain/library/types';

export default function LibraryHistoryPage() {
  const user = useCurrentUser();
  const { reading, completed, wantToRead, loading, error } = useReadingHistory(user?.id);

  if (!user) return <div className="p-6">Faça login para ver seu histórico.</div>;

  const total = reading.length + completed.length + wantToRead.length;

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 space-y-4 md:space-y-6">
      <header className="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-4 md:p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <History className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-base-content">Meu Histórico</h1>
              <p className="text-base-content/60 text-xs md:text-sm">
                {total} {total === 1 ? 'livro' : 'livros'} · {completed.length} concluído{completed.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Link href="/app/dashboard/library" className="btn btn-ghost btn-sm gap-1">
            <BookOpen className="w-4 h-4" /> Catálogo
          </Link>
        </div>
      </header>

      {loading && <div className="alert alert-info text-sm"><span>Carregando histórico...</span></div>}
      {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

      {!loading && !error && total === 0 && (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body items-center py-12 text-center">
            <BookOpen className="w-12 h-12 text-base-content/30 mb-3" />
            <p className="text-base-content/60">Nenhuma leitura registrada ainda.</p>
            <Link href="/app/dashboard/library" className="btn btn-primary btn-sm mt-3 gap-1">
              <BookOpen className="w-4 h-4" /> Explorar biblioteca
            </Link>
          </div>
        </div>
      )}

      <HistorySection title="Lendo" items={reading} />
      <HistorySection title="Concluídos" items={completed} />
      <HistorySection title="Quero ler" items={wantToRead} />
    </div>
  );
}

function HistorySection({ title, items }: { title: string; items: BookReadingProgress[] }) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide px-1">
        {title} <span className="text-base-content/40">({items.length})</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(p => (
          <BookHistoryCard key={p.id} progress={p} />
        ))}
      </div>
    </section>
  );
}
