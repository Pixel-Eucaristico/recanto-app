# Backend Provider Migration Plan

Objetivo: manter Firebase funcionando e adicionar Directus como backend alternativo selecionavel na
instalacao, com Clean Code, SOLID, MVC, dominios e features.

## Regras De Arquitetura

- `src/domain`: entidades, tipos e contratos. Nao importa Firebase, Directus, React ou Next.
- `src/application`: casos de uso e regras de negocio. Depende de contratos do dominio.
- `src/infrastructure`: implementacoes concretas de providers externos.
- `src/features`: UI, hooks e estado de tela.
- `src/app/api`: controllers HTTP/server-side quando necessario.
- Componentes nao devem importar Firebase, Firestore, Directus SDK ou repositories concretos.

Fluxo alvo:

```txt
feature/view -> application service -> domain repository contract -> infrastructure provider
```

## PRs

### PR 1 - Fundacao

- Criar `src/backend` com `Backend`, `BackendProvider`, config e factory.
- Criar contratos iniciais em `src/domain`.
- Criar adapter Firebase usando services legados.
- Criar adapter Directus bloqueado por contrato ate a implementacao real.
- Adicionar `BACKEND_PROVIDER` e `NEXT_PUBLIC_BACKEND_PROVIDER`.
- Adicionar `scripts/setup-backend.mjs`.
- Criar estrutura `infra/`.

Status: concluido.

### PR 2 - Contratos Por Dominio

- Completar contratos de `auth`, `users`, `permissions`, `media`, `events`, `cms`, `library`,
  `formation`, `community` e atividades.
- Cobrir os contratos com testes unitarios de shape quando possivel.

Status: concluido para os contratos principais. Os testes de contrato devem entrar junto com os
adapters concretos no PR 3, para validar Firebase e Directus contra as mesmas interfaces.

### PR 3 - Firebase Adapter Completo

- Migrar chamadas de `src/services/firebase` para `src/infrastructure/firebase`.
- Manter exports legados como compatibilidade temporaria.
- Garantir que o provider `firebase` preserva o comportamento atual.

Status: concluido como agregador de provider. `createFirebaseBackend()` agora expoe os dominios
principais em grupos (`cms`, `permissions`, `media`, `library`, `formation`, `community` e
`activities`) usando repositories Firebase existentes. A migracao de imports das features fica para
os PRs de dominio, para evitar mudancas grandes de comportamento no mesmo PR.

### PR 4 - Directus IaC

- Declarar collections, fields, relations, roles, permissions e seeds em `infra/directus`.
- Criar scripts `infra:directus:*`.
- Documentar variaveis Directus.

Status: concluido como primeira versao declarativa. Foram adicionados manifests em `infra/directus`,
scripts `infra:directus:apply`, `infra:directus:dry`, `infra:directus:validate` e
`infra:directus:snapshot`, alem de variaveis Directus no env. Relations/flows especificos devem
evoluir junto com cada adapter de dominio.

Status: concluido como fundacao declarativa. `infra/directus/schema/collections.json`,
`infra/directus/access/roles.json`, `infra/directus/access/permissions.json` e
`infra/directus/seed/items.json` definem a instalacao base. Os scripts REST
`infra:directus:dry`, `infra:directus:apply` e `infra:directus:snapshot` foram adicionados.

### PR 5 - Auth, Users E Permissions

- Implementar adapter Directus para autenticacao, usuarios e permissoes.
- Migrar guards e contexto de auth para contratos.
- Validar fluxo de login, sessao e RBAC nos dois providers.

Status: concluido para adapters base. `DirectusBackend` agora usa implementacoes reais para
`auth`, `users` e `permissions.contentGrants`, com REST client proprio e repositories para
`app_users` e `content_grants`. A troca dos hooks/guards da UI para consumir `backend.auth` fica em
um PR focado de integracao, porque o contexto atual ainda sincroniza sessao Firebase com `/api/auth`.

### PR 6 - CMS E Conteudo

- Migrar pages, menus, mods e configuracoes globais.
- Usar Directus como CMS quando `BACKEND_PROVIDER=directus`.

Status: concluido para adapters base. `DirectusBackend.cms` agora usa repositories reais para
paginas, mods, menu e configuracao global. Os adapters mantem metodos legados importantes como
`getAll`, `listPublished`, `slugExists`, `save`, `publish`, `unpublish` e
`initializeFromDefault`, para facilitar a troca gradual de imports nas telas CMS.

### PR 7 - Events E Calendar

- Migrar eventos e sincronizacao Google Calendar.
- Normalizar IDs, datas e campos externos.

Status: concluido para adapter base de eventos. `DirectusBackend.events` agora usa
`DirectusEventRepository`, com listagem por tipo, role, periodo, proximos eventos, eventos publicos
e CRUD compatível. A sincronizacao Google Calendar continua preservada no Firebase e deve ser
extraida para um servico de aplicacao compartilhado antes de ativar sync real no Directus.

### PR 8 - Library

- Migrar livros, capitulos, categorias, comentarios, highlights e progresso de leitura.

Status: concluido para adapters base. `DirectusBackend.library` agora usa repositories reais para
livros, categorias, capitulos, progresso, highlights, comentarios e tags. O schema Directus inclui
as collections de anotacoes/progresso. Busca por arrays JSON como `category_ids` permanece filtrada
no adapter para preservar o modelo atual.

### PR 9 - Formation

- Migrar trilhas, modulos, aulas, componentes, progresso e matriculas.

Status: concluido para adapters base de formacao. `DirectusBackend.formation` agora usa
repositories reais para tipos de trilha, trilhas, modulos, aulas e progresso. O schema Directus
tambem inclui `formation_track_types`. Matriculas (`enrollment`) ficam para um PR menor posterior,
pois hoje vivem em um dominio separado no codigo.

### PR 10 - Community E Activities

- Migrar forum, posts, polls, quiz, flashcards, habits, prayer, notebook, mind maps, case studies,
  crossword, word search e notifications.

Status: concluido para adapters base. `DirectusBackend.community` agora usa repositories reais para
categorias, posts, respostas e votos. `DirectusBackend.activities` agora cobre quiz, tentativas,
flashcards, habitos/logs, estudos de caso, crossword, word-search, mind maps, reflexoes, oracoes,
notificacoes e sessoes de video. O schema Directus foi expandido com as collections correspondentes.

### PR 11 - Limpeza

- Remover imports diretos de Firebase fora de `src/infrastructure/firebase`.
- Remover camada legada quando todos os dominios estiverem migrados.
- Atualizar documentacao antiga.

## Criterio De Pronto Por PR

- `npx tsc --noEmit` passa.
- O provider Firebase continua funcionando.
- Nenhuma feature passa a depender de SDK concreto fora da infraestrutura.
- Directus so e exposto quando o dominio correspondente tiver adapter e infra declarativa.
