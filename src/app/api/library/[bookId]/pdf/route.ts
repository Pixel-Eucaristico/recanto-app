export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// PDF generation pode ser pesado pra livros grandes. Vercel Pro = max 300s.
// Em Hobby (default 10s) livros grandes vão estourar — upgrade necessário.
export const maxDuration = 300;

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, firestore } from '@/domains/auth/services/firebaseAdmin';
import { verifySession } from '@/domains/auth/services/sessionService';
import { adminGetBook, adminListChapters } from '@/application/library/BookAdminLoader';
import { BookSpoilerEngine } from '@/application/library/BookSpoilerEngine';
import { bookPdfGenerator } from '@/application/library/BookPdfGenerator';
import { BookExportEntity } from '@/domain/library/entities/BookExport';
import { canDownloadLibrary, canReadLibrary } from '@/application/library/libraryPermissions';
import { env } from '@/config/env';
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

  if (!canDownloadLibrary(user)) {
    return NextResponse.json({ error: 'Sem permissão para baixar livros.' }, { status: 403 });
  }

  const { bookId } = await params;

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

  let coverBuffer: Buffer | undefined;
  if (book.cover_url) {
    try {
      const res = await fetch(book.cover_url);
      if (res.ok) coverBuffer = Buffer.from(await res.arrayBuffer());
    } catch {
      // Proceed without cover
    }
  }

  let backCoverBuffer: Buffer | undefined;
  if (book.back_cover_url) {
    try {
      const res = await fetch(book.back_cover_url);
      if (res.ok) backCoverBuffer = Buffer.from(await res.arrayBuffer());
    } catch {
      // Proceed without back cover
    }
  }

  // Engine selection: query string `?engine=typst|react-pdf` override, fallback env PDF_ENGINE
  const engineQuery = req.nextUrl.searchParams.get('engine');
  const engine = engineQuery === 'typst' || engineQuery === 'react-pdf'
    ? engineQuery
    : env.PDF_ENGINE;

  // Debug: ?debug=source retorna o source Typst do primeiro chunk pra inspeção.
  // Permite identificar o que está quebrando "expected comma" etc.
  if (req.nextUrl.searchParams.get('debug') === 'source' && engine === 'typst') {
    try {
      const { bookPdfGeneratorTypst: gen } = await import('@/application/library/BookPdfGeneratorTypst');
      const debugSource = gen.buildSourceForDebug(book, chapters.slice(0, 25));
      return new NextResponse(debugSource, {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return new NextResponse(`Erro ao gerar debug source: ${msg}`, { status: 500 });
    }
  }

  try {
    let pdfBuffer: Buffer;
    if (engine === 'typst') {
      // Chunked generation: split em chunks pra evitar OOM/timeout.
      // Cada chunk: Typst.generate → pdf-lib merge → free buffer.
      // Mantém layout correto (Typst trata footnotes no rodapé nativo).
      const CHUNK_SIZE = 25;
      const { bookPdfGeneratorTypst } = await import('@/application/library/BookPdfGeneratorTypst');
      const { PDFDocument } = await import('pdf-lib');

      const chunks: typeof chapters[] = [];
      for (let i = 0; i < chapters.length; i += CHUNK_SIZE) {
        chunks.push(chapters.slice(i, i + CHUNK_SIZE));
      }

      const finalDoc = await PDFDocument.create();
      finalDoc.setTitle(book.title);
      if (book.author) finalDoc.setAuthor(book.author);
      if (book.language) finalDoc.setLanguage(book.language);

      for (let i = 0; i < chunks.length; i++) {
        const isFirst = i === 0;
        const isLast = i === chunks.length - 1;
        const chunkBuf = await bookPdfGeneratorTypst.generate(
          book,
          chunks[i],
          isFirst ? coverBuffer : undefined,
          isLast ? truncatedAt : undefined,
          isLast ? backCoverBuffer : undefined,
        );
        const src = await PDFDocument.load(new Uint8Array(chunkBuf));
        const pages = await finalDoc.copyPages(src, src.getPageIndices());
        for (const p of pages) finalDoc.addPage(p);
        // chunkBuf + src vão pra GC no fim da iteração
      }

      pdfBuffer = Buffer.from(await finalDoc.save());
    } else {
      pdfBuffer = await bookPdfGenerator.generate(book, chapters, coverBuffer, truncatedAt, backCoverBuffer);
    }
    const slug = BookExportEntity.bookSlug(book);

    const headers = new Headers({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${slug}.pdf"`,
      'Content-Length': String(pdfBuffer.length),
    });
    if (truncatedAt) {
      headers.set('X-Spoiler-Cut-At', truncatedAt);
    }
    headers.set('X-Pdf-Engine', engine);

    return new NextResponse(new Uint8Array(pdfBuffer), { status: 200, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[PDF export] Falha gerando PDF', {
      bookId,
      engine,
      chapterCount: chapters.length,
      totalBlocks: chapters.reduce((acc, ch) => acc + ch.blocks.length, 0),
      error: message,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return NextResponse.json(
      {
        error: 'Falha ao gerar PDF. Livro pode ser grande demais.',
        details: message,
        chapterCount: chapters.length,
      },
      { status: 500 },
    );
  }
}
