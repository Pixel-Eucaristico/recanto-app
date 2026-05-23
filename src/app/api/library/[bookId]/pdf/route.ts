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

  // Typst-only — único engine suportado (footnotes no rodapé, layout correto).
  // Estratégia: 1 chapter por chunk Typst (compile isolado). Se chapter X falha,
  // SKIP esse chapter (log warn) e continua os demais.
  // Merge final via pdf-lib em UM PDF único (capa/TOC chunk 0, back cover último).
  try {
    const { bookPdfGeneratorTypst } = await import('@/application/library/BookPdfGeneratorTypst');
    const { PDFDocument } = await import('pdf-lib');

    const finalDoc = await PDFDocument.create();
    finalDoc.setTitle(book.title);
    if (book.author) finalDoc.setAuthor(book.author);
    if (book.language) finalDoc.setLanguage(book.language);

    let pageOffset = 1;
    const failedChapters: { order: number; title: string; error: string }[] = [];
    const compiledChunks: Array<{
      chapter: typeof chapters[number];
      buffer: Buffer;
      pageCount: number;
      startPageNumber: number;
    }> = [];
    const tocEntries: Array<{ level: number; title: string; page: number }> = [];

    // Primeira passagem: compila cada capítulo separadamente, já com a página
    // inicial correta, para coletar subtítulos e contar somente páginas numeradas.
    for (const ch of chapters) {
      try {
        const chunk = await bookPdfGeneratorTypst.generateWithMetadata(
          book,
          [ch],
          undefined,
          undefined,
          undefined,
          {
            skipCover: true,
            skipToc: true,
            skipBackCover: true,
            startPageNumber: pageOffset,
          },
        );
        const src = await PDFDocument.load(new Uint8Array(chunk.buffer));
        const pageCount = src.getPageCount();
        compiledChunks.push({
          chapter: ch,
          buffer: chunk.buffer,
          pageCount,
          startPageNumber: pageOffset,
        });
        tocEntries.push(...chunk.tocEntries);
        pageOffset += pageCount;
      } catch (chErr) {
        const msg = chErr instanceof Error ? chErr.message : String(chErr);
        console.error(`[PDF] Falha no preflight do chapter ${ch.order} "${ch.title}":`, msg);
        failedChapters.push({ order: ch.order, title: ch.title, error: msg });
      }
    }

    for (let i = 0; i < compiledChunks.length; i++) {
      const chunk = compiledChunks[i];
      const ch = chunk.chapter;
      const isFirst = i === 0;
      const isLast = i === compiledChunks.length - 1;
      try {
        const needsRecompile = isFirst || isLast;
        const chunkBuf = needsRecompile
          ? await bookPdfGeneratorTypst.generate(
              book,
              [ch],
              isFirst ? coverBuffer : undefined,
              isLast ? truncatedAt : undefined,
              isLast ? backCoverBuffer : undefined,
              {
                skipCover: !isFirst,
                skipToc: !isFirst,
                skipBackCover: !isLast,
                startPageNumber: chunk.startPageNumber,
                tocEntries,
              },
            )
          : chunk.buffer;
        const src = await PDFDocument.load(new Uint8Array(chunkBuf));
        const pages = await finalDoc.copyPages(src, src.getPageIndices());
        for (const p of pages) finalDoc.addPage(p);
      } catch (chErr) {
        const msg = chErr instanceof Error ? chErr.message : String(chErr);
        console.error(`[PDF] Falha no merge/final do chapter ${ch.order} "${ch.title}":`, msg);
        failedChapters.push({ order: ch.order, title: ch.title, error: msg });
      }
    }

    if (finalDoc.getPageCount() === 0) {
      throw new Error(
        `Nenhum chapter compilou. Falhas: ${failedChapters.map(f => `cap.${f.order} "${f.title}"`).join('; ')}`,
      );
    }

    const pdfBuffer = Buffer.from(await finalDoc.save());
    // Filename usa título raw (mantém acentos/Unicode) via filename*=UTF-8'' RFC 5987.
    // Fallback ASCII pra clients antigos.
    const rawTitle = book.title.trim() || book.id;
    const asciiFallback = rawTitle
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // remove diacritics no fallback
      .replace(/[^\x20-\x7E]/g, '_')   // non-ASCII vira _
      .replace(/"/g, "'");
    const utf8Encoded = encodeURIComponent(rawTitle);

    const headers = new Headers({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${asciiFallback}.pdf"; filename*=UTF-8''${utf8Encoded}.pdf`,
      'Content-Length': String(pdfBuffer.length),
    });
    if (truncatedAt) {
      headers.set('X-Spoiler-Cut-At', truncatedAt);
    }
    headers.set('X-Pdf-Engine', 'typst');
    if (failedChapters.length > 0) {
      headers.set('X-Failed-Chapters', JSON.stringify(failedChapters));
    }

    return new NextResponse(new Uint8Array(pdfBuffer), { status: 200, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[PDF export] Falha Typst', {
      bookId,
      chapterCount: chapters.length,
      totalBlocks: chapters.reduce((acc, ch) => acc + ch.blocks.length, 0),
      error: message,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return NextResponse.json(
      {
        error: 'Falha ao gerar PDF.',
        details: message,
        chapterCount: chapters.length,
      },
      { status: 500 },
    );
  }
}
