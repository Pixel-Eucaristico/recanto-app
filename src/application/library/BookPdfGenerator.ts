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
});

const ce = React.createElement;

/** Strips/formats [^N] markers as superscript numbers in text */
function withFootnoteMarkers(content: string, footnotes?: BookFootnote[]): string {
  if (!footnotes || footnotes.length === 0) return content;
  // Just leave them visible as superscript-like markers since react-pdf doesn't support sup well
  return content; // Keep [^N] as plain text — readers can match against the footnotes section
}

function renderBlock(block: BookBlock, footnotes?: BookFootnote[]): React.ReactElement | null {
  switch (block.kind) {
    case 'paragraph':
      return ce(View, { key: block.id, style: styles.paragraph },
        block.ref ? ce(Text, { style: styles.ref }, `[${block.ref}]  `) : null,
        inlineText(withFootnoteMarkers(block.content, footnotes)),
      );

    case 'quote':
      return ce(View, { key: block.id, style: styles.quote },
        block.ref ? ce(Text, { style: styles.ref }, `[${block.ref}]`) : null,
        inlineText(withFootnoteMarkers(block.content, footnotes), { fontFamily: 'Times-Italic' }),
      );

    case 'heading': {
      const lvl = block.heading_level ?? 2;
      return ce(Text, { key: block.id, style: lvl <= 2 ? styles.heading2 : styles.heading3 }, block.content);
    }

    case 'list': {
      const lines = block.content.split('\n').filter(Boolean);
      return ce(View, { key: block.id },
        ...lines.map((l, i) => {
          const text = l.replace(/^(\s*)([-*+]|\d+\.)\s+/, '');
          const bullet = /^\d+\./.test(l) ? `${i + 1}.` : '•';
          return ce(View, { key: i, style: styles.listRow },
            ce(Text, { style: styles.bullet }, bullet),
            inlineText(text),
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

function buildDocument(
  book: Book,
  chapters: BookChapter[],
  coverImageBuffer?: Buffer,
  truncatedAt?: string,
) {
  // Ordena por grupo (front → body → back) + order dentro do grupo
  const sorted = BookEntity.sortChapters(chapters);

  // Cover page — simple stacked layout, no flex centering
  const coverPage = ce(Page, { key: 'cover', size: 'A5', style: styles.page },
    coverImageBuffer
      ? ce(Image, {
          src: `data:image/jpeg;base64,${coverImageBuffer.toString('base64')}`,
          style: styles.coverImage,
        })
      : null,
    ce(Text, { style: styles.coverTitle }, book.title),
    book.subtitle ? ce(Text, { style: styles.coverSubtitle }, book.subtitle) : null,
    book.author ? ce(Text, { style: styles.coverAuthor }, book.author) : null,
  );

  // Section pages — header/footer + content varies by kind
  const chapterPages = sorted.map(ch => {
    const kind = ch.kind ?? 'chapter';
    let bodyContent: React.ReactNode[];

    if (kind === 'bibliography' && ch.references && ch.references.length > 0) {
      bodyContent = renderBibliographyPdf(ch.references, ch.citation_style ?? 'abnt');
    } else if (kind === 'glossary' && ch.glossary_terms && ch.glossary_terms.length > 0) {
      bodyContent = renderGlossaryPdf(ch.glossary_terms);
    } else if (kind === 'credits' && ch.credits) {
      bodyContent = renderCreditsPdf(ch.credits);
    } else {
      bodyContent = ch.blocks.map(b => renderBlock(b, ch.footnotes)).filter((x): x is React.ReactElement => x !== null);
      // Append footnotes section
      if (ch.footnotes && ch.footnotes.length > 0) {
        bodyContent.push(renderFootnotesPdf(ch.footnotes));
      }
    }

    return ce(Page, { key: ch.id, size: 'A5', style: styles.page },
      ce(View, { style: styles.headerFixed, fixed: true },
        ce(Text, null, book.title),
        ce(Text, { render: ({ pageNumber }: { pageNumber: number }) => String(pageNumber) }),
      ),
      ce(Text, { style: styles.chapterTitle }, ch.title),
      ch.subtitle ? ce(Text, { style: styles.chapterSubtitle }, ch.subtitle) : null,
      ...bodyContent,
      ce(View, { style: styles.footerFixed, fixed: true },
        ce(Text, null, ch.title.slice(0, 40)),
        ce(Text, {
          render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
            `${pageNumber} / ${totalPages}`,
        }),
      ),
    );
  });

  const spoilerPage = truncatedAt
    ? ce(Page, { key: 'spoiler', size: 'A5', style: styles.page },
        ce(View, { style: styles.spoilerBox },
          ce(Text, { style: styles.spoilerText },
            `Conteúdo cortado em ${truncatedAt}.\nConclua as aulas relacionadas para liberar o restante.`,
          ),
        ),
      )
    : null;

  return ce(Document,
    { title: book.title, author: book.author ?? '', language: book.language ?? 'pt' },
    coverPage,
    ...chapterPages,
    ...(spoilerPage ? [spoilerPage] : []),
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
  ): Promise<Buffer> {
    return renderToBuffer(buildDocument(book, chapters, coverImageBuffer, truncatedAt));
  }
}

export const bookPdfGenerator = new BookPdfGenerator();
