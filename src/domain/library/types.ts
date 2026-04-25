/**
 * Library / Apostila — modelo de dados.
 *
 * Numeração canônica estilo Bíblia: `capítulo:parágrafo` (ex: `1:7`).
 * Apenas blocos do tipo `paragraph` e `quote` recebem número de parágrafo (versículo).
 * Headings, listas, código e imagens não numeram.
 */

export type BookSpoilerMode = 'open' | 'progressive';

export type BookBlockKind = 'heading' | 'paragraph' | 'quote' | 'list' | 'code' | 'image_ref';

export interface BookBlock {
  /** ID interno único dentro do capítulo. */
  id: string;
  kind: BookBlockKind;
  /** Markdown bruto do bloco. */
  content: string;
  /**
   * Referência canônica `capítulo:parágrafo`. Vazia em blocos não-numerados (heading/list/code/image).
   * Calculada na hora de salvar — a partir da posição do bloco no capítulo.
   */
  ref?: string;
  /** Para headings: nível 1-6 (h1–h6). */
  heading_level?: number;
}

export interface BookChapter {
  id: string;
  book_id: string;
  /** Ordem 1-based dentro do livro. */
  order: number;
  title: string;
  /** Subtítulo opcional do capítulo. */
  subtitle?: string;
  blocks: BookBlock[];
  created_at: string;
  updated_at?: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  author?: string;
  /** Idioma ISO (pt, en, es, etc). */
  language?: string;
  /** Descrição curta em markdown — exibida no catálogo. */
  description?: string;
  cover_url?: string;
  back_cover_url?: string;
  category_ids: string[];
  tags: string[];
  isbn?: string;
  edition?: string;
  /** Ano de publicação. */
  year?: number;
  is_published: boolean;
  /**
   * Default 'open' — livro pode ser lido/baixado integral por qualquer aluno autenticado.
   * 'progressive' — corte de spoiler vale por aula que referencia o livro com `apply_spoiler=true`.
   */
  spoiler_mode: BookSpoilerMode;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface BookCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  order: number;
  created_at: string;
}

/** Referência canônica usada por outras features (ex: aula). */
export interface BookCitation {
  book_id: string;
  /** Ex: '1:7'. Vazio = início do livro. */
  start_ref?: string;
  /** Ex: '3:18'. Vazio = fim do livro. */
  end_ref?: string;
}
