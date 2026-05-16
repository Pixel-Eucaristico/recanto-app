import { Book, BookChapter, BookBlock, BookFootnote, BookSectionKind } from '@/domain/library/types';
import { CanonicalRefEntity } from '@/domain/library/entities/CanonicalRef';

/**
 * Ordem global das seções: front → body → back.
 * Segue ABNT NBR 14724 + 6029:
 *  - Pré-textuais: folha de rosto → prefácio
 *  - Textuais: introdução → capítulos
 *  - Pós-textuais: bibliografia → glossário → apêndice → notas → sobre
 */
const SECTION_GROUP_ORDER: Record<BookSectionKind, number> = {
  // Pré-textuais
  credits:      0,
  preface:      1,
  // Textuais (introdução faz parte do corpo per ABNT)
  introduction: 2,
  chapter:      3,
  // Pós-textuais (ordem ABNT)
  bibliography: 4,
  glossary:     5,
  appendix:     6,
  notes:        7,
  about:        8,
};

/** Pré-textual: cover/folha de rosto/prefácio. Sem paginação visível. */
export const FRONT_MATTER_KINDS = new Set<BookSectionKind>(['credits', 'preface']);
/** Textual: introdução + capítulos. Paginação Arabic visível. */
export const BODY_MATTER_KINDS = new Set<BookSectionKind>(['introduction', 'chapter']);
/** Pós-textual: bibliografia/glossário/apêndice/notas/sobre. Paginação continua. */
export const BACK_MATTER_KINDS = new Set<BookSectionKind>(['bibliography', 'glossary', 'appendix', 'notes', 'about']);

/** Kinds que NÃO devem ter numeração de capítulo (são pré/pós-textuais únicos ou agrupados). */
const NON_CHAPTER_KINDS = new Set<BookSectionKind>([
  'credits', 'preface', 'introduction', 'glossary', 'bibliography', 'about',
]);

export class BookEntity {
  static validate(book: Book): string[] {
    const errors: string[] = [];
    if (!book.title || book.title.trim().length === 0) errors.push('Título do livro vazio.');
    if (book.year !== undefined && (book.year < 0 || book.year > 9999)) errors.push('Ano inválido.');
    if (book.isbn && !/^[0-9Xx-]{10,17}$/.test(book.isbn.trim())) errors.push('ISBN com formato inválido.');
    if (book.spoiler_mode !== 'open' && book.spoiler_mode !== 'progressive') errors.push('spoiler_mode deve ser "open" ou "progressive".');
    return errors;
  }

  static validateChapter(chapter: BookChapter): string[] {
    const errors: string[] = [];
    if (!chapter.title || chapter.title.trim().length === 0) errors.push('Capítulo precisa de título.');
    if (chapter.order < 1) errors.push('Ordem do capítulo deve ser >= 1.');
    if (!Array.isArray(chapter.blocks)) errors.push('Capítulo precisa ter blocks (array).');
    return errors;
  }

  /**
   * Aplica numeração canônica em todos os blocos de um capítulo (idempotente).
   * Renumera também footnotes baseado na ordem em que `[^N]` aparece nos blocks.
   * Chamado antes de salvar pra garantir refs estáveis.
   */
  /**
   * @param bodyChapterNumber Position among body chapters (1-based). Default: chapter.order.
   *   Pra body matter, refs ficam `${bodyChapterNumber}:${paragraphIdx}`.
   *   Pré/pós-textuais ficam sem ref.
   */
  static numberChapter(chapter: BookChapter, bodyChapterNumber?: number): BookChapter {
    const kind = chapter.kind ?? 'chapter';
    // Apenas kind='chapter' recebe ref canônica.
    if (kind !== 'chapter') {
      const blocksWithoutRef = chapter.blocks.map(b => {
        const { ref: _ref, ...rest } = b;
        return rest;
      });
      const { blocks, footnotes } = BookEntity.renumberFootnotes(blocksWithoutRef, chapter.footnotes);
      return { ...chapter, blocks, footnotes };
    }
    const num = bodyChapterNumber ?? chapter.order;
    const numberedBlocks = CanonicalRefEntity.numberBlocks(num, chapter.blocks);
    const { blocks, footnotes } = BookEntity.renumberFootnotes(numberedBlocks, chapter.footnotes);
    return { ...chapter, blocks, footnotes };
  }

