import {
  Document, Page, Text, View, Image, Link, StyleSheet, renderToBuffer,
} from '@react-pdf/renderer';
import React from 'react';
import type {
  Book, BookChapter, BookBlock, BookReference, BookGlossaryTerm, BookCredits,
  BookFootnote, CitationStyle,
} from '@/domain/library/types';
import { CitationFormatter } from '@/domain/library/entities/CitationFormatter';
import { BookEntity } from '@/domain/library/entities/Book';

// ─── Inline markdown parser for PDF ──────────────────────────────────────────

const INLINE_PATTERNS: Array<{ re: RegExp; type: string }> = [
  { re: /\[([^\]]*)\]\(([^)]+)\)/, type: 'link' },   // [text](url)
  { re: /\*\*\*(.+?)\*\*\*/, type: 'bolditalic' },    // ***text***
  { re: /\*\*(.+?)\*\*/, type: 'bold' },              // **text**
  { re: /~~(.+?)~~/, type: 'strikethrough' },         // ~~text~~
  { re: /\*(.+?)\*/, type: 'italic' },                // *text*
  { re: /_(.+?)_/, type: 'italic' },                  // _text_
  { re: /`(.+?)`/, type: 'code' },                    // `code`
];

function parseInlinePdf(raw: string): React.ReactNode[] {
  const unescaped = raw.replace(/\\([^a-zA-Z0-9])/g, '$1');
  const nodes: React.ReactNode[] = [];
  let remaining = unescaped;
  let key = 0;

  while (remaining.length > 0) {
    let earliest: RegExpExecArray | null = null;
    let earliestType = '';

    for (const { re, type } of INLINE_PATTERNS) {
      const m = re.exec(remaining);
      if (m && (earliest === null || m.index < earliest.index)) {
        earliest = m;
        earliestType = type;
      }
    }

    if (!earliest) {
      nodes.push(remaining);
      break;
    }

    if (earliest.index > 0) {
      nodes.push(remaining.slice(0, earliest.index));
    }

    const k = key++;
    if (earliestType === 'link') {
      // Parse inline markdown inside link text (e.g. [*italic*](url))
      const innerNodes = parseInlinePdf(earliest[1].trim());
      nodes.push(
        React.createElement(Link, { key: k, src: earliest[2], style: { color: '#1d4ed8' } },
          React.createElement(Text, null, ...innerNodes),
        ),
      );
    } else if (earliestType === 'bolditalic') {
      nodes.push(
        React.createElement(Text, { key: k, style: { fontFamily: 'Times-BoldItalic' } },
          earliest[1],
        ),
      );
    } else if (earliestType === 'bold') {
      nodes.push(
        React.createElement(Text, { key: k, style: { fontFamily: 'Times-Bold' } },
          earliest[1],
        ),
      );
    } else if (earliestType === 'strikethrough') {
      nodes.push(
        React.createElement(Text, { key: k, style: { textDecoration: 'line-through' } },
          earliest[1],
        ),
      );
    } else if (earliestType === 'italic') {
      nodes.push(
        React.createElement(Text, { key: k, style: { fontFamily: 'Times-Italic' } },
          earliest[1],
        ),
      );
    } else if (earliestType === 'code') {
      nodes.push(
        React.createElement(Text, { key: k, style: { fontFamily: 'Courier', fontSize: 9 } },
          earliest[1],
        ),
      );
    }

    remaining = remaining.slice(earliest.index + earliest[0].length);
  }

  return nodes;
}

function inlineText(raw: string, style?: object): React.ReactElement {
  const nodes = parseInlinePdf(raw);
  return React.createElement(Text as React.ComponentType<{ style?: object; children?: React.ReactNode }>, style ? { style } : {}, nodes);
}

// A5: 419.53 x 595.28 pt
const PAGE_PX = 419;
const MARGIN_H = 56;
const MARGIN_V = 48;

