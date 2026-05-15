# Session Plan — Book Annotations + Histórico Skoob

**Created:** 2026-04-25
**Project:** recanto-app / Feature 16 Library — Step 10 (pós-Step 9)

## O que você terá ao final

3 features integradas ao BookReader, online-only (não afetam PDF/EPUB):
- **Marca-texto**: destaque colorido por parágrafo, 4 cores, múltiplos por livro
- **Comentário inline**: nota por parágrafo (ref canônica como chave), modal simples
- **Histórico Skoob-style**: página `/dashboard/library/history` com stats por livro + lista de highlights + comentários

---

## Fase Discover — 10%
Já feito nesta sessão. Stack, padrões e constraints conhecidos.

## Fase Define — 20%

### Schema Firestore

```
/book_highlights/{id}
  user_id, book_id, chapter_order
  ref          — canônica "1:7" (chave de link com bloco)
  color        — 'yellow' | 'green' | 'pink' | 'blue'
  created_at

/book_comments/{id}  
  user_id, book_id, chapter_order
  ref          — canônica "1:7"
  text         — conteúdo da nota (max 1000 chars)
  created_at, updated_at?
```

**Regras**: dono CRUD; `read:library` obrigatório.  
**IDs**: auto-gerado pelo Firestore (múltiplos highlights/comentários por ref).  
**Histórico**: derivado de `book_reading_progress` + `book_highlights` + `book_comments` — sem collection separada.

### Tipos a adicionar em `domain/library/types.ts`

```ts
export type HighlightColor = 'yellow' | 'green' | 'pink' | 'blue';

export interface BookHighlight {
  id: string;
  user_id: string;
  book_id: string;
  chapter_order: number;
  ref: string;           // ex: "1:7"
  color: HighlightColor;
  created_at: string;
}

export interface BookComment {
  id: string;
  user_id: string;
  book_id: string;
  chapter_order: number;
  ref: string;
  text: string;
  created_at: string;
  updated_at?: string;
}
```

---

## Fase Develop — 55%

### Passo 1 — Domain + Infra (M + C)

**Criar:**
- `src/domain/library/types.ts` — adicionar `BookHighlight`, `BookComment`, `HighlightColor`
- `src/infrastructure/library/BookHighlightRepository.ts`
  - `findByUserAndBook(userId, bookId)` → ordenado por created_at
  - `add(highlight)` → addDoc
  - `remove(id)` → deleteDoc
- `src/infrastructure/library/BookCommentRepository.ts`
  - `findByUserAndBook(userId, bookId)`
  - `add(comment)` → addDoc
  - `update(id, text)` → updateDoc
  - `remove(id)` → deleteDoc

**Firestore rules** — adicionar em `firestore.rules`:
```
match /book_highlights/{id} {
  allow read, create, delete: if isAuthenticated() &&
    request.resource.data.user_id == request.auth.uid &&
    hasFeature('read:library');
}
match /book_comments/{id} {
  allow read, create, update, delete: if isAuthenticated() &&
    request.resource.data.user_id == request.auth.uid &&
    hasFeature('read:library');
}
```

---

### Passo 2 — Hook `useBookAnnotations`

`src/features/library/hooks/useBookAnnotations.ts`

```ts
interface UseBookAnnotationsResult {
  highlights: BookHighlight[];
  comments: BookComment[];
  loading: boolean;
  addHighlight: (ref: string, chapterOrder: number, color: HighlightColor) => Promise<void>;
  removeHighlight: (id: string) => Promise<void>;
  toggleHighlight: (ref: string, chapterOrder: number, color: HighlightColor) => Promise<void>;
  highlightForRef: (ref: string) => BookHighlight | undefined;
  addComment: (ref: string, chapterOrder: number, text: string) => Promise<void>;
  updateComment: (id: string, text: string) => Promise<void>;
  removeComment: (id: string) => Promise<void>;
  commentsForRef: (ref: string) => BookComment[];
}
```

---

### Passo 3 — Shared components

