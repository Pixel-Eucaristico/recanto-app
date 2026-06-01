export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, firestore } from '@/domains/auth/services/firebaseAdmin';
import { verifySession } from '@/domains/auth/services/sessionService';
import { adminGetBook, adminListChapters } from '@/application/library/BookAdminLoader';
import { BookSpoilerEngine } from '@/application/library/BookSpoilerEngine';
import { CanonicalRefEntity } from '@/domain/library/entities/CanonicalRef';
import { bookEpubGenerator } from '@/application/library/BookEpubGenerator';
import { buildAttachmentDisposition } from '@/application/library/bookDownloadFilename';
import { canDownloadLibrary, canReadLibrary } from '@/application/library/libraryPermissions';
import { evaluateAccess } from '@/shared/content-access/accessGate';
import type { Role } from '@/shared/types/role';

interface AuthedUser {
  uid: string;
  role?: string | null;
  features?: string[];
  birthdate?: string;
}

async function verifyRequest(req: NextRequest): Promise<AuthedUser | null> {
  const bearer = req.headers.get('authorization')?.replace('Bearer ', '');
  if (bearer) {
    try {
      const decoded = await adminAuth.verifyIdToken(bearer);
      const userDoc = await firestore.collection('users').doc(decoded.uid).get();
      const data = userDoc.exists ? userDoc.data() : null;
      return {
        uid: decoded.uid,
        role: data?.role ?? null,
        features: (data?.features as string[] | undefined) ?? [],
        birthdate: data?.birthdate as string | undefined,
      };
    } catch {
      // Fall through
    }
  }
  const session = await verifySession();
  if (!session) return null;
  return {
    uid: session.uid,
    role: (session as { role?: string | null }).role ?? null,
    features: (session as { features?: string[] }).features ?? [],
    birthdate: (session as { birthdate?: string }).birthdate,
  };
}

async function userHasGrant(userId: string, bookId: string): Promise<boolean> {
  const snap = await firestore
    .collection('content_grants')
    .where('user_id', '==', userId)
    .where('content_id', '==', bookId)
    .where('content_type', '==', 'book')
    .limit(1)
    .get();
  return !snap.empty;
}

async function userHasProgress(userId: string, bookId: string): Promise<boolean> {
  const snap = await firestore.collection('book_reading_progress').doc(`${userId}_${bookId}`).get();
  return snap.exists;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookId: string }> },
) {
  const user = await verifyRequest(req);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  // Permission gate: needs download:library OR (read:library AND course unlock)
  if (!canDownloadLibrary(user)) {
    return NextResponse.json({ error: 'Sem permissão para baixar livros.' }, { status: 403 });
  }

  const { bookId } = await params;

  // Library access gate: read:library OR course-unlocked progress
  if (!canReadLibrary(user)) {
    const unlocked = await userHasProgress(user.uid, bookId);
    if (!unlocked) {
      return NextResponse.json({ error: 'Livro não liberado pelo seu curso.' }, { status: 403 });
    }
  }

  const book = await adminGetBook(bookId);
  if (!book) return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });

  // Access gate (idade + role + grant). Admin sempre passa.
  const hasGrant = await userHasGrant(user.uid, bookId);
  const grantSet = new Set<string>(hasGrant ? [bookId] : []);
  const accessDecision = evaluateAccess(
    {
      id: bookId,
      required_roles: book.required_roles ?? [],
      age_rating: book.age_rating ?? 'L',
    },
    { uid: user.uid, role: (user.role ?? null) as Role, birthdate: user.birthdate },
    grantSet,
  );
  if (!accessDecision.allowed) {
    return NextResponse.json(
      { error: 'Acesso bloqueado por classificação ou grupo.', reason: accessDecision.reason, minAge: accessDecision.minAge },
      { status: 403 },
    );
  }

  const allChapters = await adminListChapters(bookId);
  const { visible_until } = BookSpoilerEngine.compute(book, []);
  const { chapters, truncatedAt } = BookSpoilerEngine.applyCut(allChapters, visible_until);
  const visibleUntilStr = visible_until ? CanonicalRefEntity.format(visible_until) : null;

  let coverBuffer: Buffer | undefined;
  if (book.cover_url) {
    try {
      const res = await fetch(book.cover_url);
      if (res.ok) coverBuffer = Buffer.from(await res.arrayBuffer());
    } catch {
      // Proceed without cover
    }
  }

  const epubBuffer = await bookEpubGenerator.generate(book, chapters, coverBuffer);

  const headers = new Headers({
    'Content-Type': 'application/epub+zip',
    'Content-Disposition': buildAttachmentDisposition(book, 'epub'),
    'Content-Length': String(epubBuffer.length),
  });
  if (truncatedAt && visibleUntilStr) {
    headers.set('X-Spoiler-Cut-At', visibleUntilStr);
  }

  return new NextResponse(new Uint8Array(epubBuffer), { status: 200, headers });
}
