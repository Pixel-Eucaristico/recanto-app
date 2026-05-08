'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { BackButton } from '@/shared/components/BackButton';
import { useBookReader, BookReader } from '@/features/library';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

export default function BookReaderPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = use(params);
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref');
  const user = useCurrentUser();

  // Spoiler input vazio até integração com aula (step 9)
  const { book, chapters, visibleUntil, truncated, loading, error } = useBookReader(bookId, []);

  if (!user) return <div className="p-6">Faça login pra ler.</div>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 bg-base-200">
        <p className="text-base-content/70">{error ?? 'Livro não encontrado.'}</p>
        <BackButton fallbackHref="/app/dashboard/library" />
      </div>
    );
  }

  return (
    <BookReader
      book={book}
      chapters={chapters}
      visibleUntil={visibleUntil}
      truncated={truncated}
      initialRef={initialRef}
      userId={user.id}
    />
  );
}
