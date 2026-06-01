import { resolve } from 'node:path';
import type {
  Book, BookChapter, BookBlock, BookReference, BookGlossaryTerm, BookCredits,
  BookFootnote, CitationStyle,
} from '@/domain/library/types';
import { CitationFormatter } from '@/domain/library/entities/CitationFormatter';
import { BookEntity } from '@/domain/library/entities/Book';

// Lazy-load Typst compiler — só carrega quando engine=typst
async function getCompiler() {
  const mod = await import('@myriaddreamin/typst-ts-node-compiler');
  return mod.NodeCompiler.create();
}

// ─── Markdown → Typst converters ─────────────────────────────────────────────

/** Escape ASCII especiais Typst pra contexto MARKUP (dentro de `[...]`).
 * Chars Unicode privados (U+E000+) NÃO são tocados. */
function escapeTypst(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/@/g, '\\@')
    .replace(/</g, '\\<')
    .replace(/>/g, '\\>')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/`/g, '\\`')
    .replace(/~/g, '\\~')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/=/g, '\\=');
}

/** Escape pra contexto STRING (dentro de `"..."`).
 * Typst string literal só aceita JSON-like: escapa `"`, `\`, newlines, tabs. */
function escapeTypstString(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
}

const FOOTNOTE_MARKER_RE = /\\*\[\\*\^(\d+)\\*\]/g;
const MARKDOWN_DECORATION_RE = /(\*\*\*|\*\*|\*|__|_|~~|`)/g;

export interface TypstTocEntry {
  level: number;
  title: string;
  page: number;
}

/** Remove markers [^N] do texto (mantém só o conteúdo). */
function stripFootnoteMarkers(text: string): string {
  return text.replace(FOOTNOTE_MARKER_RE, '');
}

function plainTocTitle(text: string): string {
  return stripFootnoteMarkers(text)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(MARKDOWN_DECORATION_RE, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tocMetadata(level: number, title: string): string {
  return `#context metadata((toc: true, level: ${level}, title: "${escapeTypstString(title)}", page: counter(page).get().first()))`;
}

/** Coleta footnotes citadas no texto, ordem aparição. */
function collectFootnotes(text: string, footnotes?: BookFootnote[]): BookFootnote[] {
  if (!footnotes || footnotes.length === 0) return [];
  const seen = new Set<number>();
  const out: BookFootnote[] = [];
  const re = new RegExp(FOOTNOTE_MARKER_RE.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const num = Number(m[1]);
    if (seen.has(num)) continue;
    const fn = footnotes.find(f => f.number === num);
    if (fn) { seen.add(num); out.push(fn); }
  }
  return out;
}

// Tokens em Unicode private use area — sobrevivem ao escape de ASCII
const TOK_OPEN = '';
const TOK_CLOSE = '';

function markdownInlineToTypst(raw: string, footnotes?: BookFootnote[]): string {
  const tokens: { id: string; replacement: string }[] = [];
  let counter = 0;
  function reserve(replacement: string): string {
    const id = `${TOK_OPEN}${counter++}${TOK_CLOSE}`;
    tokens.push({ id, replacement });
    return id;
  }

  let content = raw;

  // Step 1: footnote markers → token #footnote[]
  if (footnotes && footnotes.length > 0) {
    content = content.replace(FOOTNOTE_MARKER_RE, (_, n) => {
      const num = Number(n);
      const fn = footnotes.find(f => f.number === num);
      if (!fn) return '';
      const fnContent = markdownInlineToTypst(fn.content, footnotes);
      return reserve(`#footnote[${fnContent}]`);
    });
  } else {
    content = content.replace(FOOTNOTE_MARKER_RE, '');
  }

  // Step 2: markdown inline → tokens Typst markup
  // Links [text](url)
  content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    const safeText = markdownInlineToTypst(text, footnotes);
    const safeUrl = escapeTypstString(url);
    return reserve(`#link("${safeUrl}")[${safeText}]`);
  });
  // Bold+italic ***text***
  content = content.replace(/\*\*\*(.+?)\*\*\*/g, (_, t) => reserve(`#strong[#emph[${markdownInlineToTypst(t, footnotes)}]]`));
  // Bold **text**
  content = content.replace(/\*\*(.+?)\*\*/g, (_, t) => reserve(`#strong[${markdownInlineToTypst(t, footnotes)}]`));
  // Strikethrough ~~text~~
  content = content.replace(/~~(.+?)~~/g, (_, t) => reserve(`#strike[${markdownInlineToTypst(t, footnotes)}]`));
  // Italic *text* ou _text_
  content = content.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, (_, t) => reserve(`#emph[${markdownInlineToTypst(t, footnotes)}]`));
  content = content.replace(/(?<!_)_([^_]+?)_(?!_)/g, (_, t) => reserve(`#emph[${markdownInlineToTypst(t, footnotes)}]`));
  // Inline code `code`
  content = content.replace(/`([^`]+)`/g, (_, t) => reserve(`#raw("${escapeTypstString(t)}")`));

  // Step 3: escape ASCII especiais (tokens Unicode privados não tocados)
  content = escapeTypst(content);

  // Step 4: restaurar tokens (Typst markup já válido)
  for (const { id, replacement } of tokens) {
    content = content.split(id).join(replacement);
  }

  return content;
}

