/**
 * Canonical Reference (`capítulo:parágrafo` — ex `1:7`).
 *
 * Decisão: numeração lógica (estilo Bíblia) — independente de tipografia/exportação.
 * Permite citar partes do livro de forma estável em PDF, EPUB e leitor web.
 */

export interface CanonicalRef {
  chapter: number;
  /** Vazio = capítulo inteiro. */
  paragraph?: number;
}

export class CanonicalRefEntity {
  /** Parseia 'cap[:par]' → {chapter, paragraph?}. Lança em formato inválido. */
  static parse(input: string): CanonicalRef {
    const trimmed = input.trim();
    const m = trimmed.match(/^(\d+)(?::(\d+))?$/);
    if (!m) throw new Error(`Referência canônica inválida: "${input}". Use formato 'cap' ou 'cap:par'.`);
    const chapter = Number(m[1]);
    const paragraph = m[2] !== undefined ? Number(m[2]) : undefined;
    if (chapter < 1) throw new Error('Capítulo deve ser >= 1.');
    if (paragraph !== undefined && paragraph < 1) throw new Error('Parágrafo deve ser >= 1.');
    return { chapter, paragraph };
  }

  /** Tenta parsear; retorna null em vez de lançar. */
  static tryParse(input: string | undefined | null): CanonicalRef | null {
    if (!input) return null;
    try { return CanonicalRefEntity.parse(input); } catch { return null; }
  }

  /** Formata em string: '1' ou '1:7'. */
  static format(ref: CanonicalRef): string {
    return ref.paragraph !== undefined ? `${ref.chapter}:${ref.paragraph}` : `${ref.chapter}`;
  }

  /**
   * Compara duas refs.
   * - Capítulo manda primeiro.
   * - Em mesmo capítulo, parágrafo decide. Capítulo "inteiro" (sem paragraph) ordena ANTES de qualquer parágrafo do mesmo capítulo (= primeiro do capítulo).
   * @returns negativo se a < b, 0 se igual, positivo se a > b.
   */
  static compare(a: CanonicalRef, b: CanonicalRef): number {
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    const ap = a.paragraph ?? 0;
    const bp = b.paragraph ?? 0;
    return ap - bp;
  }

  /** True se `ref` está dentro do intervalo [start, end] (inclusivo). Limites vazios = sem corte. */
  static isWithinRange(ref: CanonicalRef, start: CanonicalRef | null, end: CanonicalRef | null): boolean {
    if (start && CanonicalRefEntity.compare(ref, start) < 0) return false;
    if (end && CanonicalRefEntity.compare(ref, end) > 0) return false;
    return true;
  }

  /** Pega a maior ref de uma lista (útil pra calcular freezing point do spoiler). */
  static max(refs: CanonicalRef[]): CanonicalRef | null {
    if (refs.length === 0) return null;
    return refs.reduce((acc, r) => (CanonicalRefEntity.compare(r, acc) > 0 ? r : acc));
  }

  /** Calcula refs canônicas pra todos os blocos de um capítulo. Conta apenas paragraph/quote. */
  static numberBlocks<T extends { kind: string; ref?: string }>(
    chapter: number,
    blocks: T[],
  ): T[] {
    let counter = 0;
    return blocks.map(b => {
      if (b.kind === 'paragraph' || b.kind === 'quote') {
        counter += 1;
        return { ...b, ref: `${chapter}:${counter}` };
      }
      // Headings, listas, código e imagens não numeram — ref limpa
      return { ...b, ref: undefined };
    });
  }
}
