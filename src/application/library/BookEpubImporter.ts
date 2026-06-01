import JSZip from 'jszip';
import type { BookBlock, BookChapter, BookCredits, BookFootnote, BookSectionKind } from '@/domain/library/types';
import { BlockMarkdownEntity } from '@/domain/library/entities/BlockMarkdown';

type ManifestItem = {
  id: string;
  href: string;
  mediaType: string;
  properties: string[];
};

export interface ImportedBookChapterDraft {
  order: number;
  title: string;
  title_level?: number;
  subtitle?: string;
  kind: BookSectionKind;
  blocks: BookBlock[];
  footnotes?: BookFootnote[];
  credits?: BookCredits;
}

export interface ImportedBookImageDraft {
  file: File;
  href: string;
  mediaType: string;
}

export interface ImportedBookDraft {
  title: string;
  subtitle?: string;
  author?: string;
  language: string;
  description?: string;
  isbn?: string;
  year?: number;
  coverImage?: ImportedBookImageDraft;
  backCoverImage?: ImportedBookImageDraft;
  chapters: ImportedBookChapterDraft[];
  warnings: string[];
}

export interface EpubImportOptions {
  maxChapters?: number;
}

const XHTML_NS = 'http://www.w3.org/1999/xhtml';
const OPF_NS = 'http://www.idpf.org/2007/opf';
const DC_NS = 'http://purl.org/dc/elements/1.1/';

function parseXml(source: string, label: string): Document {
  if (typeof DOMParser === 'undefined') {
    throw new Error('Importação EPUB precisa rodar no navegador.');
  }
  const doc = new DOMParser().parseFromString(source, 'application/xml');
  const parserError = doc.getElementsByTagName('parsererror')[0];
  if (parserError) throw new Error(`${label} inválido.`);
  return doc;
}

function textOf(parent: Document | Element, localName: string, namespace = DC_NS): string | undefined {
  const fromNs = parent.getElementsByTagNameNS(namespace, localName)[0];
  const fromPlain = parent.getElementsByTagName(localName)[0];
  return (fromNs ?? fromPlain)?.textContent?.trim() || undefined;
}

function attr(el: Element | null | undefined, name: string): string | undefined {
  return el?.getAttribute(name)?.trim() || undefined;
}

function joinZipPath(basePath: string, href: string): string {
  if (!basePath) return href.replace(/^\/+/, '');
  const parts = `${basePath}/${href}`.split('/');
  const out: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
}

function dirname(path: string): string {
  const idx = path.lastIndexOf('/');
  return idx >= 0 ? path.slice(0, idx) : '';
}