const styles = StyleSheet.create({
  page: {
    paddingTop: MARGIN_V,
    paddingBottom: MARGIN_V + 20,
    paddingHorizontal: MARGIN_H,
    fontFamily: 'Times-Roman',
    fontSize: 11,
    lineHeight: 1.65,
    color: '#222222',
  },
  headerFixed: {
    fontSize: 8,
    color: '#999999',
    borderBottomWidth: 0.5,
    borderBottomColor: '#dddddd',
    paddingBottom: 3,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerFixed: {
    fontSize: 8,
    color: '#999999',
    borderTopWidth: 0.5,
    borderTopColor: '#dddddd',
    paddingTop: 3,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coverTitle: {
    fontFamily: 'Times-Bold',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 30,
  },
  coverSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: '#555555',
    marginBottom: 8,
  },
  coverAuthor: {
    fontSize: 12,
    textAlign: 'center',
    color: '#555555',
    marginTop: 6,
  },
  coverImage: {
    width: 180,
    height: 250,
    marginTop: 40,
    alignSelf: 'center',
  },
  chapterTitle: {
    fontFamily: 'Times-Bold',
    fontSize: 16,
    marginBottom: 10,
  },
  chapterSubtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 10,
  },
  paragraph: {
    marginBottom: 6,
    textAlign: 'justify',
  },
  ref: {
    fontSize: 7,
    color: '#aaaaaa',
  },
  quote: {
    marginLeft: 16,
    marginRight: 8,
    marginVertical: 6,
    paddingLeft: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#cccccc',
    color: '#555555',
    fontFamily: 'Times-Italic',
    fontSize: 11,
  },
  heading2: {
    fontFamily: 'Times-Bold',
    fontSize: 13,
    marginTop: 10,
    marginBottom: 5,
  },
  heading3: {
    fontFamily: 'Times-Bold',
    fontSize: 11,
    marginTop: 7,
    marginBottom: 3,
  },
  code: {
    fontFamily: 'Courier',
    fontSize: 9,
    backgroundColor: '#f4f4f4',
    padding: 6,
    marginVertical: 5,
  },
  listRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bullet: {
    width: 14,
    fontSize: 11,
  },
  spoilerBox: {
    marginTop: 30,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ffca28',
  },
  spoilerText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  footnoteFooter: {
    marginTop: 18,
    paddingTop: 5,
    borderTopWidth: 0.5,
    borderTopColor: '#888888',
  },
  inlineFnRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  inlineFnNum: {
    fontSize: 8,
    width: 14,
    color: '#333333',
  },
});

const ce = React.createElement;

const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};
function toSuperscript(n: number): string {
  return String(n).split('').map(d => SUPERSCRIPTS[d] ?? d).join('');
}

/** Aceita [^N] com qualquer escape de Lexical/markdown (0+ backslashes em cada bracket/circumflex). */
const FOOTNOTE_MARKER_RE = /\\*\[\\*\^(\d+)\\*\]/g;

/** Substitui [^N] por superscript ¹²³. Markers órfãos somem. */
function withFootnoteMarkers(content: string, footnotes?: BookFootnote[]): string {
  if (!footnotes || footnotes.length === 0) {
    return content.replace(FOOTNOTE_MARKER_RE, '');
  }
  return content.replace(FOOTNOTE_MARKER_RE, (_, n) => {
    const num = Number(n);
    const fn = footnotes.find(f => f.number === num);
    return fn ? toSuperscript(num) : '';
  });
}

/** Extrai footnotes citados (escapados ou não), em ordem de aparição. */
function extractCitedFootnotes(content: string, footnotes?: BookFootnote[]): BookFootnote[] {
  if (!footnotes || footnotes.length === 0) return [];
  const seen = new Set<number>();
  const result: BookFootnote[] = [];
  const re = new RegExp(FOOTNOTE_MARKER_RE.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const num = Number(m[1]);
    if (seen.has(num)) continue;
    const fn = footnotes.find(f => f.number === num);
    if (fn) { seen.add(num); result.push(fn); }
  }
  return result;
}

function renderFootnoteFooter(cited: BookFootnote[]): React.ReactElement | null {
  if (cited.length === 0) return null;
  // Inline footer styled como rodapé de livro: separator full width + small italic.
  // Wrap=false no wrapper externo garante mesma página que parágrafo.
  return ce(View, { style: styles.footnoteFooter },
    ...cited.map(f =>
      ce(View, { key: f.id, style: styles.inlineFnRow },
        ce(Text, { style: styles.inlineFnNum }, toSuperscript(f.number)),
        ce(View, { style: { flex: 1 } }, inlineText(f.content, { fontSize: 8, color: '#333333', lineHeight: 1.35 })),
      ),
    ),
  );
}

