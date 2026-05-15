'use client';

import { use, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BackButton } from '@/shared/components/BackButton';
import { useBookReader, BookReader } from '@/features/library';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { evaluateAccess } from '@/shared/content-access/accessGate';
import { useUserGrants } from '@/features/content-access/hooks/useUserGrants';
import { AccessBlockedModal } from '@/shared/components/AccessBlockedModal';
import type { AccessDecision } from '@/shared/types/content-access';

export default function BookReaderPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = use(params);
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref');
  const user = useCurrentUser();
  const router = useRouter();
  const { grantedIds } = useUserGrants(user?.id, 'book');
  const [decision, setDecision] = useState<AccessDecision | null>(null);

  // Spoiler input vazio até integração com aula (step 9)
  const { book, chapters, visibleUntil, truncated, loading, error } = useBookReader(bookId, []);

  useEffect(() => {
    if (!user || !book) { setDecision(null); return; }
    const accessUser = { uid: user.id, role: user.role, birthdate: user.birthdate };
    setDecision(evaluateAccess(book, accessUser, grantedIds));
  }, [user, book, grantedIds]);

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

  if (decision && !decision.allowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 bg-base-200">
        <BackButton fallbackHref="/app/dashboard/library" />
        <AccessBlockedModal
          open
          decision={decision}
          contentTitle={book.title}
          onClose={() => router.push('/app/dashboard/library')}
        />
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