// ─── Block converters ────────────────────────────────────────────────────────

function blockToTypst(block: BookBlock, footnotes?: BookFootnote[]): string {
  switch (block.kind) {
    case 'paragraph': {
      const refLabel = block.ref ? `#text(size: 6pt, fill: rgb("#aaa"))[\\[${block.ref}\\]] ` : '';
      const body = markdownInlineToTypst(block.content, footnotes);
      return `\n${refLabel}${body}\n`;
    }
    case 'quote': {
      const body = markdownInlineToTypst(block.content, footnotes);
      return `\n#quote(block: true)[${body}]\n`;
    }
    case 'heading': {
      // Shift +1: user h1 → Typst h2. Reserva level 1 só pro título do chapter
      // (única coisa que dispara pagebreak/estilo de chapter).
      const rawLvl = Math.min(6, Math.max(1, block.heading_level ?? 2));
      const lvl = Math.min(6, rawLvl + 1);
      const cleanText = stripFootnoteMarkers(block.content);
      const cleanContent = markdownInlineToTypst(cleanText);
      const titlePlain = plainTocTitle(block.content);
      const cited = collectFootnotes(block.content, footnotes);
      let result = `\n${'='.repeat(lvl)} ${cleanContent}\n`;
      if (titlePlain) result += `${tocMetadata(lvl, titlePlain)}\n`;
      for (const fn of cited) {
        const fnContent = markdownInlineToTypst(fn.content, footnotes);
        result += `#footnote[${fnContent}]\n`;
      }
      return result;
    }
    case 'list': {
      const lines = block.content.split('\n').filter(Boolean);
      return '\n' + lines.map(l => {
        const isOrdered = /^\s*\d+\./.test(l);
        const text = l.replace(/^(\s*)([-*+]|\d+\.)\s+/, '');
        const marker = isOrdered ? '+' : '-';
        return `${marker} ${markdownInlineToTypst(text, footnotes)}`;
      }).join('\n') + '\n';
    }
    case 'code': {
      return `\n\`\`\`\n${block.content}\n\`\`\`\n`;
    }
    case 'image_ref': {
      const [url, ...captionParts] = (block.content ?? '').split('|');
      const caption = captionParts.join('|');
      const hasExt = /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(url ?? '');
      if (!url || !hasExt) {
        return caption ? `\n#text(size: 9pt, fill: rgb("#888"))[\\[imagem: ${escapeTypst(caption)}\\]]\n` : '';
      }
      const safeCaption = caption ? escapeTypst(caption) : '';
      const captionPart = safeCaption ? `, caption: [${safeCaption}]` : '';
      const safeUrl = escapeTypstString(url);
      return `\n#figure(image("${safeUrl}", width: 80%)${captionPart})\n`;
    }
    default:
      return `\n${escapeTypst(block.content || '')}\n`;
  }
}

// ─── Section-specific renderers ──────────────────────────────────────────────

function bibliographyToTypst(refs: BookReference[], style: CitationStyle): string {
  const sorted = [...refs].sort((a, b) =>
    (a.authors[0]?.surname ?? '').localeCompare(b.authors[0]?.surname ?? ''),
  );
  return sorted.map(r => {
    const formatted = CitationFormatter.format(r, style);
    return `\n${markdownInlineToTypst(formatted)}\n`;
  }).join('\n');
}