function basenameWithoutExt(path: string): string {
  const name = path.split('/').pop() ?? path;
  return name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function escapeMarkdown(value: string): string {
  return value.replace(/([\\`*_{}\[\]()#+\-.!>])/g, '\\$1');
}

function fragmentId(href?: string): string | null {
  if (!href) return null;
  const hashIndex = href.indexOf('#');
  if (hashIndex < 0) return null;
  return decodeURIComponent(href.slice(hashIndex + 1)).trim() || null;
}

function stripFragment(path: string): string {
  return path.split('#')[0];
}

type XhtmlConversionContext = {
  footnoteById: Map<string, string>;
  usedFootnotes: Map<string, number>;
};

function reserveFootnoteNumber(ctx: XhtmlConversionContext, id: string): number {
  const existing = ctx.usedFootnotes.get(id);
  if (existing) return existing;
  const next = ctx.usedFootnotes.size + 1;
  ctx.usedFootnotes.set(id, next);
  return next;
}

function inlineMarkdown(node: Node, ctx: XhtmlConversionContext): string {
  if (node.nodeType === Node.TEXT_NODE) return normalizeWhitespace(node.textContent ?? '');
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const el = node as Element;
  const tag = el.localName.toLowerCase();
  if (tag === 'script' || tag === 'style') return '';
  if (tag === 'br') return '\n';
  if (tag === 'img') {
    const src = attr(el, 'src');
    if (!src || !/^https?:\/\//i.test(src)) return '';
    const alt = attr(el, 'alt') ?? 'imagem';
    return `![${escapeMarkdown(alt)}](${src})`;
  }

  if (tag === 'a') {
    const href = attr(el, 'href');
    const footnoteId = fragmentId(href);
    if (footnoteId && ctx.footnoteById.has(footnoteId)) {
      return `[^${reserveFootnoteNumber(ctx, footnoteId)}]`;
    }
    const childText = Array.from(el.childNodes).map(node => inlineMarkdown(node, ctx)).filter(Boolean).join(' ');
    const text = normalizeWhitespace(childText);
    return href && text ? `[${text}](${href})` : text;
  }

  const childText = Array.from(el.childNodes).map(node => inlineMarkdown(node, ctx)).filter(Boolean).join(' ');
  const text = normalizeWhitespace(childText);
  if (!text) return '';
  if (tag === 'strong' || tag === 'b') return `**${text}**`;
  if (tag === 'em' || tag === 'i') return `_${text}_`;
  if (tag === 'sup') return text;
  return text;
}

function elementText(el: Element, ctx: XhtmlConversionContext): string {
  return normalizeWhitespace(Array.from(el.childNodes).map(node => inlineMarkdown(node, ctx)).filter(Boolean).join(' '));
}

function listMarkdown(el: Element, ctx: XhtmlConversionContext): string {
  const ordered = el.localName.toLowerCase() === 'ol';
  return Array.from(el.children)
    .filter(child => child.localName.toLowerCase() === 'li')
    .map((li, index) => `${ordered ? `${index + 1}.` : '-'} ${elementText(li, ctx)}`)
    .filter(line => line.trim().length > 2)
    .join('\n');
}

function escapeTableCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n+/g, '<br>');
}

function tableMarkdown(el: Element, ctx: XhtmlConversionContext): string {
  const rows = Array.from(el.getElementsByTagName('tr')).map(row => (
    Array.from(row.children)
      .filter(cell => ['td', 'th'].includes(cell.localName.toLowerCase()))
      .map(cell => escapeTableCell(elementText(cell, ctx)))
  )).filter(row => row.some(cell => cell.length > 0));

  if (rows.length === 0) return '';
  const width = Math.max(...rows.map(row => row.length));
  const normalizedRows = rows.map(row => Array.from({ length: width }, (_, i) => row[i] ?? ''));
  const firstRowIsHeader = Array.from(el.getElementsByTagName('tr')[0]?.children ?? [])
    .some(cell => cell.localName.toLowerCase() === 'th');
  const header = firstRowIsHeader
    ? normalizedRows[0]
    : normalizedRows[0].map((_, index) => `Coluna ${index + 1}`);
  const body = firstRowIsHeader ? normalizedRows.slice(1) : normalizedRows;

  return [
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...body.map(row => `| ${row.join(' | ')} |`),
  ].join('\n');
}

function elementToMarkdown(el: Element, ctx: XhtmlConversionContext): string[] {
  const tag = el.localName.toLowerCase();
  if (tag === 'script' || tag === 'style' || tag === 'nav') return [];

  if (/^h[1-6]$/.test(tag)) {
    const level = Number(tag.slice(1));
    const text = elementText(el, ctx);
    return text ? [`${'#'.repeat(level)} ${text}`] : [];
  }

  if (tag === 'p') {
    const text = elementText(el, ctx);
    return text ? [text] : [];
  }

  if (tag === 'blockquote') {
    const lines = Array.from(el.children).flatMap(child => elementToMarkdown(child, ctx));
    const fallback = lines.length > 0 ? lines : [elementText(el, ctx)];
    return fallback.filter(Boolean).map(line => line.split('\n').map(part => `> ${part}`).join('\n'));
  }

  if (tag === 'ul' || tag === 'ol') {
    const text = listMarkdown(el, ctx);
    return text ? [text] : [];
  }

  if (tag === 'table') {
    const text = tableMarkdown(el, ctx);
    return text ? [text] : [];
  }

  if (tag === 'hr') {
    return ['---'];
  }

  if (tag === 'pre') {
    const text = el.textContent?.trim();
    return text ? [`\`\`\`\n${text}\n\`\`\``] : [];
  }

  if (tag === 'img') {
    const src = attr(el, 'src');
    if (!src || !/^https?:\/\//i.test(src)) return [];
    const alt = attr(el, 'alt') ?? 'imagem';
    return [`![${escapeMarkdown(alt)}](${src})`];
  }

  return Array.from(el.children).flatMap(child => elementToMarkdown(child, ctx));
}

function isFootnoteElement(el: Element): boolean {
  const semanticType = [
    attr(el, 'epub:type'),
    attr(el, 'type'),
    attr(el, 'role'),
    attr(el, 'class'),
  ].filter(Boolean).join(' ').toLowerCase();
  return /\b(doc-)?(footnote|endnote|note)\b/.test(semanticType);
}

function removeBacklinks(el: Element): void {
  Array.from(el.getElementsByTagName('a')).forEach(anchor => {
    const href = attr(anchor, 'href') ?? '';
    const rel = attr(anchor, 'rel') ?? '';
    if (href.startsWith('#') || /\bbacklink\b/i.test(rel)) anchor.remove();
  });
}

function collectFootnoteMap(body: Element): Map<string, string> {
  const emptyCtx: XhtmlConversionContext = { footnoteById: new Map(), usedFootnotes: new Map() };
  const map = new Map<string, string>();
  const candidates = Array.from(body.getElementsByTagName('*')).filter(isFootnoteElement);
  for (const el of candidates) {
    const id = attr(el, 'id');
    if (!id) continue;
    const clone = el.cloneNode(true) as Element;
    removeBacklinks(clone);
    const markdown = Array.from(clone.children).flatMap(child => elementToMarkdown(child, emptyCtx)).join('\n\n');
    const content = markdown || elementText(clone, emptyCtx);
    if (content) map.set(id, content);
  }
  candidates.forEach(el => el.remove());
  return map;
}

function parseXhtmlToChapterContent(source: string): { blocks: BookBlock[]; footnotes: BookFootnote[] } {
  const doc = parseXml(source, 'Documento XHTML do EPUB');
  const body = doc.getElementsByTagNameNS(XHTML_NS, 'body')[0] ?? doc.getElementsByTagName('body')[0];
  if (!body) return { blocks: [], footnotes: [] };

  const ctx: XhtmlConversionContext = {
    footnoteById: collectFootnoteMap(body),
    usedFootnotes: new Map(),
  };
  const markdown = Array.from(body.children).flatMap(child => elementToMarkdown(child, ctx)).join('\n\n');
  const blocks = BlockMarkdownEntity.parse(markdown);
  const footnotes = Array.from(ctx.usedFootnotes.entries()).map(([sourceId, number]) => {
    const marker = `[^${number}]`;
    const anchorBlock = blocks.find(block => block.content.includes(marker));
    return {
      id: `fn_import_${number}_${sourceId.replace(/[^a-zA-Z0-9_-]/g, '') || 'note'}`,
      number,
      anchor_block_id: anchorBlock?.id ?? '',
      content: ctx.footnoteById.get(sourceId) ?? '',
    };
  });
  return { blocks, footnotes };
}

function inferChapterKind(title: string, order: number): BookSectionKind {
  const normalized = title.toLocaleLowerCase('pt-BR');
  if (order === 1 && /^(cr[ée]ditos|ficha|folha de rosto|copyright)/.test(normalized)) return 'credits';
  if (/^pref[áa]cio/.test(normalized)) return 'preface';
  if (/^introdu[cç][aã]o/.test(normalized)) return 'introduction';
  if (/^bibliografia|refer[êe]ncias/.test(normalized)) return 'bibliography';
  if (/^gloss[áa]rio/.test(normalized)) return 'glossary';
  if (/^ap[êe]ndice|^anexo/.test(normalized)) return 'appendix';
  if (/^notas/.test(normalized)) return 'notes';
  if (/^sobre/.test(normalized)) return 'about';
  return 'chapter';
}

type NavigationTitle = {
  title: string;
  level: number;
};

function firstHeadingTitle(blocks: BookBlock[], fallback: string): NavigationTitle {
  const firstHeading = blocks.find(block => block.kind === 'heading' && block.content.trim());
  return {
    title: firstHeading?.content.trim() || fallback,
    level: firstHeading?.heading_level ?? 1,
  };
}

function comparableTitle(value: string): string {
  return normalizeWhitespace(value)
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function removeDuplicatedLeadingTitle(blocks: BookBlock[], title: string): BookBlock[] {
  const [first, ...rest] = blocks;
  if (!first || first.kind !== 'heading') return blocks;
  return comparableTitle(first.content) === comparableTitle(title) ? rest : blocks;
}

function hasSemanticType(doc: Document, type: string): boolean {
  return Array.from(doc.getElementsByTagName('*')).some(el => (
    attr(el, 'epub:type')?.split(/\s+/).includes(type)
  ));
}

function textByClass(doc: Document, className: string): string | undefined {
  const el = Array.from(doc.getElementsByTagName('*')).find(node => (
    (attr(node, 'class') ?? '').split(/\s+/).includes(className)
  ));
  return normalizeWhitespace(el?.textContent ?? '') || undefined;
}

function parseTitlePageCredits(source: string, fallback: Pick<ImportedBookDraft, 'title' | 'author' | 'year'>): BookCredits | null {
  const doc = parseXml(source, 'Página de rosto XHTML do EPUB');
  if (!hasSemanticType(doc, 'titlepage')) return null;

  const title = textByClass(doc, 'title') ?? textOf(doc, 'title', XHTML_NS) ?? fallback.title;
  const author = textByClass(doc, 'author') ?? fallback.author;
  const publisher = textByClass(doc, 'publisher');

  return {
    title,
    authors: author ? [author] : undefined,
    publisher,
    year: fallback.year,
  };
}

function parseManifest(opf: Document): Map<string, ManifestItem> {
  const items = Array.from(opf.getElementsByTagNameNS(OPF_NS, 'item'));
  const plainItems = items.length > 0 ? items : Array.from(opf.getElementsByTagName('item'));
  const entries: Array<[string, ManifestItem]> = [];
  for (const item of plainItems) {
    const id = attr(item, 'id') ?? '';
    const properties = (attr(item, 'properties') ?? '').split(/\s+/).filter(Boolean);
    const manifestItem: ManifestItem = {
      id,
      href: attr(item, 'href') ?? '',
      mediaType: attr(item, 'media-type') ?? '',
      properties,
    };
    if (id && manifestItem.href) entries.push([id, manifestItem]);
  }
  return new Map(entries);
}

function parseSpineIds(opf: Document): string[] {
  const itemrefs = Array.from(opf.getElementsByTagNameNS(OPF_NS, 'itemref'));
  const plainItemrefs = itemrefs.length > 0 ? itemrefs : Array.from(opf.getElementsByTagName('itemref'));
  return plainItemrefs
    .filter(item => attr(item, 'linear') !== 'no')
    .map(item => attr(item, 'idref'))
    .filter((id): id is string => !!id);
}

function fileNameFromPath(path: string, fallback: string): string {
  return path.split('/').pop()?.trim() || fallback;
}

function findCoverItem(opf: Document, manifest: Map<string, ManifestItem>): ManifestItem | undefined {
  const metas = Array.from(opf.getElementsByTagNameNS(OPF_NS, 'meta'));
  const plainMetas = metas.length > 0 ? metas : Array.from(opf.getElementsByTagName('meta'));
  const coverMeta = plainMetas.find(meta => attr(meta, 'name')?.toLowerCase() === 'cover');
  const coverId = attr(coverMeta, 'content');
  if (coverId && manifest.has(coverId)) return manifest.get(coverId);

  return Array.from(manifest.values()).find(item => item.properties.includes('cover-image'))
    ?? Array.from(manifest.values()).find(item => (
      item.mediaType.startsWith('image/')
      && /(^|[/_-])cover([._-]|$)|capa|front/i.test(item.href)
      && !/back|contra|verso|rear/i.test(item.href)
    ));
}

function findBackCoverItem(manifest: Map<string, ManifestItem>, coverItem?: ManifestItem): ManifestItem | undefined {
  return Array.from(manifest.values()).find(item => (
    item.id !== coverItem?.id
    && item.mediaType.startsWith('image/')
    && /back[-_ ]?cover|contracapa|contra[-_ ]?capa|quarta|verso|rear/i.test(`${item.id} ${item.href}`)
  ));
}

async function readImageDraft(
  zip: JSZip,
  basePath: string,
  item: ManifestItem | undefined,
): Promise<ImportedBookImageDraft | undefined> {
  if (!item || !item.mediaType.startsWith('image/')) return undefined;
  const path = joinZipPath(basePath, item.href);
  const bytes = await zip.file(path)?.async('arraybuffer');
  if (!bytes) return undefined;
  const name = fileNameFromPath(path, item.id || 'cover');
  return {
    file: new File([bytes], name, { type: item.mediaType }),
    href: path,
    mediaType: item.mediaType,
  };
}

async function parseNavigationTitles(
  zip: JSZip,
  manifest: Map<string, ManifestItem>,
  basePath: string,
): Promise<Map<string, NavigationTitle>> {
  const titles = new Map<string, NavigationTitle>();
  const navItem = Array.from(manifest.values()).find(item => item.properties.includes('nav'));
  if (navItem) {
    const navPath = joinZipPath(basePath, navItem.href);
    const source = await zip.file(navPath)?.async('string');
    if (source) {
      const doc = parseXml(source, 'nav.xhtml');
      const navBase = dirname(navPath);
      const walkList = (list: Element, level: number) => {
        Array.from(list.children)
          .filter(child => child.localName.toLowerCase() === 'li')
          .forEach(li => {
            const anchor = Array.from(li.children).find(child => child.localName.toLowerCase() === 'a');
            const href = attr(anchor, 'href');
            const text = normalizeWhitespace(anchor?.textContent ?? '');
            if (href && text) titles.set(stripFragment(joinZipPath(navBase, href)), { title: text, level });
            Array.from(li.children)
              .filter(child => child.localName.toLowerCase() === 'ol')
              .forEach(child => walkList(child, Math.min(6, level + 1)));
          });
      };
      Array.from(doc.getElementsByTagName('nav'))
        .filter(nav => (attr(nav, 'epub:type') ?? '').split(/\s+/).includes('toc'))
        .flatMap(nav => Array.from(nav.children).filter(child => child.localName.toLowerCase() === 'ol'))
        .forEach(list => walkList(list, 1));
    }
  }

  const ncxItem = Array.from(manifest.values()).find(item => item.mediaType === 'application/x-dtbncx+xml');
  if (ncxItem) {
    const ncxPath = joinZipPath(basePath, ncxItem.href);
    const source = await zip.file(ncxPath)?.async('string');
    if (source) {
      const doc = parseXml(source, 'toc.ncx');
      const ncxBase = dirname(ncxPath);
      const walkPoint = (point: Element, level: number) => {
        const src = attr(point.getElementsByTagName('content')[0], 'src');
        const text = normalizeWhitespace(point.getElementsByTagName('text')[0]?.textContent ?? '');
        if (!src || !text) return;
        if (!titles.has(stripFragment(joinZipPath(ncxBase, src)))) {
          titles.set(stripFragment(joinZipPath(ncxBase, src)), { title: text, level });
        }
        Array.from(point.children)
          .filter(child => child.localName.toLowerCase() === 'navpoint')
          .forEach(child => walkPoint(child, Math.min(6, level + 1)));
      };
      Array.from(doc.getElementsByTagName('navMap')[0]?.children ?? [])
        .filter(child => child.localName.toLowerCase() === 'navpoint')
        .forEach(point => walkPoint(point, 1));
    }
  }

  return titles;
}

export class BookEpubImporter {
  async parse(file: File, options: EpubImportOptions = {}): Promise<ImportedBookDraft> {
    if (!file.name.toLowerCase().endsWith('.epub')) {
      throw new Error('Selecione um arquivo .epub.');
    }

    const zip = await JSZip.loadAsync(await this.readFile(file));
    const container = await zip.file('META-INF/container.xml')?.async('string');
    if (!container) throw new Error('EPUB sem META-INF/container.xml.');

    const containerDoc = parseXml(container, 'container.xml');
    const rootfile = containerDoc.getElementsByTagName('rootfile')[0];
    const opfPath = attr(rootfile, 'full-path');
    if (!opfPath) throw new Error('EPUB sem package document OPF.');

    const opfSource = await zip.file(opfPath)?.async('string');
    if (!opfSource) throw new Error(`Arquivo OPF não encontrado: ${opfPath}.`);

    const opf = parseXml(opfSource, 'content.opf');
    const basePath = dirname(opfPath);
    const manifest = parseManifest(opf);
    const spineIds = parseSpineIds(opf);
    const navigationTitles = await parseNavigationTitles(zip, manifest, basePath);
    const warnings: string[] = [];

    const title = textOf(opf, 'title') ?? basenameWithoutExt(file.name) ?? 'Livro importado';
    const language = textOf(opf, 'language') ?? 'pt';
    const identifiers = Array.from(opf.getElementsByTagNameNS(DC_NS, 'identifier'));
    const plainIdentifiers = identifiers.length > 0 ? identifiers : Array.from(opf.getElementsByTagName('identifier'));
    const isbn = plainIdentifiers.map(el => el.textContent?.trim() ?? '').find(value => /97[89][0-9Xx-]{10,}/.test(value));
    const dateText = textOf(opf, 'date');
    const year = dateText?.match(/\b(\d{4})\b/) ? Number(dateText.match(/\b(\d{4})\b/)![1]) : undefined;
    const coverItem = findCoverItem(opf, manifest);
    const backCoverItem = findBackCoverItem(manifest, coverItem);
    const [coverImage, backCoverImage] = await Promise.all([
      readImageDraft(zip, basePath, coverItem),
      readImageDraft(zip, basePath, backCoverItem),
    ]);

    const chapters: ImportedBookChapterDraft[] = [];
    const maxChapters = options.maxChapters ?? Number.POSITIVE_INFINITY;

    for (const id of spineIds.slice(0, maxChapters)) {
      const item = manifest.get(id);
      if (!item || !/x?html/i.test(item.mediaType)) continue;
      if (item.properties.includes('nav')) continue;

      const path = joinZipPath(basePath, item.href);
      const source = await zip.file(path)?.async('string');
      if (!source) {
        warnings.push(`Item ignorado: ${path} não foi encontrado no EPUB.`);
        continue;
      }

      const credits = parseTitlePageCredits(source, { title, author: textOf(opf, 'creator'), year });
      if (credits) {
        chapters.push({
          order: chapters.length + 1,
          title: 'Créditos',
          kind: 'credits',
          blocks: [],
          credits,
        });
        continue;
      }

      const { blocks, footnotes } = parseXhtmlToChapterContent(source);
      if (blocks.length === 0) {
        warnings.push(`Seção ignorada: ${path} não gerou conteúdo textual.`);
        continue;
      }

      const order = chapters.length + 1;
      const fallbackTitle = basenameWithoutExt(path) || `Capítulo ${order}`;
      const navigationTitle = navigationTitles.get(path) ?? firstHeadingTitle(blocks, fallbackTitle);
      const chapterTitle = navigationTitle.title;
      const contentBlocks = removeDuplicatedLeadingTitle(blocks, chapterTitle);
      chapters.push({
        order,
        title: chapterTitle,
        title_level: navigationTitle.level,
        kind: inferChapterKind(chapterTitle, order),
        blocks: contentBlocks,
        footnotes: footnotes.length > 0 ? footnotes : undefined,
      });
    }

    if (spineIds.length > maxChapters) {
      warnings.push(`O EPUB tem ${spineIds.length} itens no spine; foram importados os primeiros ${maxChapters}.`);
    }
    if (chapters.length === 0) throw new Error('Nenhum capítulo textual foi encontrado no EPUB.');

    return {
      title,
      author: textOf(opf, 'creator'),
      language,
      description: textOf(opf, 'description'),
      isbn,
      year,
      coverImage,
      backCoverImage,
      chapters,
      warnings,
    };
  }

  private readFile(file: File): Promise<ArrayBuffer> {
    if (typeof file.arrayBuffer === 'function') return file.arrayBuffer();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Não foi possível ler o arquivo EPUB.'));
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) resolve(reader.result);
        else reject(new Error('Leitura do EPUB retornou um formato inesperado.'));
      };
      reader.readAsArrayBuffer(file);
    });
  }
}

export const bookEpubImporter = new BookEpubImporter();