  /**
   * Renumera footnotes pela ordem em que `[^N]` aparece nos blocos.
   * Atualiza `block.content` (substitui markers antigos pelos novos)
   * e `footnote.number` em sequência 1..N.
   * Idempotente: se já está em ordem, não muda nada.
   */
  static renumberFootnotes(
    blocks: BookBlock[],
    footnotes?: BookFootnote[],
  ): { blocks: BookBlock[]; footnotes: BookFootnote[] } {
    if (!footnotes || footnotes.length === 0) return { blocks, footnotes: footnotes ?? [] };

    // 1) Varre blocks na ordem; coleta old → new mapping
    const remap = new Map<number, number>();
    let next = 1;
    const markerRegex = /\[\^(\d+)\]/g;
    for (const b of blocks) {
      const matches = b.content.matchAll(markerRegex);
      for (const m of matches) {
        const old = Number(m[1]);
        if (!remap.has(old)) {
          remap.set(old, next);
          next++;
        }
      }
    }

    // 2) Substitui markers nos blocks (placeholder primeiro pra evitar collision)
    const newBlocks = blocks.map(b => {
      let content = b.content.replace(/\[\^(\d+)\]/g, (_, n) => {
        const old = Number(n);
        const renum = remap.get(old);
        return renum ? `[^__TMP${renum}__]` : `[^${old}]`;
      });
      content = content.replace(/\[\^__TMP(\d+)__\]/g, '[^$1]');
      return { ...b, content };
    });

    // 3) Renumera o array de footnotes.
    //    Referenciadas no texto: usam remap (1..N na ordem de aparição).
    //    Órfãs (sem marker no texto): realocadas pra números acima do max do remap,
    //    evitando colisão. FootnotePanel as marca como "órfã" visualmente.
    const referenced: BookFootnote[] = [];
    const orphans: BookFootnote[] = [];
    for (const f of footnotes) {
      const renum = remap.get(f.number);
      if (renum) referenced.push({ ...f, number: renum });
      else orphans.push(f);
    }
    const orphansRenumbered = orphans.map((f, i) => ({ ...f, number: next + i }));
    const newFootnotes = [...referenced, ...orphansRenumbered].sort((a, b) => a.number - b.number);

    return { blocks: newBlocks, footnotes: newFootnotes };
  }

  /** Conta o total de parágrafos numerados num livro (útil pra ver tamanho do "verse-set"). */
  static countNumberedBlocks(chapters: BookChapter[]): number {
    return chapters.reduce((acc, ch) => acc + ch.blocks.filter(b => b.kind === 'paragraph' || b.kind === 'quote').length, 0);
  }

  /**
   * Retorna kind do capítulo (default: 'chapter').
   * Centraliza fallback pra evitar `?? 'chapter'` espalhado.
   */
  static kindOf(chapter: BookChapter): BookSectionKind {
    return chapter.kind ?? 'chapter';
  }

  /**
   * True se o kind permite múltiplos no mesmo livro (apêndice, notas, capítulos).
   * Os demais (credits, preface, intro, glossary, bibliography, about) são singletons.
   */
  static allowsMultiple(kind: BookSectionKind): boolean {
    return kind === 'chapter' || kind === 'appendix' || kind === 'notes';
  }

  /**
   * True se o kind deve receber numeração de capítulo no display (1, 2, 3...).
   * Pré/pós-textuais únicos NÃO recebem (Prefácio, Bibliografia, Glossário etc.).
   */
  static hasChapterNumber(kind: BookSectionKind): boolean {
    return !NON_CHAPTER_KINDS.has(kind);
  }

  /**
   * Ordena capítulos seguindo: grupo (front → body → back) + order dentro do grupo.
   * Usado em listagens (admin, leitor, export).
   */
  static sortChapters(chapters: BookChapter[]): BookChapter[] {
    return chapters.slice().sort((a, b) => {
      const ga = SECTION_GROUP_ORDER[BookEntity.kindOf(a)];
      const gb = SECTION_GROUP_ORDER[BookEntity.kindOf(b)];
      if (ga !== gb) return ga - gb;
      return a.order - b.order;
    });
  }