function glossaryToTypst(terms: BookGlossaryTerm[]): string {
  const sorted = [...terms].sort((a, b) => a.term.localeCompare(b.term, 'pt-BR', { sensitivity: 'base' }));
  return sorted.map(t =>
    `\n*${escapeTypst(t.term)}* \\\n#h(1em)${markdownInlineToTypst(t.definition)}\n`,
  ).join('\n');
}

function creditsToTypst(credits: BookCredits): string {
  const parts: string[] = [];
  if (credits.title) parts.push(`#align(center)[#text(size: 18pt, weight: "bold")[${escapeTypst(credits.title)}]]`);
  if (credits.subtitle) parts.push(`#align(center)[#text(size: 13pt, fill: rgb("#555"))[${escapeTypst(credits.subtitle)}]]`);
  if (credits.authors?.length) parts.push(`#align(center)[Autor${credits.authors.length > 1 ? 'es' : ''}: ${credits.authors.map(escapeTypst).join(', ')}]`);
  if (credits.translators?.length) parts.push(`#align(center)[Tradutor${credits.translators.length > 1 ? 'es' : ''}: ${credits.translators.map(escapeTypst).join(', ')}]`);
  if (credits.illustrators?.length) parts.push(`#align(center)[Ilustrador${credits.illustrators.length > 1 ? 'es' : ''}: ${credits.illustrators.map(escapeTypst).join(', ')}]`);
  if (credits.editors?.length) parts.push(`#align(center)[Editor${credits.editors.length > 1 ? 'es' : ''}: ${credits.editors.map(escapeTypst).join(', ')}]`);
  const pubLine = [credits.publisher, credits.city, credits.edition ? `${credits.edition} ed.` : '', credits.year].filter(Boolean).join(' · ');
  if (pubLine) parts.push(`#align(center)[#text(size: 10pt, fill: rgb("#666"))[${escapeTypst(pubLine)}]]`);
  if (credits.isbn) parts.push(`#align(center)[#text(size: 9pt, fill: rgb("#777"))[ISBN: ${escapeTypst(credits.isbn)}]]`);
  if (credits.copyright) parts.push(`#align(center)[#text(size: 9pt, fill: rgb("#777"))[${escapeTypst(credits.copyright)}]]`);
  if (credits.license) parts.push(`#align(center)[#text(size: 9pt, fill: rgb("#777"))[Licença: ${escapeTypst(credits.license)}]]`);
  if (credits.notes) parts.push(`\n#text(size: 10pt, fill: rgb("#666"))[${markdownInlineToTypst(credits.notes)}]`);
  return parts.join('\n\n');
}

function manualTocToTypst(entries: TypstTocEntry[]): string {
  const rows = entries.map(entry => {
    const level = Math.min(6, Math.max(1, entry.level));
    const indent = (level - 1) * 1.1;
    const size = level === 1 ? '10pt' : '9pt';
    const weight = level === 1 ? ', weight: "bold"' : '';
    const title = markdownInlineToTypst(entry.title);
    return `[ #h(${indent}em)#text(size: ${size}${weight})[${title}] ], [ #text(size: 9pt${weight})[${entry.page}] ]`;
  });

  return [
    `#table(`,
    `  columns: (1fr, auto),`,
    `  stroke: none,`,
    `  inset: (x: 0pt, y: 0.24em),`,
    `  column-gutter: 1em,`,
    `  ${rows.join(',\n  ')}`,
    `)`,
  ].join('\n');
}

function extractTocEntries(raw: unknown): TypstTocEntry[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map(item => {
      const value = (item as { value?: unknown })?.value as Record<string, unknown> | undefined;
      if (!value || value.toc !== true) return null;
      const level = typeof value.level === 'number' ? value.level : null;
      const title = typeof value.title === 'string' ? value.title : null;
      const page = typeof value.page === 'number' ? value.page : null;
      if (!level || !title || !page) return null;
      return { level, title, page };
    })
    .filter((entry): entry is TypstTocEntry => entry !== null);
}

// ─── Main document builder ───────────────────────────────────────────────────

