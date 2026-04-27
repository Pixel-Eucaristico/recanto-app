import { Book, BookChapter, BookBlock } from '@/domain/library/types';
import { CanonicalRefEntity } from '@/domain/library/entities/CanonicalRef';

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
   * Chamado antes de salvar pra garantir refs estáveis.
   */
  static numberChapter(chapter: BookChapter): BookChapter {
    return {
      ...chapter,
      blocks: CanonicalRefEntity.numberBlocks(chapter.order, chapter.blocks),
    };
  }

  /** Conta o total de parágrafos numerados num livro (útil pra ver tamanho do "verse-set"). */
  static countNumberedBlocks(chapters: BookChapter[]): number {
    return chapters.reduce((acc, ch) => acc + ch.blocks.filter(b => b.kind === 'paragraph' || b.kind === 'quote').length, 0);
  }

  /**
   * Retorna uma lista achatada de blocos do livro, em ordem (capítulo → bloco).
   * Útil pra exportação e pra slice canônico.
   */
  static flattenBlocks(chapters: BookChapter[]): Array<BookBlock & { chapter_order: number }> {
    return chapters
      .slice()
      .sort((a, b) => a.order - b.order)
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