  /**
   * Normaliza `order` de capítulos pra sequencial 1..N por grupo.
   * Mantém ordem relativa dentro de cada grupo.
   * Idempotente: se já está normalizado, retorna intacto.
   */
  static normalizeChapterOrders(chapters: BookChapter[]): BookChapter[] {
    const sorted = BookEntity.sortChapters(chapters);
    const groups = new Map<BookSectionKind, BookChapter[]>();
    for (const ch of sorted) {
      const k = BookEntity.kindOf(ch);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k)!.push(ch);
    }
    const out: BookChapter[] = [];
    for (const [, group] of groups) {
      group.forEach((ch, idx) => out.push({ ...ch, order: idx + 1 }));
    }
    return out;
  }

  /**
   * Detecta problemas em capítulos existentes (pra migration).
   * Retorna array de mudanças necessárias — vazio = sem problema.
   */
  static auditChapters(chapters: BookChapter[]): Array<{ chapterId: string; reason: string }> {
    const issues: Array<{ chapterId: string; reason: string }> = [];
    const normalized = BookEntity.normalizeChapterOrders(chapters);

    // Detecta orders fora de sequência por grupo
    for (const ch of chapters) {
      const norm = normalized.find(n => n.id === ch.id);
      if (norm && norm.order !== ch.order) {
        issues.push({ chapterId: ch.id, reason: `order desatualizado (${ch.order} → ${norm.order})` });
      }
    }

    // Detecta singletons duplicados (kind único com mais de uma instância)
    const kindCounts = new Map<BookSectionKind, number>();
    for (const ch of chapters) {
      const k = BookEntity.kindOf(ch);
      kindCounts.set(k, (kindCounts.get(k) ?? 0) + 1);
    }
    for (const [k, count] of kindCounts) {
      if (!BookEntity.allowsMultiple(k) && count > 1) {
        issues.push({ chapterId: '', reason: `${k} aparece ${count}× (deveria ser único)` });
      }
    }

    // Detecta footnotes fora de ordem
    for (const ch of chapters) {
      if (!ch.footnotes || ch.footnotes.length === 0) continue;
      const renumbered = BookEntity.renumberFootnotes(ch.blocks, ch.footnotes);
      const before = ch.footnotes.map(f => f.number).join(',');
      const after = renumbered.footnotes.map(f => f.number).join(',');
      if (before !== after) {
        issues.push({ chapterId: ch.id, reason: `footnotes renumeradas (${before} → ${after})` });
      }
    }

    return issues;
  }

  /**
   * Retorna uma lista achatada de blocos do livro, em ordem (capítulo → bloco).
   * Útil pra exportação e pra slice canônico.
   */
  static flattenBlocks(chapters: BookChapter[]): Array<BookBlock & { chapter_order: number }> {
    return BookEntity.sortChapters(chapters)
      .flatMap(ch => ch.blocks.map(b => ({ ...b, chapter_order: ch.order })));
  }

  /**
   * Slice por range canônico [startRef, endRef]. Inclusivo nas duas pontas.
   * Vazio = início/fim do livro.
   * Mantém apenas blocos numerados (paragraph/quote) e headings dentro do range.
   */
  static sliceByRange(
    chapters: BookChapter[],
    startRef: string | undefined,
    endRef: string | undefined,
  ): Array<BookBlock & { chapter_order: number }> {
    const start = CanonicalRefEntity.tryParse(startRef);
    const end = CanonicalRefEntity.tryParse(endRef);
    const flat = BookEntity.flattenBlocks(chapters);

    return flat.filter(b => {
      const ref = CanonicalRefEntity.tryParse(b.ref);
      if (!ref) {
        // Heading/list/code/image — include if inside chapter range
        if (start && b.chapter_order < start.chapter) return false;
        if (end && b.chapter_order > end.chapter) return false;
        return true;
      }
      if (start && CanonicalRefEntity.compare(ref, start) < 0) return false;
      if (end && CanonicalRefEntity.compare(ref, end) > 0) return false;
      return true;
    });
  }
}