function renderBlock(block: BookBlock, footnotes?: BookFootnote[]): React.ReactElement | React.ReactElement[] | null {
  switch (block.kind) {
    case 'paragraph': {
      const cited = extractCitedFootnotes(block.content, footnotes);
      const footnoteFooter = renderFootnoteFooter(cited);
      const paragraphInner = ce(View, { style: styles.paragraph },
        block.ref ? ce(Text, { style: styles.ref }, `[${block.ref}]  `) : null,
        inlineText(withFootnoteMarkers(block.content, footnotes)),
      );
      // Sem footnote: parágrafo wrappa natural mid-text (wrap default true).
      // Com footnote: wrap=false força parágrafo+footnote ficarem juntos na mesma página.
      if (footnoteFooter) {
        return ce(View, { key: block.id, wrap: false }, paragraphInner, footnoteFooter);
      }
      return ce(View, { key: block.id }, paragraphInner);
    }

    case 'quote': {
      const cited = extractCitedFootnotes(block.content, footnotes);
      const footnoteFooter = renderFootnoteFooter(cited);
      const quoteInner = ce(View, { style: styles.quote },
        block.ref ? ce(Text, { style: styles.ref }, `[${block.ref}]`) : null,
        inlineText(withFootnoteMarkers(block.content, footnotes), { fontFamily: 'Times-Italic' }),
      );
      if (footnoteFooter) {
        return ce(View, { key: block.id, wrap: false }, quoteInner, footnoteFooter);
      }
      return ce(View, { key: block.id }, quoteInner);
    }

    case 'heading': {
      const lvl = block.heading_level ?? 2;
      const cleanContent = withFootnoteMarkers(block.content, footnotes);
      return ce(Text, { key: block.id, style: lvl <= 2 ? styles.heading2 : styles.heading3 }, cleanContent);
    }

    case 'list': {
      const lines = block.content.split('\n').filter(Boolean);
      return ce(View, { key: block.id },
        ...lines.map((l, i) => {
          const text = l.replace(/^(\s*)([-*+]|\d+\.)\s+/, '');
          const bullet = /^\d+\./.test(l) ? `${i + 1}.` : '•';
          return ce(View, { key: i, style: styles.listRow },
            ce(Text, { style: styles.bullet }, bullet),
            inlineText(withFootnoteMarkers(text, footnotes)),
          );
        }),
      );
    }

    case 'code':
      return ce(Text, { key: block.id, style: styles.code }, block.content);

    case 'image_ref': {
      // Skip external images without recognized extension — @react-pdf crashes on them
      const [url, ...captionParts] = (block.content ?? '').split('|');
      const caption = captionParts.join('|');
      const hasExt = /\.(jpe?g|png|gif|webp|bmp)(\?|$)/i.test(url ?? '');
      if (!url || !hasExt) {
        return caption
          ? ce(Text, { key: block.id, style: { fontSize: 9, color: '#888', marginVertical: 3 } }, `[imagem: ${caption}]`)
          : null;
      }
      return ce(View, { key: block.id, style: { marginVertical: 6 } },
        ce(Image, { src: url, style: { width: PAGE_PX - MARGIN_H * 2, height: 180 } }),
        caption ? ce(Text, { style: { fontSize: 9, color: '#888', marginTop: 3, textAlign: 'center' } }, caption) : null,
      );
    }

    default:
      return ce(Text, { key: block.id, style: styles.paragraph }, block.content);
  }
}

// A5 dimensions in points for pdf-lib
const A5_WIDTH = 419.53;
const A5_HEIGHT = 595.28;

const fullBleedStyles = StyleSheet.create({
  page: { padding: 0, margin: 0 },
  fullImage: { width: A5_WIDTH, height: A5_HEIGHT, objectFit: 'cover' },
});

function buildCoverDocument(coverBuffer: Buffer, title: string) {
  return ce(Document, { title },
    ce(Page, { size: 'A5', style: fullBleedStyles.page },
      ce(Image, {
        src: `data:image/jpeg;base64,${coverBuffer.toString('base64')}`,
        style: fullBleedStyles.fullImage,
      }),
    ),
  );
}

function buildBackCoverDocument(backBuffer: Buffer, title: string) {
  return ce(Document, { title },
    ce(Page, { size: 'A5', style: fullBleedStyles.page },
      ce(Image, {
        src: `data:image/jpeg;base64,${backBuffer.toString('base64')}`,
        style: fullBleedStyles.fullImage,
      }),
    ),
  );
}

