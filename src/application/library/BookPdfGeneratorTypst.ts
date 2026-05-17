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

/** Remove markers [^N] do texto (mantém só o conteúdo). */
function stripFootnoteMarkers(text: string): string {
  return text.replace(FOOTNOTE_MARKER_RE, '');
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
      const lvl = Math.min(6, Math.max(1, block.heading_level ?? 2));
      // Strip markers do body. Footnotes emitidas APÓS heading pra outline.entry
      // não re-renderizar #footnote[] na página do TOC.
      const cleanText = stripFootnoteMarkers(block.content);
      const cleanContent = markdownInlineToTypst(cleanText);
      const cited = collectFootnotes(block.content, footnotes);
      let result = `\n${'='.repeat(lvl)} ${cleanContent}\n`;
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
}

function buildTypstSource({ book, chapters, coverImage, backCoverImage, truncatedAt, skipCover, skipToc, skipBackCover, startPageNumber }: BuildArgs): string {
  const sorted = BookEntity.sortChapters(chapters);
  // Title e author são usados em DOIS contextos: string literal (set document)
  // e markup `[...]`. Geramos as duas versões.
  const docTitleStr = escapeTypstString(book.title);
  const docTitleMd = escapeTypst(book.title);
  const docAuthorStr = book.author ? escapeTypstString(book.author) : '';
  const docAuthorMd = book.author ? escapeTypst(book.author) : '';
  const lang = book.language ?? 'pt';

  const out: string[] = [];

  // Document metadata + page setup base
  out.push(`#set document(title: "${docTitleStr}"${docAuthorStr ? `, author: "${docAuthorStr}"` : ''})`);
  out.push(`#set text(lang: "${lang}", font: ("New Computer Modern", "Liberation Serif", "Times New Roman"), size: 11pt)`);
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

  // Show rule pra heading lvl 1 = capítulos body/back matter.
  // Front matter NÃO usa heading() pra ficar fora do TOC.
  out.push(`#show heading.where(level: 1): it => {`);
  out.push(`  pagebreak(weak: true, to: "odd")`);
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
    const titleClean = escapeTypst(stripFootnoteMarkers(ch.title));
    const titleFns = collectFootnotes(ch.title, ch.footnotes);
    const subtitleClean = ch.subtitle ? escapeTypst(stripFootnoteMarkers(ch.subtitle)) : '';
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
    out.push(`#outline(title: none, indent: 1em, depth: 1)`);
  }

  // Prefácio + body + back: numeração ativa, todos via #heading() → entram no TOC
  let numberingStarted = false;
  for (const ch of numberedSections) {
    const kind = ch.kind ?? 'chapter';
    // Title/subtitle: strip markers pra TOC. Footnotes emitidas após heading na página.
    const titleClean = escapeTypst(stripFootnoteMarkers(ch.title));
    const titleFns = collectFootnotes(ch.title, ch.footnotes);
    const subtitleClean = ch.subtitle ? escapeTypst(stripFootnoteMarkers(ch.subtitle)) : '';
    const subtitleFns = ch.subtitle ? collectFootnotes(ch.subtitle, ch.footnotes) : [];

    if (!numberingStarted) {
      out.push(`#pagebreak(weak: true, to: "odd")`);
      out.push(`#counter(page).update(${Math.max(1, startPageNumber ?? 1)})`);
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
    }

    out.push(`#heading(level: 1)[${titleClean}]`);
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

  // 5. Back cover full-bleed na última página
  if (backCoverImage) {
    out.push(`#pagebreak()`);
    out.push(`#pagebreak(to: "even")`);
    out.push(`#page(margin: 0pt, footer: none, header: none)[#image("${backCoverImage.path}", width: 100%, height: 100%, fit: "cover")]`);
  }

  return out.join('\n');
}

// ─── Public API ──────────────────────────────────────────────────────────────

export class BookPdfGeneratorTypst {
  async generate(
    book: Book,
    chapters: BookChapter[],
    coverImageBuffer?: Buffer,
    truncatedAt?: string,
    backCoverImageBuffer?: Buffer,
  ): Promise<Buffer> {
    const compiler = await getCompiler();

    const cwd = process.cwd();
    const coverImage = coverImageBuffer
      ? { path: '/cover.jpg', ext: 'jpg' }
      : undefined;
    const backCoverImage = backCoverImageBuffer
      ? { path: '/back-cover.jpg', ext: 'jpg' }
      : undefined;

    if (coverImageBuffer) compiler.mapShadow(resolve(cwd, 'cover.jpg'), coverImageBuffer);
    if (backCoverImageBuffer) compiler.mapShadow(resolve(cwd, 'back-cover.jpg'), backCoverImageBuffer);

    const source = buildTypstSource({
      book,
      chapters,
      coverImage,
      backCoverImage,
      truncatedAt,
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
    return Buffer.from(pdfBuffer);
  }
}

export const bookPdfGeneratorTypst = new BookPdfGeneratorTypst();