#### `src/shared/components/HighlightColorPicker/`
```tsx
<HighlightColorPicker
  value={color}
  onChange={setColor}
/>
```
4 botões circulares de cor (yellow/green/pink/blue) com DaisyUI badge.  
Cor mapeada pra classe Tailwind hardcoded (sem classe dinâmica):
```ts
const colorClass = {
  yellow: 'bg-yellow-200 border-yellow-400',
  green:  'bg-green-200 border-green-400',
  pink:   'bg-pink-200  border-pink-400',
  blue:   'bg-blue-200  border-blue-400',
};
```

#### `src/shared/components/CommentModal/`
```tsx
<CommentModal
  ref={ref}
  existingComment={comment}
  onSave={(text) => addComment(ref, chapterOrder, text)}
  onDelete={() => removeComment(comment.id)}
  onClose={() => setCommentOpen(false)}
/>
```
Modal DaisyUI, textarea max 1000 chars, contador, botão salvar/deletar.

---

### Passo 4 — Integrar no `BlockControls`

Adicionar 2 novos botões ao `BlockControls` existente:

```
[Bookmark] [Link] [Highlight] [Comment]
```

- **Highlight**: abre `HighlightColorPicker` inline (dropdown pequeno). Se já tem highlight na ref → mostra com a cor aplicada, click remove.
- **Comment**: abre `CommentModal`. Se já tem comentário → badge de número ao lado do botão.

O parágrafo/citação marcado recebe `bg-yellow-100` (ou a cor escolhida) ao fundo.

---

### Passo 5 — Página Histórico

`src/app/(app)/app/dashboard/library/history/page.tsx`

Sidebar `/dashboard/library` → link "Meu histórico" para quem tem `read:library`.

**Layout da página:**
```
/dashboard/library/history

Meu Histórico de Leitura
────────────────────────
[Card por livro — ordenado por última atividade]

Card:
  [capa mini] Título do livro
  ── ██████████░░ 72% lido
  ── Iniciado: 12 jan 2026 · Concluído: —
  ── 4 destaques · 2 comentários · Marcador em 2:15
  [Ver destaques ▾] [Ver comentários ▾]
  
  Expandido — destaques:
  ▪ 1:7  [amarelo] "texto do parágrafo em destaque..."
  ▪ 2:15 [verde]   "outro trecho..."
  
  Expandido — comentários:
  ▪ 1:12 "minha nota sobre este parágrafo"
```

**Hook**: `useReadingHistory(userId)` — carrega todos os `book_reading_progress` do usuário + por livro busca highlights + comments.

**Componentes:**
- `BookHistoryCard` — card por livro
- `AnnotationList` — lista colapsável de highlights/comentários

---

## Fase Deliver — 15%

- Deploy Firestore rules
- Adicionar `book_highlights` e `book_comments` ao `scripts/seed-permissions.mjs` (Vercel/instalação)
- Exportar novos hooks/components em `src/features/library/index.ts`
- Build verify 0 erros

---

## Phase Weights

| Fase | Peso | Justificativa |
|---|---|---|
| Discover | 10% | Contexto já estabelecido |
| Define | 20% | Schema + tipos bem definidos acima |
| Develop | 55% | 5 passos de implementação |
| Deliver | 15% | Rules + seed + exports + build |

---

## Provider Availability
- 🔴 Codex CLI: Available ✓
- 🟡 Gemini CLI: Available ✓
- 🔵 Claude: Available ✓

## Success Criteria
- Parágrafos destacáveis com 4 cores (botão inline, sem seleção nativa)
- Comentários por ref canônica, editáveis, com modal DaisyUI
- Página de histórico com stats por livro + lista de anotações expandíveis
- Firestore rules seguras + seed automático no deploy Vercel
- Build 0 erros TypeScript

## Execution Commands
```bash
/octo:embrace "implementar marca-texto + comentário + histórico Skoob no BookReader do recanto-app"
```

Ou fases individuais:
- `/octo:develop` (passos 1–5 acima)
- `/octo:deliver` (rules + seed + exports)