function buildChapterDocument(book: Book, ch: BookChapter) {
  const kind = ch.kind ?? 'chapter';
  let bodyContent: React.ReactNode[];

  if (kind === 'bibliography' && ch.references && ch.references.length > 0) {
    bodyContent = renderBibliographyPdf(ch.references, ch.citation_style ?? 'abnt');
  } else if (kind === 'glossary' && ch.glossary_terms && ch.glossary_terms.length > 0) {
    bodyContent = renderGlossaryPdf(ch.glossary_terms);
  } else if (kind === 'credits' && ch.credits) {
    bodyContent = renderCreditsPdf(ch.credits);
  } else {
    bodyContent = ch.blocks
      .flatMap(b => {
        const r = renderBlock(b, ch.footnotes);
        if (r === null) return [];
        return Array.isArray(r) ? r : [r];
      });
    if (ch.footnotes && ch.footnotes.length > 0) {
      const allCited = new Set<number>();
      for (const b of ch.blocks) {
        if (!b.content) continue;
        const re = new RegExp(FOOTNOTE_MARKER_RE.source, 'g');
        let m: RegExpExecArray | null;
        while ((m = re.exec(b.content)) !== null) allCited.add(Number(m[1]));
      }
      const orphans = ch.footnotes.filter(f => !allCited.has(f.number));
      if (orphans.length > 0) bodyContent.push(renderFootnotesPdf(orphans));
    }
  }

  return ce(Document, { title: ch.title },
    ce(Page, { size: 'A5', style: styles.page },
      ce(View, { style: styles.headerFixed, fixed: true },
        ce(Text, null, book.title),
        ce(Text, { render: ({ pageNumber }: { pageNumber: number }) => String(pageNumber) }),
      ),
      ce(Text, { style: styles.chapterTitle }, ch.title),
      ch.subtitle ? ce(Text, { style: styles.chapterSubtitle }, ch.subtitle) : null,
      ...bodyContent,
      ce(View, { style: styles.footerFixed, fixed: true },
        ce(Text, null, ch.title.slice(0, 40)),
        ce(Text, { render: ({ pageNumber }: { pageNumber: number }) => String(pageNumber) }),
      ),
    ),
  );
}

function buildSpoilerDocument(truncatedAt: string) {
  return ce(Document, { title: 'Conteúdo cortado' },
    ce(Page, { size: 'A5', style: styles.page },
      ce(View, { style: styles.spoilerBox },
        ce(Text, { style: styles.spoilerText },
          `Conteúdo cortado em ${truncatedAt}.\nConclua as aulas relacionadas para liberar o restante.`,
        ),
      ),
    ),
  );
}

// ─── Section-specific renderers for PDF ────────────────────────────────────

function renderBibliographyPdf(refs: BookReference[], style: CitationStyle): React.ReactNode[] {
  const sorted = [...refs].sort((a, b) =>
    (a.authors[0]?.surname ?? '').localeCompare(b.authors[0]?.surname ?? ''),
  );
  return sorted.map(r =>
    ce(View, { key: r.id, style: { marginBottom: 8, paddingLeft: 16, textIndent: -16 } },
      inlineText(CitationFormatter.format(r, style), { fontSize: 10, lineHeight: 1.4 }),
    ),
  );
}

function renderGlossaryPdf(terms: BookGlossaryTerm[]): React.ReactNode[] {
  const sorted = [...terms].sort((a, b) => a.term.localeCompare(b.term, 'pt-BR', { sensitivity: 'base' }));
  return sorted.map(t =>
    ce(View, { key: t.id, style: { marginBottom: 8 } },
      ce(Text, { style: { fontFamily: 'Times-Bold', fontSize: 11, marginBottom: 2 } }, t.term),
      ce(View, { style: { paddingLeft: 12 } }, inlineText(t.definition, { fontSize: 10, lineHeight: 1.5 })),
    ),
  );
}

function renderCreditsPdf(credits: BookCredits): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let key = 0;
  if (credits.title) out.push(ce(Text, { key: key++, style: { fontFamily: 'Times-Bold', fontSize: 18, textAlign: 'center', marginTop: 30, marginBottom: 6 } }, credits.title));
  if (credits.subtitle) out.push(ce(Text, { key: key++, style: { fontSize: 13, color: '#555', textAlign: 'center', marginBottom: 16 } }, credits.subtitle));
  if (credits.authors?.length) out.push(ce(Text, { key: key++, style: { fontSize: 11, textAlign: 'center', marginBottom: 4 } }, `Autor${credits.authors.length > 1 ? 'es' : ''}: ${credits.authors.join(', ')}`));
  if (credits.translators?.length) out.push(ce(Text, { key: key++, style: { fontSize: 11, textAlign: 'center', marginBottom: 4 } }, `Tradutor${credits.translators.length > 1 ? 'es' : ''}: ${credits.translators.join(', ')}`));
  if (credits.illustrators?.length) out.push(ce(Text, { key: key++, style: { fontSize: 11, textAlign: 'center', marginBottom: 4 } }, `Ilustrador${credits.illustrators.length > 1 ? 'es' : ''}: ${credits.illustrators.join(', ')}`));
  if (credits.editors?.length) out.push(ce(Text, { key: key++, style: { fontSize: 11, textAlign: 'center', marginBottom: 4 } }, `Editor${credits.editors.length > 1 ? 'es' : ''}: ${credits.editors.join(', ')}`));
  const pubLine = [credits.publisher, credits.city, credits.edition ? `${credits.edition} ed.` : '', credits.year].filter(Boolean).join(' · ');
  if (pubLine) out.push(ce(Text, { key: key++, style: { fontSize: 10, color: '#666', textAlign: 'center', marginTop: 16 } }, pubLine));
  if (credits.isbn) out.push(ce(Text, { key: key++, style: { fontSize: 9, color: '#777', textAlign: 'center', marginTop: 4 } }, `ISBN: ${credits.isbn}`));
  if (credits.copyright) out.push(ce(Text, { key: key++, style: { fontSize: 9, color: '#777', textAlign: 'center', marginTop: 8 } }, credits.copyright));
  if (credits.license) out.push(ce(Text, { key: key++, style: { fontSize: 9, color: '#777', textAlign: 'center', marginTop: 4 } }, `Licença: ${credits.license}`));
  if (credits.notes) out.push(ce(View, { key: key++, style: { marginTop: 16 } }, inlineText(credits.notes, { fontSize: 10, color: '#666' })));
  return out;
}

