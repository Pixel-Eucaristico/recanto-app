/**
 * Pure transforms for EPUB 3 + PDF export.
 * No I/O — takes domain objects, returns strings/buffers.
 */

import type {
  Book, BookChapter, BookBlock, BookSectionKind, BookReference, BookGlossaryTerm,
  BookCredits, BookFootnote, CitationStyle,
} from '@/domain/library/types';
import { CitationFormatter } from '@/domain/library/entities/CitationFormatter';
import { BookEntity } from '@/domain/library/entities/Book';

const EPUB_TYPE: Record<BookSectionKind, string> = {
  chapter:      'chapter',
  preface:      'preface',
  introduction: 'introduction',
  credits:      'copyright-page',
  appendix:     'appendix',
  notes:        'endnotes',
  glossary:     'glossary',
  bibliography:  'bibliography',
  about:        'colophon',
};

/** Sort chapters: ABNT order (front → body → back). Delega para BookEntity. */
function sortSections(chapters: BookChapter[]): BookChapter[] {
  return BookEntity.sortChapters(chapters);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Converts raw markdown inline syntax to XHTML, handling escaping correctly.
 * Processes on raw text to preserve link URLs before XML-escaping text segments.
 */
function renderInline(raw: string): string {
  // Unescape markdown backslash escapes first (e.g. \« → «, \[ → [)
  const unescaped = raw.replace(/\\([^a-zA-Z0-9])/g, '$1');

  // Split on markdown links [text](url) to handle them separately
  const parts: string[] = [];
  const linkRe = /\[([^\]]*)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = linkRe.exec(unescaped)) !== null) {
    // Text segment before this link
    if (m.index > last) {
      parts.push(applyInlineStyles(escapeXml(unescaped.slice(last, m.index))));
    }
    // Link: escape text and url separately
    const linkText = escapeXml(m[1]);
    const linkHref = escapeXml(m[2]);
    parts.push(`<a href="${linkHref}">${applyInlineStyles(linkText)}</a>`);
    last = m.index + m[0].length;
  }
  // Remaining text after last link
  if (last < unescaped.length) {
    parts.push(applyInlineStyles(escapeXml(unescaped.slice(last))));
  }

  return parts.join('');
}

