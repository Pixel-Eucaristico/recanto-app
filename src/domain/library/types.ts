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

/** Progresso de leitura de um usuário num livro. */
export interface BookReadingProgress {
  /** ID composto `${userId}_${bookId}`. */
  id: string;
  user_id: string;
  book_id: string;
  /** Última ordem de capítulo visível. */
  last_chapter_order: number;
  /** Última ref canônica visível (ex: '3:7'), se disponível. */
  last_ref?: string;
  /** 0-100 — percentual de capítulos lidos. */
  percent: number;
  updated_at: string;
  /** Set once on first read — nunca sobrescrito. */
  started_at?: string;
  /** Set when percent === 100. */
  completed_at?: string;
  /** Denormalizado para zero N+1 na history page. */
  book_title?: string;
  book_cover_url?: string;
  /** Counters atualizados a cada highlight/comment add/remove. */
  highlights_count?: number;
  notes_count?: number;
}

// ─── Annotations ──────────────────────────────────────────────────────────────

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

export interface BookHighlight {
  /** Firestore auto-ID — múltiplos highlights por ref (textos diferentes). */
  id: string;
  user_id: string;
  book_id: string;
  /** Ref canônica ex: '1:7'. */
  ref: string;
  /** Texto selecionado. Se ausente = highlight de parágrafo inteiro (legado). */
  selected_text?: string;
  color: HighlightColor;
  created_at: string;
}

export interface BookComment {
  /** Firestore auto-ID — múltiplos comentários por ref permitidos. */
  id: string;
  user_id: string;
  book_id: string;
  ref: string;
  /** Conteúdo da nota (max 1000 chars, enforced no service layer). */
  text: string;
  created_at: string;
  updated_at?: string;
}

export type TagColor = 'yellow' | 'green' | 'blue' | 'pink';

export interface BookTag {
  /** Firestore auto-ID. */
  id: string;
  user_id: string;
  book_id: string;
  /** Capítulo onde a tag está. */
  chapter_order: number;
  /** Ref canônica do parágrafo (opcional — tag pode ser de capítulo inteiro). */
  ref?: string;
  /** Texto curto da tag (max 80 chars). */
  text: string;
  color: TagColor;
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