function renderFootnotesPdf(footnotes: BookFootnote[]): React.ReactElement {
  const sorted = [...footnotes].sort((a, b) => a.number - b.number);
  return ce(View, { key: 'footnotes', style: { marginTop: 24, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: '#ccc' } },
    ce(Text, { style: { fontSize: 10, fontFamily: 'Times-Bold', color: '#555', marginBottom: 6 } }, 'Notas'),
    ...sorted.map(f =>
      ce(View, { key: f.id, style: { flexDirection: 'row', marginBottom: 3 } },
        ce(Text, { style: { fontSize: 8, color: '#666', width: 18 } }, `${f.number}.`),
        ce(View, { style: { flex: 1 } }, inlineText(f.content, { fontSize: 9, color: '#555', lineHeight: 1.4 })),
      ),
    ),
  );
}

export class BookPdfGenerator {
  async generate(
    book: Book,
    chapters: BookChapter[],
    coverImageBuffer?: Buffer,
    truncatedAt?: string,
    backCoverImageBuffer?: Buffer,
  ): Promise<Buffer> {
    const { PDFDocument } = await import('pdf-lib');
    const sorted = BookEntity.sortChapters(chapters);

    const finalDoc = await PDFDocument.create();
    finalDoc.setTitle(book.title);
    if (book.author) finalDoc.setAuthor(book.author);
    if (book.language) finalDoc.setLanguage(book.language);

    const addBlank = () => finalDoc.addPage([A5_WIDTH, A5_HEIGHT]);

    const appendDoc = async (buffer: Buffer) => {
      const src = await PDFDocument.load(new Uint8Array(buffer));
      const pages = await finalDoc.copyPages(src, src.getPageIndices());
      for (const p of pages) finalDoc.addPage(p);
    };

    // 1. Cover (full-bleed) — always page 1
    if (coverImageBuffer) {
      const coverBuf = await renderToBuffer(buildCoverDocument(coverImageBuffer, book.title));
      await appendDoc(coverBuf);
    } else {
      // Cover textual fallback when no image
      addBlank();
    }

    // 2. Blank after cover (page 2)
    addBlank();

    // 3. Each chapter starts on odd page
    for (const ch of sorted) {
      if (finalDoc.getPageCount() % 2 === 1) addBlank(); // pad so next page is odd
      const chBuf = await renderToBuffer(buildChapterDocument(book, ch));
      await appendDoc(chBuf);
    }

    // 4. Spoiler page (if any) starts on odd
    if (truncatedAt) {
      if (finalDoc.getPageCount() % 2 === 1) addBlank();
      const spoilerBuf = await renderToBuffer(buildSpoilerDocument(truncatedAt));
      await appendDoc(spoilerBuf);
    }

    // 5. Back cover handling
    if (backCoverImageBuffer) {
      // Blank before back cover
      addBlank();
      // Ensure total ends even after back cover added: count must be odd before adding back cover
      if (finalDoc.getPageCount() % 2 === 0) addBlank();
      const backBuf = await renderToBuffer(buildBackCoverDocument(backCoverImageBuffer, book.title));
      await appendDoc(backBuf);
    } else {
      // No back cover — pad to even total
      if (finalDoc.getPageCount() % 2 === 1) addBlank();
    }

    const bytes = await finalDoc.save();
    return Buffer.from(bytes);
  }
}

export const bookPdfGenerator = new BookPdfGenerator();