/** Apply bold/italic/code to already XML-escaped text. */
function applyInlineStyles(escaped: string): string {
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

/** Replace [^N] markers with proper EPUB 3 footnote anchors (Kindle/Apple Books popup compatible). */
function renderFootnoteMarkers(text: string, footnotes?: BookFootnote[]): string {
  if (!footnotes || footnotes.length === 0) return text;
  return text.replace(/\[\^(\d+)\]/g, (_, n) => {
    const num = Number(n);
    return `<a href="#fn${num}" id="fnref${num}" epub:type="noteref" role="doc-noteref" class="fn-marker"><sup>${num}</sup></a>`;
  });
}

function renderBlock(block: BookBlock, chapterOrder: number, footnotes?: BookFootnote[]): string {
  const ref = block.ref ? `<span class="ref" epub:type="noteref">${block.ref}</span>` : '';
  const id = block.ref
    ? ` id="c${chapterOrder}_p${block.ref.split(':')[1] ?? ''}"` : ` id="b_${block.id}"`;

  switch (block.kind) {
    case 'paragraph':
      return `<p${id}>${ref}${renderFootnoteMarkers(renderInline(block.content), footnotes)}</p>`;

    case 'quote':
      return `<blockquote${id}>${ref}${renderFootnoteMarkers(renderInline(block.content), footnotes)}</blockquote>`;

    case 'heading': {
      const lvl = Math.min(6, Math.max(2, block.heading_level ?? 2));
      return `<h${lvl}${id}>${renderInline(block.content)}</h${lvl}>`;
    }

    case 'list': {
      const lines = block.content.split('\n').filter(Boolean);
      const isOrdered = /^\d+\./.test(lines[0] ?? '');
      const tag = isOrdered ? 'ol' : 'ul';
      const items = lines
        .map(l => l.replace(/^(\s*)([-*+]|\d+\.)\s+/, ''))
        .map(l => `<li>${renderFootnoteMarkers(renderInline(l), footnotes)}</li>`)
        .join('\n');
      return `<${tag}${id}>\n${items}\n</${tag}>`;
    }

    case 'code':
      return `<pre${id}><code>${escapeXml(block.content)}</code></pre>`;

    case 'image_ref': {
      const [url, ...captionParts] = (block.content ?? '').split('|');
      const caption = captionParts.join('|');
      const figcaption = caption ? `\n<figcaption>${escapeXml(caption)}</figcaption>` : '';
      return `<figure${id}><img src="${escapeXml(url)}" alt="${escapeXml(caption)}"/>${figcaption}\n</figure>`;
    }

    default:
      return `<p${id}>${renderInline(block.content)}</p>`;
  }
}

// ─── Section-specific renderers ────────────────────────────────────────────

function renderBibliography(refs: BookReference[], style: CitationStyle): string {
  const sorted = [...refs].sort((a, b) =>
    (a.authors[0]?.surname ?? '').localeCompare(b.authors[0]?.surname ?? ''),
  );
  return `    <ol class="bibliography">
${sorted.map(r => `      <li id="ref-${r.id}">${renderInline(CitationFormatter.format(r, style))}</li>`).join('\n')}
    </ol>`;
}

function renderGlossary(terms: BookGlossaryTerm[]): string {
  const sorted = [...terms].sort((a, b) => a.term.localeCompare(b.term, 'pt-BR', { sensitivity: 'base' }));
  return `    <dl class="glossary">
${sorted.map(t => `      <dt id="${t.id}">${escapeXml(t.term)}</dt>
      <dd>${renderInline(t.definition)}</dd>`).join('\n')}
    </dl>`;
}

function renderCredits(credits: BookCredits): string {
  const parts: string[] = [];
  if (credits.title) parts.push(`<p class="credits-title">${escapeXml(credits.title)}</p>`);
  if (credits.subtitle) parts.push(`<p class="credits-subtitle">${escapeXml(credits.subtitle)}</p>`);
  if (credits.authors?.length) parts.push(`<p class="credits-people"><strong>Autor${credits.authors.length > 1 ? 'es' : ''}:</strong> ${credits.authors.map(escapeXml).join(', ')}</p>`);
  if (credits.translators?.length) parts.push(`<p class="credits-people"><strong>Tradutor${credits.translators.length > 1 ? 'es' : ''}:</strong> ${credits.translators.map(escapeXml).join(', ')}</p>`);
  if (credits.illustrators?.length) parts.push(`<p class="credits-people"><strong>Ilustrador${credits.illustrators.length > 1 ? 'es' : ''}:</strong> ${credits.illustrators.map(escapeXml).join(', ')}</p>`);
  if (credits.editors?.length) parts.push(`<p class="credits-people"><strong>Editor${credits.editors.length > 1 ? 'es' : ''}:</strong> ${credits.editors.map(escapeXml).join(', ')}</p>`);
  if (credits.publisher || credits.city || credits.year || credits.edition) {
    const pubParts = [credits.publisher, credits.city, credits.edition ? `${credits.edition} ed.` : '', credits.year].filter(Boolean);
    parts.push(`<p class="credits-publisher">${pubParts.map(p => escapeXml(String(p))).join(' · ')}</p>`);
  }
  if (credits.isbn) parts.push(`<p class="credits-isbn">ISBN: ${escapeXml(credits.isbn)}</p>`);
  if (credits.copyright) parts.push(`<p class="credits-copyright">${escapeXml(credits.copyright)}</p>`);
  if (credits.license) parts.push(`<p class="credits-license"><strong>Licença:</strong> ${escapeXml(credits.license)}</p>`);
  if (credits.notes) parts.push(`<div class="credits-notes">${renderInline(credits.notes)}</div>`);
  return `    <div class="credits-block">\n      ${parts.join('\n      ')}\n    </div>`;
}

export class BookExportEntity {
  static buildChapterXhtml(chapter: BookChapter, bookTitle: string): string {
    const kind = chapter.kind ?? 'chapter';
    const epubType = EPUB_TYPE[kind];
    const titleLevel = Math.min(6, Math.max(1, chapter.title_level ?? 1));
    const titleTag = `h${titleLevel}`;
    const subtitle = chapter.subtitle
      ? `\n    <p class="subtitle">${escapeXml(chapter.subtitle)}</p>` : '';

    let body: string;
    let footnotesBlock = '';

    if (kind === 'bibliography' && chapter.references && chapter.references.length > 0) {
      body = renderBibliography(chapter.references, chapter.citation_style ?? 'abnt');
    } else if (kind === 'glossary' && chapter.glossary_terms && chapter.glossary_terms.length > 0) {
      body = renderGlossary(chapter.glossary_terms);
    } else if (kind === 'credits' && chapter.credits) {
      body = renderCredits(chapter.credits);
    } else {
      body = chapter.blocks.map(b => renderBlock(b, chapter.order, chapter.footnotes)).join('\n');
      // Footnotes section: cada footnote é um <aside> SEPARADO com epub:type="footnote".
      // Kindle e Apple Books detectam aside individual + epub:type=footnote como popup.
      // Wrapper <section> agrupa todos no fim do capítulo.
      if (chapter.footnotes && chapter.footnotes.length > 0) {
        const items = chapter.footnotes
          .sort((a, b) => a.number - b.number)
          .map(f =>
            `      <aside id="fn${f.number}" epub:type="footnote" role="doc-footnote" class="footnote-item">` +
            `<p><span class="fn-num">${f.number}.</span> ${renderInline(f.content)} ` +
            `<a href="#fnref${f.number}" epub:type="backlink" role="doc-backlink" class="fn-back" aria-label="Voltar ao texto">↩</a></p>` +
            `</aside>`
          )
          .join('\n');
        footnotesBlock = `\n    <section epub:type="footnotes" role="doc-endnotes" class="footnotes" aria-label="Notas de rodapé">
      <hr/>
${items}
    </section>`;
      }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="pt">
<head>
  <meta charset="UTF-8"/>
  <title>${escapeXml(chapter.title)} — ${escapeXml(bookTitle)}</title>
  <link rel="stylesheet" type="text/css" href="../Styles/book.css"/>
</head>
<body>
  <section epub:type="${epubType}" id="section-${chapter.order}">
    <${titleTag} class="chapter-title">${escapeXml(chapter.title)}</${titleTag}>${subtitle}
    ${body}${footnotesBlock}
  </section>
</body>
</html>`;
  }

  static buildCoverXhtml(book: Book): string {
    const img = book.cover_url
      ? `<figure id="cover-image">\n    <img src="../Images/cover.jpg" alt="Capa de ${escapeXml(book.title)}"/>\n  </figure>`
      : `<p class="no-cover">${escapeXml(book.title)}</p>`;
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="pt">
<head>
  <meta charset="UTF-8"/>
  <title>Capa — ${escapeXml(book.title)}</title>
  <link rel="stylesheet" type="text/css" href="../Styles/book.css"/>
</head>
<body epub:type="cover">
  ${img}
</body>
</html>`;
  }

  static buildTitlePageXhtml(book: Book): string {
    const author = book.author ? `<p class="author">${escapeXml(book.author)}</p>` : '';
    const subtitle = book.subtitle ? `<p class="subtitle">${escapeXml(book.subtitle)}</p>` : '';
    const edition = book.edition ? `<p class="edition">${escapeXml(book.edition)}</p>` : '';
    const year = book.year ? `<p class="year">${book.year}</p>` : '';
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="pt">
<head>
  <meta charset="UTF-8"/>
  <title>${escapeXml(book.title)}</title>
  <link rel="stylesheet" type="text/css" href="../Styles/book.css"/>
</head>
<body epub:type="frontmatter">
  <section epub:type="titlepage" id="titlepage">
    <h1 class="book-title">${escapeXml(book.title)}</h1>
    ${subtitle}
    ${author}
    ${edition}
    ${year}
  </section>
</body>
</html>`;
  }

  static buildTocXhtml(book: Book, chapters: BookChapter[]): string {
    const sorted = sortSections(chapters);
    const navItems = sorted
      .map(ch => {
        const file = `section-${String(ch.order).padStart(2, '0')}.xhtml`;
        return `      <li><a href="Text/${file}">${escapeXml(ch.title)}</a></li>`;
      })
      .join('\n');

    const firstChapter = sorted.find(c => (c.kind ?? 'chapter') === 'chapter') ?? sorted[0];
    const firstFile = firstChapter
      ? `Text/section-${String(firstChapter.order).padStart(2, '0')}.xhtml` : '#';

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="pt">
<head>
  <meta charset="UTF-8"/>
  <title>Índice — ${escapeXml(book.title)}</title>
  <link rel="stylesheet" type="text/css" href="Styles/book.css"/>
</head>
<body epub:type="frontmatter">
  <nav epub:type="toc" id="toc">
    <h1>Índice</h1>
    <ol>
${navItems}
    </ol>
  </nav>
  <nav epub:type="landmarks" hidden="">
    <ol>
      <li><a href="${firstFile}" epub:type="bodymatter">Início</a></li>
      <li><a href="toc.xhtml" epub:type="toc">Índice</a></li>
    </ol>
  </nav>
</body>
</html>`;
  }

  static buildTocNcx(book: Book, chapters: BookChapter[], bookId: string): string {
    const sorted = sortSections(chapters);
    const navPoints = sorted
      .map((ch, i) => {
        const file = `Text/section-${String(ch.order).padStart(2, '0')}.xhtml`;
        return `  <navPoint id="navPoint-${i + 1}" playOrder="${i + 1}">
    <navLabel><text>${escapeXml(ch.title)}</text></navLabel>
    <content src="${file}"/>
  </navPoint>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
<head>
  <meta name="dtb:uid" content="${bookId}"/>
  <meta name="dtb:depth" content="1"/>
  <meta name="dtb:totalPageCount" content="0"/>
  <meta name="dtb:maxPageNumber" content="0"/>
</head>
<docTitle><text>${escapeXml(book.title)}</text></docTitle>
<navMap>
${navPoints}
</navMap>
</ncx>`;
  }

  static buildContentOpf(book: Book, chapters: BookChapter[], bookId: string, hasCover: boolean): string {
    const lang = book.language ?? 'pt';
    const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const sorted = sortSections(chapters);

    const coverManifest = hasCover
      ? `\n    <item id="cover-image" href="Images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>
    <item id="cover" href="Text/cover.xhtml" media-type="application/xhtml+xml" properties="svg"/>`
      : '';

    const chapterManifest = sorted
      .map(ch => {
        const file = `section-${String(ch.order).padStart(2, '0')}.xhtml`;
        return `    <item id="section-${ch.order}" href="Text/${file}" media-type="application/xhtml+xml"/>`;
      })
      .join('\n');

    const coverSpine = hasCover ? '\n    <itemref idref="cover" linear="no"/>' : '';
    const chapterSpine = sorted
      .map(ch => `    <itemref idref="section-${ch.order}"/>`)
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" xml:lang="${lang}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">${bookId}</dc:identifier>
    <dc:title>${escapeXml(book.title)}</dc:title>
    ${book.author ? `<dc:creator>${escapeXml(book.author)}</dc:creator>` : ''}
    <dc:language>${lang}</dc:language>
    ${book.isbn ? `<dc:identifier id="isbn">urn:isbn:${escapeXml(book.isbn)}</dc:identifier>` : ''}
    <meta property="dcterms:modified">${now}</meta>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="nav" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css" href="Styles/book.css" media-type="text/css"/>
    <item id="titlepage" href="Text/titlepage.xhtml" media-type="application/xhtml+xml"/>
    ${coverManifest}
${chapterManifest}
  </manifest>
  <spine toc="ncx">
    <itemref idref="titlepage" linear="no"/>
    ${coverSpine}
${chapterSpine}
  </spine>
</package>`;
  }

  static buildEpubCss(): string {
    return `/* Book CSS — day / sepia / night */
body {
  background: #fff;
  color: #222;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1em;
  line-height: 1.7;
  margin: 1em 2em;
}
h1.book-title { font-size: 2em; margin-bottom: 0.2em; }
h1.chapter-title { font-size: 1.6em; margin-bottom: 0.3em; }
h2 { font-size: 1.3em; }
h3 { font-size: 1.1em; }
p { margin: 0.6em 0; text-indent: 1.2em; }
p:first-of-type { text-indent: 0; }
blockquote {
  margin: 1em 2em;
  padding-left: 0.8em;
  border-left: 3px solid #ccc;
  color: #555;
  font-style: italic;
}
pre { background: #f4f4f4; padding: 0.8em; border-radius: 4px; overflow-x: auto; }
code { font-family: "Courier New", monospace; font-size: 0.9em; }
pre code { background: none; }
figure { text-align: center; margin: 1.2em 0; }
figure img { max-width: 100%; height: auto; }
figcaption { font-size: 0.85em; color: #777; margin-top: 0.3em; }
ul, ol { padding-left: 1.8em; }
li { margin: 0.3em 0; }
.ref { font-size: 0.65em; color: #888; margin-right: 0.4em; vertical-align: super; }
.author { font-size: 1.2em; margin-top: 0.5em; }
.subtitle { font-size: 1.1em; color: #555; }
.edition, .year { font-size: 0.9em; color: #888; }

/* Sepia */
.sepia body, body.sepia {
  background: #f4ecd8;
  color: #5b4636;
}

/* Night */
@media (prefers-color-scheme: dark) {
  body {
    background: #1a1a1a;
    color: #d4d4d4;
  }
  blockquote { border-left-color: #555; color: #aaa; }
  pre { background: #2a2a2a; }
  .ref { color: #666; }
}
.night body, body.night {
  background: #1a1a1a;
  color: #d4d4d4;
}

/* Bibliography */
.bibliography { padding-left: 1.5em; }
.bibliography li { margin-bottom: 0.6em; line-height: 1.6; text-indent: -1.5em; padding-left: 1.5em; }

/* Glossary */
.glossary { margin: 1em 0; }
.glossary dt { font-weight: bold; margin-top: 0.8em; color: #444; }
.glossary dd { margin-left: 1.2em; margin-bottom: 0.6em; }

/* Credits */
.credits-block { text-align: center; margin: 2em 0; }
.credits-title { font-size: 1.6em; font-weight: bold; margin-bottom: 0.4em; }
.credits-subtitle { font-size: 1.1em; color: #555; margin-bottom: 1em; }
.credits-people { margin: 0.4em 0; }
.credits-publisher { font-size: 0.9em; color: #666; margin-top: 1em; }
.credits-isbn, .credits-copyright, .credits-license { font-size: 0.85em; color: #777; margin: 0.3em 0; }

/* Footnotes — Kindle/Apple Books popup compatible */
.footnotes { font-size: 0.85em; margin-top: 2em; color: #555; }
.footnote-item { margin-bottom: 0.6em; }
.footnote-item .fn-num { font-weight: bold; color: #1d4ed8; margin-right: 0.3em; }
.fn-marker { text-decoration: none; color: #1d4ed8; vertical-align: super; font-size: 0.75em; }
.fn-marker sup { line-height: 0; }
.fn-back { text-decoration: none; margin-left: 0.4em; color: #888; font-size: 1.1em; }
.footnote-ref a { text-decoration: none; }`;
  }

  static bookSlug(book: Book): string {
    return slugify(book.title) || book.id;
  }
}
