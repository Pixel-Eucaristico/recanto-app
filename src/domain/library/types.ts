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

/**
 * Tipo semântico da seção — determina epub:type e posição no spine.
 * Front matter ordena ANTES dos capítulos; back matter DEPOIS.
 */
export type BookSectionKind =
  | 'chapter'       // body matter (padrão)
  | 'preface'       // front — Prefácio
  | 'introduction'  // front — Introdução
  | 'credits'       // front — Créditos / Folha de Rosto
  | 'appendix'      // back  — Apêndice
  | 'notes'         // back  — Notas de Estudo
  | 'glossary'      // back  — Glossário
  | 'bibliography'  // back  — Bibliografia
  | 'about';        // back  — Sobre o Projeto

export interface BookChapter {
  id: string;
  book_id: string;
  /** Ordem 1-based dentro do livro. */
  order: number;
  title: string;
  /** Subtítulo opcional do capítulo. */
  subtitle?: string;
  /** Tipo semântico da seção. Default: 'chapter'. */
  kind?: BookSectionKind;
  blocks: BookBlock[];
  /** Footnotes for this section (any kind). Rendered at section bottom. */
  footnotes?: BookFootnote[];
  /** Structured data for kind='bibliography' */
  references?: BookReference[];
  citation_style?: CitationStyle;
  /** Structured data for kind='glossary' */
  glossary_terms?: BookGlossaryTerm[];
  /** Structured data for kind='credits' */
  credits?: BookCredits;
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
  /** Set quando usuário aciona saveBookmark explícito. Atualiza-position automático NÃO mexe aqui. */
  last_bookmark_at?: string;
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
  /**
   * 1-based index da ocorrência do `selected_text` no parágrafo.
   * Ex: se "fé" aparece 3x e user selecionou a 2ª, occurrence_index=2.
   * Default 1 (primeira ocorrência) — retro-compat com highlights antigos.
   */
  occurrence_index?: number;
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

// ─── Editorial entities ────────────────────────────────────────────────────────

export type CitationStyle = 'abnt' | 'apa' | 'chicago';

export type ReferenceType = 'book' | 'article' | 'website' | 'chapter_in_book' | 'thesis';

/** Autor estruturado — sobrenome separado pra formatação ABNT correta. */
export interface BookAuthor {
  /** Nome de família (último sobrenome) — usado em UPPERCASE no ABNT. */
  surname: string;
  /** Nome próprio + nomes do meio. */
  given_name: string;
}

export interface BookReference {
  id: string;
  type: ReferenceType;
  authors: BookAuthor[];
  title: string;
  subtitle?: string;
  /** Editora (publisher comercial). */
  publisher?: string;
  /** Instituição (universidade, organização — separado de publisher). */
  institution?: string;
  city?: string;
  year?: number;
  /** Número da edição (1, 2, 3...). Numérico. */
  edition?: number;
  /** For articles: page range e.g. '45-67' */
  pages?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  url?: string;
  access_date?: string;
  doi?: string;
  isbn?: string;
}

export interface BookGlossaryTerm {
  id: string;
  /** The defined term */
  term: string;
  /** Definition in markdown */
  definition: string;
  /** IDs of related terms */
  related_terms?: string[];
}

export interface BookCredits {
  title?: string;
  subtitle?: string;
  authors?: string[];
  translators?: string[];
  illustrators?: string[];
  editors?: string[];
  edition?: string;
  publisher?: string;
  city?: string;
  year?: number;
  isbn?: string;
  copyright?: string;
  license?: string;
  /** Extra notes in markdown */
  notes?: string;
}

export interface BookFootnote {
  id: string;
  /** Sequential number within chapter, auto-assigned */
  number: number;
  /** block.id where [^N] marker appears */
  anchor_block_id: string;
  /** Footnote content in markdown */
  content: string;
}

// ─── Canonical ref (used by lesson feature) ────────────────────────────────────

/** Referência canônica usada por outras features (ex: aula). */
export interface BookCitation {
  book_id: string;
  /** Ex: '1:7'. Vazio = início do livro. */
  start_ref?: string;
  /** Ex: '3:18'. Vazio = fim do livro. */
  end_ref?: string;
}