interface BuildArgs {
  book: Book;
  chapters: BookChapter[];
  coverImage?: { path: string; ext: string };
  backCoverImage?: { path: string; ext: string };
  truncatedAt?: string;
  /** Pula renderização da capa (chunk intermediário/final). */
  skipCover?: boolean;
  /** Pula sumário/TOC (chunk não-primeiro). */
  skipToc?: boolean;
  /** Pula contra-capa (chunk não-último). */
  skipBackCover?: boolean;
  /** Página inicial pra continuar paginação cross-chunk. Default 1. */
  startPageNumber?: number;
  /** Sumário manual pré-calculado entre chunks. */
  tocEntries?: TypstTocEntry[];
}

function normalizeTypstLocale(language?: string): { lang: string; region?: string } {
  const [rawLang, rawRegion] = (language ?? 'pt').replace('_', '-').split('-');
  const lang = (rawLang || 'pt').toLowerCase();
  const region = rawRegion ? rawRegion.toUpperCase() : undefined;
  return /^[a-z]{2,3}$/.test(lang) ? { lang, region } : { lang: 'pt' };
}

function imageExtensionFromBuffer(buffer: Buffer): 'jpg' | 'png' | 'webp' | 'gif' {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
    return 'png';
  }
  if (buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'jpg';
  }
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
    return 'webp';
  }
  if (buffer.length >= 6 && ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'))) {
    return 'gif';
  }
  return 'png';
}

