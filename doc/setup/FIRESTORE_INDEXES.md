# Firestore Indexes - Guia de Configuração

Este documento explica como configurar os índices compostos necessários para as queries do Firestore.

## Por que precisamos de índices?

O Firestore requer índices compostos quando fazemos queries com:
- Múltiplos filtros `where()` + `orderBy()`
- Range queries (`>=`, `<=`) em diferentes campos
- Array queries (`array-contains`) + outros filtros

## Índices necessários neste projeto

Todos os índices estão definidos em `firestore.indexes.json` na raiz do projeto.

### Índices da coleção `events`

#### 1. Eventos públicos (is_public + start)
**Usado em:** `eventService.getPublicEvents()` (página inicial)
```typescript
// EventService.ts linha 63-79
where('is_public', '==', true)
where('start', '>=', today)
orderBy('start', 'asc')
```

#### 2. Próximos eventos (start)
**Usado em:** `eventService.getUpcomingEvents()` (dashboard)
```typescript
// EventService.ts linha 42-57
where('start', '>=', today)
orderBy('start', 'asc')
```

## Como aplicar os índices

### Opção 1: Usando o link do erro (Mais rápido)

1. Quando você recebe o erro no console, clique no link fornecido
2. O Firebase Console abrirá com o índice pré-configurado
3. Clique em "Criar índice"
4. Aguarde a criação (pode levar alguns minutos)

**Exemplo de link de erro:**
```
https://console.firebase.google.com/v1/r/project/recanto-do-amor-miserico-e5a7b/firestore/indexes?create_composite=...
```

### Opção 2: Criar manualmente no Console

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione o projeto `recanto-do-amor-miserico-e5a7b`
3. Vá em **Firestore Database** → **Indexes** (aba Índices)
4. Clique em **Create Index** (Criar índice)
5. Configure:
   - **Collection:** `events`
   - **Fields to index:**
     - `is_public` - Ascending
     - `start` - Ascending
   - **Query scope:** Collection
6. Clique em **Create**

### Opção 3: Deploy automático via Firebase CLI

```bash
# Instale Firebase CLI (se ainda não tiver)
npm install -g firebase-tools

# Login no Firebase
firebase login

# Deploy apenas os índices
firebase deploy --only firestore:indexes

# Ou deploy completo (regras + índices)
firebase deploy --only firestore
```

## Verificar índices existentes

No Firebase Console:
1. Acesse **Firestore Database** → **Indexes**
2. Você verá a lista de todos os índices
3. Status possível:
   - 🟢 **Enabled** - Índice ativo e pronto
   - 🟡 **Building** - Índice sendo criado
   - 🔴 **Error** - Erro na criação

## Tempo de criação

- Índices simples: 1-5 minutos
- Índices em coleções grandes: pode levar horas
- Você será notificado quando estiver pronto

## Troubleshooting

### Erro: "The query requires an index"

**Solução:** Use a Opção 1 (link do erro) para criar o índice específico rapidamente.

### Erro: "index already exists"

**Solução:** O índice já foi criado. Aguarde alguns minutos para que fique ativo.

### Deploy falha com Firebase CLI

**Solução:**
```bash
# Re-autentique
firebase logout
firebase login

# Verifique o projeto
firebase use --add
firebase use recanto-do-amor-miserico-e5a7b

# Tente novamente
firebase deploy --only firestore:indexes
```

## Índices atuais do projeto

Veja `firestore.indexes.json` para a lista completa atualizada. Principais:

| Coleção | Campos | Uso |
|---------|--------|-----|
| `events` | `is_public`, `start` | Eventos públicos na home |
| `events` | `start` | Próximos eventos |
| `donations` | `date`, `status` | Relatórios de doações |
| `acompanhamentos` | `missionario_id`, `date` | Histórico de acompanhamentos |
| `materials` | `category`, `created_at` | Materiais por categoria |
| `forum_topics` | `is_pinned`, `created_at` | Tópicos fixados no fórum |
| `forum_posts` | `topic_id`, `created_at` | Posts por tópico |

## Referências

- [Firestore Indexes Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Composite Index Pricing](https://firebase.google.com/docs/firestore/quotas#indexes)

---

**Última atualização:** 2025-10-12
**Projeto:** Recanto do Amor Misericordioso