function buildTypstSource({ book, chapters, coverImage, backCoverImage, truncatedAt, skipCover, skipToc, skipBackCover, startPageNumber, tocEntries }: BuildArgs): string {
  const sorted = BookEntity.sortChapters(chapters);
  // Title e author são usados em DOIS contextos: string literal (set document)
  // e markup `[...]`. Geramos as duas versões.
  const docTitleStr = escapeTypstString(book.title);
  const docTitleMd = escapeTypst(book.title);
  const docAuthorStr = book.author ? escapeTypstString(book.author) : '';
  const docAuthorMd = book.author ? escapeTypst(book.author) : '';
  const locale = normalizeTypstLocale(book.language);

  const out: string[] = [];

  // Document metadata + page setup base
  out.push(`#set document(title: "${docTitleStr}"${docAuthorStr ? `, author: "${docAuthorStr}"` : ''})`);
  out.push(`#set text(lang: "${locale.lang}"${locale.region ? `, region: "${locale.region}"` : ''}, font: ("New Computer Modern", "Liberation Serif", "Times New Roman"), size: 11pt)`);
  out.push(`#set par(justify: true, leading: 0.7em)`);
  out.push(`#set page(paper: "a5", margin: (top: 2cm, bottom: 2cm, left: 2cm, right: 2cm))`);
  out.push('');

  // 1. Cover full-bleed (não conta paginação, sem header/footer) — SÓ no primeiro chunk
  if (!skipCover) {
    if (coverImage) {
      out.push(`#page(margin: 0pt, footer: none, header: none, numbering: none)[#image("${coverImage.path}", width: 100%, height: 100%, fit: "cover")]`);
    } else {
      out.push(`#page(footer: none, header: none, numbering: none)[#align(center + horizon)[#text(size: 24pt, weight: "bold")[${docTitleMd}]${docAuthorMd ? `\\\n#text(size: 14pt)[${docAuthorMd}]` : ''}]]`);
    }
    // Blank page após capa (sem numeração)
    out.push(`#page(footer: none, header: none, numbering: none)[]`);
  }

  // Style level-1 heading (capítulo body/back) — SEM pagebreak automático.
  // Pagebreak emitido manual antes do #heading() pra cada chapter.
  // Subtítulos internos usam level 2+ → NÃO recebem este estilo nem pagebreak.
  out.push(`#show heading.where(level: 1): it => {`);
  out.push(`  v(2em)`);
  out.push(`  align(center)[#text(size: 18pt, weight: "bold")[#it.body]]`);
  out.push(`  v(2.5em)`);
  out.push(`}`);

  // 3. Pre-process: separa em credits / preface+body+back
  // Ordem livro literário: cover → credits → SUMÁRIO → [prefácio + body + back com numeração]
  // Prefácio conta na paginação e aparece no sumário (padrão livro comercial).
  const credits = sorted.filter(c => (c.kind ?? 'chapter') === 'credits');
  const numberedSections = sorted.filter(c => (c.kind ?? 'chapter') !== 'credits');

  function emitFrontChapter(ch: BookChapter) {
    const k = ch.kind ?? 'chapter';
    // Strip markers do título/subtítulo. Footnotes referenciadas viram #footnote[] APÓS a tag visível.
    const titleClean = markdownInlineToTypst(stripFootnoteMarkers(ch.title), ch.footnotes);
    const titleFns = collectFootnotes(ch.title, ch.footnotes);
    const subtitleClean = ch.subtitle ? markdownInlineToTypst(stripFootnoteMarkers(ch.subtitle), ch.footnotes) : '';
    const subtitleFns = ch.subtitle ? collectFootnotes(ch.subtitle, ch.footnotes) : [];

    out.push(`#pagebreak(weak: true, to: "odd")`);
    out.push(`#set page(header: none, footer: none, numbering: none)`);
    out.push(`#v(2em)`);
    out.push(`#align(center)[#text(size: 18pt, weight: "bold")[${titleClean}]]`);
    // Footnotes do título — emitidas APÓS heading pra não vazarem em TOC (TOC só pega heading body)
    for (const fn of titleFns) {
      const fnContent = markdownInlineToTypst(fn.content, ch.footnotes);
      out.push(`#footnote[${fnContent}]`);
    }
    if (subtitleClean) {
      out.push(`#v(0.4em)`);
      out.push(`#align(center)[#text(size: 12pt, fill: rgb("#666"), style: "italic")[${subtitleClean}]]`);
      for (const fn of subtitleFns) {
        const fnContent = markdownInlineToTypst(fn.content, ch.footnotes);
        out.push(`#footnote[${fnContent}]`);
      }
    }
    out.push(`#v(2.5em)`);
    // Render content
    if (k === 'credits' && ch.credits) {
      out.push(creditsToTypst(ch.credits));
    } else {
      for (const block of ch.blocks) {
        out.push(blockToTypst(block, ch.footnotes));
      }
    }
  }

  // Render credits primeiro (sem numeração, fora TOC)
  for (const ch of credits) emitFrontChapter(ch);

  // Sumário entre credits e numbered sections — SÓ no primeiro chunk
  if (!skipToc) {
    out.push(`#pagebreak(weak: true, to: "odd")`);
    out.push(`#set page(header: none, footer: none, numbering: none)`);
    out.push(`#v(2em)`);
    out.push(`#align(center)[#text(size: 18pt, weight: "bold")[Sumário]]`);
    out.push(`#v(2em)`);
    out.push(tocEntries?.length ? manualTocToTypst(tocEntries) : `#outline(title: none, indent: 1em, depth: 6)`);
  }

  // Prefácio + body + back: numeração ativa, todos via #heading() → entram no TOC
  let numberingStarted = false;
  let resetPageCounterBeforeNextHeading = false;
  for (const ch of numberedSections) {
    const kind = ch.kind ?? 'chapter';
    // Title/subtitle: strip markers pra TOC. Footnotes emitidas após heading na página.
    const titleClean = markdownInlineToTypst(stripFootnoteMarkers(ch.title), ch.footnotes);
    const titleFns = collectFootnotes(ch.title, ch.footnotes);
    const subtitleClean = ch.subtitle ? markdownInlineToTypst(stripFootnoteMarkers(ch.subtitle), ch.footnotes) : '';
    const subtitleFns = ch.subtitle ? collectFootnotes(ch.subtitle, ch.footnotes) : [];

    if (!numberingStarted) {
      out.push(`#pagebreak(weak: true, to: "odd")`);
      out.push(`#set page(`);
      out.push(`  header: context {`);
      out.push(`    let n = counter(page).get().first()`);
      out.push(`    if calc.odd(n) {`);
      out.push(`      align(right)[#text(size: 8pt, fill: rgb("#888"), style: "italic")[${docTitleMd}]]`);
      out.push(`    } else {`);
      out.push(`      align(left)[#text(size: 8pt, fill: rgb("#888"), style: "italic")[${docTitleMd}]]`);
      out.push(`    }`);
      out.push(`  },`);
      out.push(`  footer: context {`);
      out.push(`    let n = counter(page).get().first()`);
      out.push(`    if calc.odd(n) {`);
      out.push(`      align(right)[#text(size: 9pt)[#n]]`);
      out.push(`    } else {`);
      out.push(`      align(left)[#text(size: 9pt)[#n]]`);
      out.push(`    }`);
      out.push(`  },`);
      out.push(`  numbering: "1",`);
      out.push(`)`);
      numberingStarted = true;
      resetPageCounterBeforeNextHeading = true;
    }

    // Pagebreak manual ANTES do heading do chapter — só primeira página do
    // capítulo vai pra ímpar. Subtítulos internos NÃO geram pagebreak.
    const startNumber = Math.max(1, startPageNumber ?? 1);
    if (resetPageCounterBeforeNextHeading) {
      // O primeiro conteúdo numerado já foi levado para página ímpar acima.
      // Reinicia o contador DEPOIS dos pré-textuais e pagebreaks.
    } else if (numberedSections.length === 1 && startNumber % 2 === 0) {
      // Em geração por chunk, Typst não conhece a paridade física do PDF final.
      // Uma página numerada em branco mantém o próximo capítulo em página ímpar.
      out.push(`#pagebreak()`);
    } else {
      out.push(`#pagebreak(weak: true, to: "odd")`);
    }
    if (resetPageCounterBeforeNextHeading) {
      out.push(`#counter(page).update(${startNumber})`);
      resetPageCounterBeforeNextHeading = false;
    }
    const headingLevel = Math.min(6, Math.max(1, ch.title_level ?? 1));
    out.push(`#heading(level: ${headingLevel})[${titleClean}]`);
    out.push(`${tocMetadata(headingLevel, plainTocTitle(ch.title))}`);
    // Footnotes do título — emitidas após heading. TOC só pega body limpo do heading.
    for (const fn of titleFns) {
      const fnContent = markdownInlineToTypst(fn.content, ch.footnotes);
      out.push(`#footnote[${fnContent}]`);
    }
    if (subtitleClean) {
      out.push(`#align(center)[#text(size: 12pt, fill: rgb("#666"), style: "italic")[${subtitleClean}]]`);
      for (const fn of subtitleFns) {
        const fnContent = markdownInlineToTypst(fn.content, ch.footnotes);
        out.push(`#footnote[${fnContent}]`);
      }
      out.push(`#v(2em)`);
    }

    if (kind === 'bibliography' && ch.references?.length) {
      out.push(bibliographyToTypst(ch.references, ch.citation_style ?? 'abnt'));
    } else if (kind === 'glossary' && ch.glossary_terms?.length) {
      out.push(glossaryToTypst(ch.glossary_terms));
    } else if (kind === 'credits' && ch.credits) {
      out.push(creditsToTypst(ch.credits));
    } else {
      for (const block of ch.blocks) {
        out.push(blockToTypst(block, ch.footnotes));
      }
      // Footnotes citados saem inline. Órfãos vão em "Notas" no fim do capítulo.
      if (ch.footnotes?.length) {
        const allCited = new Set<number>();
        for (const b of ch.blocks) {
          if (!b.content) continue;
          const re = new RegExp(FOOTNOTE_MARKER_RE.source, 'g');
          let m: RegExpExecArray | null;
          while ((m = re.exec(b.content)) !== null) allCited.add(Number(m[1]));
        }
        const orphans = ch.footnotes.filter(f => !allCited.has(f.number));
        if (orphans.length > 0) {
          out.push(`\n#v(2em)\n#line(length: 100%, stroke: 0.5pt + rgb("#ccc"))\n#text(size: 9pt, weight: "bold")[Notas]\n`);
          for (const fn of orphans) {
            out.push(`\n#text(size: 8pt)[#super[${fn.number}] ${markdownInlineToTypst(fn.content)}]`);
          }
        }
      }
    }
  }

  // 4. Spoiler page se cortado
  if (truncatedAt) {
    out.push(`#pagebreak(to: "odd")`);
    out.push(`#align(center + horizon)[#box(stroke: 1pt + rgb("#ffca28"), inset: 1em)[#text(size: 11pt, fill: rgb("#666"))[Conteúdo cortado em ${escapeTypst(truncatedAt)}.\\\nConclua as aulas relacionadas para liberar o restante.]]]`);
  }

  // 5. Back cover full-bleed na última página — SÓ no último chunk
  if (backCoverImage && !skipBackCover) {
    out.push(`#pagebreak()`);
    out.push(`#pagebreak(to: "even")`);
    out.push(`#page(margin: 0pt, footer: none, header: none)[#image("${backCoverImage.path}", width: 100%, height: 100%, fit: "cover")]`);
  }

  return out.join('\n');
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface TypstGenerateOptions {
  /** Pula capa (chunks 1+). */
  skipCover?: boolean;
  /** Pula sumário (chunks 1+). */
  skipToc?: boolean;
  /** Pula contra-capa (chunks 0..N-1). */
  skipBackCover?: boolean;
  /** Página inicial pra continuar numeração entre chunks. */
  startPageNumber?: number;
  /** Sumário manual pré-calculado entre chunks. */
  tocEntries?: TypstTocEntry[];
}

export interface TypstGenerateResult {
  buffer: Buffer;
  tocEntries: TypstTocEntry[];
}

export class BookPdfGeneratorTypst {
  async generate(
    book: Book,
    chapters: BookChapter[],
    coverImageBuffer?: Buffer,
    truncatedAt?: string,
    backCoverImageBuffer?: Buffer,
    options?: TypstGenerateOptions,
  ): Promise<Buffer> {
    const result = await this.generateWithMetadata(
      book,
      chapters,
      coverImageBuffer,
      truncatedAt,
      backCoverImageBuffer,
      options,
    );
    return result.buffer;
  }

  async generateWithMetadata(
    book: Book,
    chapters: BookChapter[],
    coverImageBuffer?: Buffer,
    truncatedAt?: string,
    backCoverImageBuffer?: Buffer,
    options?: TypstGenerateOptions,
  ): Promise<TypstGenerateResult> {
    const compiler = await getCompiler();

    const cwd = process.cwd();
    const coverExt = coverImageBuffer ? imageExtensionFromBuffer(coverImageBuffer) : undefined;
    const backCoverExt = backCoverImageBuffer ? imageExtensionFromBuffer(backCoverImageBuffer) : undefined;
    const coverImage = coverImageBuffer && coverExt
      ? { path: `cover.${coverExt}`, ext: coverExt }
      : undefined;
    const backCoverImage = backCoverImageBuffer && backCoverExt
      ? { path: `back-cover.${backCoverExt}`, ext: backCoverExt }
      : undefined;

    if (coverImageBuffer && coverImage) compiler.mapShadow(resolve(cwd, coverImage.path), coverImageBuffer);
    if (backCoverImageBuffer && backCoverImage) compiler.mapShadow(resolve(cwd, backCoverImage.path), backCoverImageBuffer);

    const source = buildTypstSource({
      book,
      chapters,
      coverImage,
      backCoverImage,
      truncatedAt,
      skipCover: options?.skipCover,
      skipToc: options?.skipToc,
      skipBackCover: options?.skipBackCover,
      startPageNumber: options?.startPageNumber,
      tocEntries: options?.tocEntries,
    });

    const result = compiler.compile({ mainFileContent: source });
    if (!result.result) {
      const errInfo = result.takeDiagnostics?.();
      const diags = errInfo ? compiler.fetchDiagnostics?.(errInfo) : [];
      console.error('[Typst] Compile failed. Diagnostics:', JSON.stringify(diags, null, 2));
      console.error('[Typst] Source length:', source.length);
      // Log em chunks de 2000 chars pra ver no Vercel logs onde está o problema
      const CHUNK = 2000;
      for (let i = 0; i < source.length; i += CHUNK) {
        console.error(`[Typst] Source[${i}..${i + CHUNK}]:`, source.slice(i, i + CHUNK));
      }
      throw new Error(`Typst compile error: ${JSON.stringify(diags)}`);
    }

    const pdfBuffer = compiler.pdf(result.result);
    const tocEntries = extractTocEntries(compiler.query(result.result, { selector: 'metadata' }));
    return { buffer: Buffer.from(pdfBuffer), tocEntries };
  }
}

export const bookPdfGeneratorTypst = new BookPdfGeneratorTypst();
