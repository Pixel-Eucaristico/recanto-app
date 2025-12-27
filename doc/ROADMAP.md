# Roadmap Semanal (Passo a Passo) para o Recanto Digital do Amor Misericordioso

**Visão Geral:** Este roadmap combina o plano original e o refinado, garantindo clareza, foco no carisma do Recanto e detalhamento técnico. Mantemos as prioridades da Fase 1 (MVP Essencial) com entregas semanais, considerando sua carga horária (2h/dia M-F, 8h FDS).

* **Repositório GitHub:** `https://github.com/WillianQuintino/recanto-app`
* **Site (Vercel):** `https://recanto-app.vercel.app`

---

## ⚠️ Nota sobre Mudanças Arquiteturais

**Decisões Técnicas Implementadas:**

- **Firebase/Firestore** substituiu Supabase como backend (melhor integração com Auth e Realtime)
- **Next.js 15 App Router** simples ao invés de Monorepo Turborepo/Nx (menor complexidade inicial)
- **Firebase Authentication** com suporte a email/senha + social login (Google, Facebook, Twitter)
- **Firestore** para persistência de dados com RBAC (Role-Based Access Control)

**Stack Atual:**
- **Frontend:** Next.js 15, React 19, TypeScript
- **Backend:** Firebase (Auth + Firestore + Storage)
- **Styling:** Tailwind CSS v4, DaisyUI v5, Shadcn UI
- **State:** Jotai, SWR
- **Forms:** React Hook Form + Zod
- **Deploy:** Vercel (GRU1 - São Paulo)
- **Testing:** Jest + React Testing Library

---

## Fase 1: MVP Essencial – Sustentabilidade e Carisma (Semanas 1-6)

### Semana 1: Configuração Inicial e Fundação ✅ (50%)

- [x] **Configuração do Repositório e Infraestrutura**
  - [x] Criar o repositório `recanto-app` no GitHub
  - [x] Configurar Next.js 15 com App Router
  - [ ] ~~Configurar Turborepo/Nx~~ (Next.js simples implementado)
  - [ ] Configurar CI no GitHub Actions (⚠️ Pendente)

- [x] **Backend (Firebase/Firestore)**
  - [x] Criar projeto Firebase
  - [x] Configurar Firestore com collections: `users`, `materials`, `donations`, `forum_topics`, `forum_posts`, `acompanhamentos`, `desafios`
  - [x] Implementar entidades em `src/types/firebase-entities.ts`
  - [x] Configurar Firebase Auth (email/senha + Google/Facebook/Twitter)
  - [x] Implementar services layer: `BaseFirebaseService`, `UserService`, `MaterialService`, `DonationService`, `ForumService`, `EventService`, `AcompanhamentoService`, `DesafioService`

- [x] **Login/Registro**
  - [x] Página de login: `src/app/(app)/app/login`
  - [x] Página de registro: `src/app/(app)/app/register`
  - [x] Integração com Firebase Auth
  - [x] AuthContext: `src/features/dashboard/contexts/AuthContext.tsx`
  - [ ] Inserir "Citação do Dia" ou "Reflexão Breve" (⚠️ Validar UI)

- [x] **Deploy Inicial**
  - [x] Deploy no Vercel com configuração (`vercel.json`)
  - [x] Tela de login/registro funcional

**Status:** ✅ Core implementado com Firebase | ⚠️ CI/CD e citações pendentes

---

### Semana 2: Dashboard e Formação para Missionários (Parte 1) ✅ (62.5%)

- [x] **Dashboard Missionário**
  - [x] Estrutura de rotas: `src/app/(app)/app/dashboard/`
  - [x] Layout com Sidebar: `src/app/(app)/app/dashboard/layout.tsx`
  - [x] Menu para "Formação" e "Fórum"
  - [ ] Citação/reflexão diária (⚠️ Validar implementação na UI)

- [x] **Conteúdo Formativo**
  - [x] Área restrita: `src/app/(app)/app/dashboard/formation`
  - [x] Service implementado: `src/services/firebase/MaterialService.ts`
  - [x] Entidade `Material` com tipos: PDF, vídeo, texto, link
  - [x] Integração Firebase Storage (configurado)
  - [x] `target_audience` (Role[]) para controle de acesso

- [x] **Fórum de Partilha**
  - [x] Página: `src/app/(app)/app/dashboard/forum`
  - [x] Service: `src/services/firebase/ForumService.ts`
  - [x] Entidades: `ForumTopic`, `ForumPost`
  - [x] Listagem e criação de tópicos
  - [ ] Linguagem acolhedora (⚠️ Validar UX)

**Status:** ✅ Estrutura completa | ⚠️ UX de compassion a validar

---

### Semana 3: Formação (Parte 2) e Gestão de Conteúdo ✅ (100%)

- [x] **Fórum**
  - [x] Visualização de tópicos e comentários
  - [x] Sistema de moderação: `is_approved` flag em `ForumPost`
  - [x] Controle de admin para aprovar posts

- [x] **Agenda Comunitária**
  - [x] Entidade `Event` implementada
  - [x] Service: `src/services/firebase/EventService.ts`
  - [x] Página: `src/app/(app)/app/dashboard/schedule`
  - [x] Campos: `type` (oração, reunião, formação, celebração), `start`, `end`, `location`
  - [x] `target_audience` (Role[]) para visibilidade por perfil
  - [x] Integração Google Calendar preparada (`google_calendar_id`, `last_synced_at`)

- [x] **Gestão de Conteúdo (Admin)**
  - [x] Página admin: `src/app/(app)/app/dashboard/admin`
  - [x] Upload e organização de materiais
  - [x] CRUD de materiais via `MaterialService`
  - [x] Categorização: formação, espiritual, carisma, virtudes

**Status:** ✅ 100% implementado

---

### Semana 4: Área de Doações ✅ (62.5%)

- [x] **Modelo de Dados**
  - [x] Entidade `Donation` em `src/types/firebase-entities.ts`
  - [x] Campos: `value`, `method`, `donor_id`, `donor_name`, `donor_email`, `donor_phone`, `date`, `status`, `notes`
  - [x] Service: `src/services/firebase/DonationService.ts`

- [x] **Página `/doar`**
  - [x] Rota implementada: `src/app/(app)/app/dashboard/donate`
  - [ ] Valores fixos e livres (⚠️ Validar UI)
  - [ ] PIX (chave e QR Code) (⚠️ Validar implementação)
  - [x] Captura de contato do doador (campos no modelo)

- [x] **Registro e Relatórios**
  - [x] Salvar doação no Firestore via `DonationService`
  - [x] Página de relatórios: `src/app/(app)/app/dashboard/donation-report`
  - [ ] Relatório de impacto humanizado (⚠️ Validar conteúdo)

- [ ] **Mensagens de Gratidão**
  - [ ] Área com vídeos/textos de agradecimento (⚠️ Implementar)

**Status:** ✅ Core implementado | ⚠️ UX e gratidão a validar

---

### Semana 5: Acompanhamento Recantianos e WhatsApp Leve ✅ (71%)

- [x] **Perfil Recantiano**
  - [x] Roles implementados em `src/features/auth/types/user.ts`
  - [x] Tipos: `admin`, `missionario`, `recantiano`, `pai`, `colaborador`, `benfeitor`
  - [x] Campo `missionario_responsavel_id` em `FirebaseUser`
  - [x] Vinculação missionário ↔ recantiano

- [x] **Conteúdo Formativo Adaptado**
  - [x] Sistema `target_audience` em `Material`
  - [x] Suporte para vídeos/textos adaptados por role
  - [x] Categorias específicas (virtudes, carisma)

- [x] **Acompanhamento Individual**
  - [x] Entidade: `AcompanhamentoRecantiano`
  - [x] Service: `src/services/firebase/AcompanhamentoService.ts`
  - [x] Página: `src/app/(app)/app/dashboard/acompanhamento`
  - [x] Campos: `tipo` (encontro, conversa, oração), `observacoes`, `progresso` (iniciante, intermediario, avancado)
  - [ ] Sistema de mensagens diretas (⚠️ Validar implementação)

- [ ] **Integração WhatsApp**
  - [ ] Links pré-preenchidos `wa.me/...` (❌ Não implementado)

**Status:** ✅ Acompanhamento completo | ❌ WhatsApp pendente

---

### Semana 6: Desafios da Compaixão e Refinamentos ✅ (62.5%)

- [x] **Desafios Gamificados**
  - [x] Entidades: `Desafio`, `DesafioRegistro`
  - [x] Service: `src/services/firebase/DesafioService.ts`
  - [x] Página: `src/app/(app)/app/dashboard/challenges`
  - [x] Campos de desafio: `title`, `description`, `category` (compaixao, oracao, servico, virtude), `difficulty`, `points`
  - [x] Diário de registro: campo `reflection` em `DesafioRegistro`
  - [x] Sistema de conclusão: `completed`, `completion_date`

- [x] **Refinamentos**
  - [x] UI/UX com Tailwind CSS + DaisyUI + Shadcn
  - [x] Ícones temáticos: Lucide React
  - [x] Animações: Framer Motion + Lottie
  - [ ] Citações inseridas no layout (⚠️ Validar)
  - [x] Sistema de temas: `recanto-light`, `recanto-dark`, `nossa-senhora-light`, `nossa-senhora-dark`

- [x] **Documentação e Lançamento Interno**
  - [x] README.md atualizado
  - [x] CLAUDE.md com LLM-optimized docs
  - [x] Documentação de 12 bibliotecas em `docs/llms/`
  - [ ] Versão beta testada internamente (⚠️ Aguardando testes)

**Status:** ✅ Funcionalidades implementadas | ⚠️ UX e testes finais pendentes

---

## 📊 Resumo da Fase 1 (MVP)

| Semana | Itens Planejados | Implementados | % Conclusão | Status |
|--------|------------------|---------------|-------------|--------|
| 1 | 8 | 4* | 50% | 🟡 Com substituições |
| 2 | 8 | 5 | 62.5% | 🟡 UX a validar |
| 3 | 6 | 6 | 100% | 🟢 Completo |
| 4 | 8 | 5 | 62.5% | 🟡 UX a validar |
| 5 | 7 | 5 | 71% | 🟡 WhatsApp pendente |
| 6 | 8 | 5 | 62.5% | 🟡 UX a validar |
| **TOTAL** | **45** | **30** | **~67%** | 🟡 **MVP Funcional** |

\* *Firebase/Firestore substituiu Supabase (equivalente funcional)*

---

## Fase 2: Expansão – Engajamento e Biblioteca (Semanas 7-12)

### Semana 7: Conteúdo e Acompanhamento Individual
- [ ] Perfis de recantianos vinculados a missionários (✅ Estrutura pronta, aguarda população)
- [ ] Conteúdo formativo adaptado (✅ Sistema implementado)
- [ ] Registro de progresso e troca de mensagens (⚠️ Sistema de mensagens a implementar)

### Semana 8: Pais dos Recantianos e Biblioteca
- [ ] Perfis para pais vinculados aos filhos (`filho_recantiano_id` já existe em `FirebaseUser`)
- [ ] Calendário de atividades e progresso (com privacidade)
- [ ] Biblioteca digital completa (upload, listagem, visualização, busca avançada)

### Semana 9: Refinamento de Conteúdo e UX
- [ ] Edição/exclusão de materiais via dashboard admin
- [ ] Melhorias na busca e categorização
- [ ] Otimização de performance (lazy loading, image optimization)

### Semana 10: Dashboards e Relatórios
- [ ] Visualizações de métricas (usuários ativos, doações, engajamento)
- [ ] Relatórios dinâmicos de impacto para benfeitores
- [ ] Formulário de feedback interno (`src/app/(app)/app/dashboard/feedback` criado)

### Semana 11: Automação e Documentação
- [ ] Firebase Functions ou Vercel Edge Functions para tarefas recorrentes
- [ ] Detalhar README.md e adicionar CONTRIBUTING.md
- [ ] Pesquisa de próximos passos (PWA, mobile app)

### Semana 12: Lançamento Interno e Planejamento
- [ ] Apresentar versão consolidada à comunidade interna
- [ ] Coletar feedback e planejar próximo ciclo
- [ ] Pequenas melhorias e correções baseadas em feedback

---

## Fase 3: Maturidade – Automação e Expansão de Recursos (Semanas 13-18)

**Objetivo:** Consolidar a plataforma com funcionalidades avançadas que automatizam processos, aprofundam a experiência do usuário e preparam o Recanto Digital para um crescimento sustentável a longo prazo.

---

### Semana 13: Pesquisa e Planejamento da Integração Omie

**⚠️ Nota:** Estrutura de dashboard Omie já criada em `src/app/(app)/app/dashboard/omie`

* **13.1 Pesquisa da API do Omie:**
    * [ ] Ler a documentação da API do Omie para entender os endpoints de doações e benfeitores
    * [ ] Mapear quais dados podemos buscar (ex: nome do doador, valor, data) e como eles se relacionam com Firestore
    * [ ] Identificar os desafios de autenticação e os pré-requisitos técnicos

* **13.2 Configuração de um Ambiente de Teste:**
    * [ ] Configurar ambiente de desenvolvimento separado para integração Omie
    * [ ] Criar mock dos endpoints da API do Omie para testes

* **13.3 Design do Dashboard Avançado:**
    * [ ] Desenhar interface do dashboard admin para exibir dados do Omie

### Semana 14: Desenvolvimento da Integração Omie (MVP)

* **14.1 Implementação da Conexão com a API:**
    * [ ] Configurar autenticação para API do Omie no backend
    * [ ] Desenvolver lógica para buscar dados de doações e benfeitores via API
    * [ ] Salvar dados relevantes no Firestore

* **14.2 Atualização do Dashboard do Administrador:**
    * [ ] Popular dashboard com dados reais de doações do Omie
    * [ ] Desenvolver gráficos e relatórios dinâmicos

### Semana 15: Gestão de Voluntários e Aprimoramento da Biblioteca

**⚠️ Nota:** Entidade `Tarefa` já criada em `src/types/firebase-entities.ts`

* **15.1 Módulo de Gestão de Voluntários:**
    * [ ] Implementar `TarefaService` baseado em `BaseFirebaseService`
    * [ ] Desenvolver interface admin para cadastrar tarefas
    * [ ] Implementar área colaborador: `src/app/(app)/app/dashboard/tarefas`

* **15.2 Aprimoramento da Biblioteca Digital:**
    * [ ] Adicionar metadados avançados aos materiais (`author`, `year`, `keywords`)
    * [ ] Implementar sistema de reviews e avaliações
    * [ ] Sistema de busca fulltext (Algolia ou Typesense)

### Semana 16: Engajamento com Amigos da Comunidade

* **16.1 Módulo de Notícias e Atualizações Avançado:**
    * [ ] Criar entidade `News` no Firestore
    * [ ] Aprimorar módulo de notícias (imagens, vídeos, links externos)
    * [ ] Sistema de categorização de notícias

* **16.2 Módulo de Calendário de Eventos Abertos:**
    * [ ] Desenvolver calendário público na página inicial
    * [ ] Funcionalidade de inscrição online
    * [ ] Sincronização bidirecional com Google Calendar

### Semana 17: Experiência Interativa para Recantianos

**⚠️ Nota:** Sistema de desafios já implementado (Semana 6)

* **17.1 Módulo de Recursos Lúdicos e Desafios:**
    * [x] Sistema de desafios gamificados (✅ Já implementado)
    * [x] Funcionalidade de registro de conclusão (✅ `DesafioRegistro`)
    * [ ] Sistema de pontos e ranking (⚠️ Implementar leaderboard)
    * [ ] Badges e conquistas

* **17.2 Fórum Moderado entre Recantianos:**
    * [x] Sistema de moderação básico (✅ `is_approved` flag)
    * [ ] Fórum exclusivo para recantianos (filtro por role)
    * [ ] Interface de moderação para missionários

### Semana 18: Lançamento Interno e Avaliação

* **18.1 Finalização e Revisão:**
    * [ ] Testes de ponta a ponta em todas funcionalidades da Fase 3
    * [ ] Corrigir bugs e aprimorar experiência do usuário
    * [ ] Implementar testes automatizados (Jest + React Testing Library)

* **18.2 Lançamento Interno e Planejamento:**
    * [ ] Apresentar plataforma consolidada para liderança
    * [ ] Coletar feedback e avaliar resultados vs objetivos iniciais
    * [ ] Planejar roadmap Fase 4 (Mobile, PWA, notificações push)

---

## 🔧 Tarefas Técnicas Pendentes (Dívida Técnica)

### Alta Prioridade
- [ ] **CI/CD:** Configurar GitHub Actions para testes automatizados e deploy
- [ ] **WhatsApp Integration:** Implementar links pré-preenchidos (Fase 1 - Semana 5)
- [ ] **UX Validation:** Testar citações diárias, PIX/QR Code, mensagens de gratidão
- [ ] **Firestore Security Rules:** Revisar e fortalecer RBAC

### Média Prioridade
- [ ] **Sistema de Mensagens:** Implementar chat missionário ↔ recantiano
- [ ] **Biblioteca Digital:** Busca avançada e filtros
- [ ] **Mobile Responsiveness:** Validar em dispositivos móveis
- [ ] **Performance:** Otimizar imagens e lazy loading

### Baixa Prioridade
- [ ] **Monorepo:** Avaliar migração para Turborepo/Nx se Tauri for priorizado
- [ ] **Storybook:** Documentar componentes UI
- [ ] **E2E Tests:** Implementar Playwright ou Cypress
- [ ] **Accessibility:** Auditoria WCAG 2.1 AA

---

## 🎬 Próximos Passos Planejados: Gestão de Conteúdo e Mídia

### 📋 Decisões Arquiteturais - CMS e Armazenamento

**Data da Análise:** 2025-11-04

#### 🤔 Análise: Directus vs Firebase Atual

**Conclusão:** Manter Firebase/Firestore como CMS ao invés de migrar para Directus.

**Justificativa Técnica:**
- **Incompatibilidade:** Directus exige PostgreSQL (database-first), projeto atual usa Firestore (NoSQL)
- **Trabalho de Migração:** Reescrita completa do backend (semanas de trabalho)
- **Complexidade:** Perde simplicidade e integração nativa do Firebase
- **Custo-Benefício:** Firebase já oferece tudo necessário para o escopo atual

**Opções Avaliadas:**

| Opção | Descrição | Veredito |
|-------|-----------|----------|
| **Migrar para Directus + PostgreSQL** | Substituir todo backend | ❌ Não recomendado (trabalho enorme) |
| **Híbrido (Firebase + Directus)** | Directus só para conteúdo | ⚖️ Possível mas aumenta complexidade |
| **Firebase como CMS** | Usar Firestore + painel admin custom | ✅ **Recomendado** |

#### ✅ Solução Recomendada: Firebase CMS Custom

**Arquitetura:**
```
Frontend (Next.js):
  ├── Painel Admin CMS custom (DaisyUI)
  ├── Firestore como backend de conteúdo
  └── Firebase Storage para mídia privada

Firestore Collections (como CMS):
  ├── /content_pages (páginas dinâmicas)
  ├── /content_courses (cursos e módulos)
  ├── /content_library (biblioteca de recursos)
  └── /materials (já implementado)
```

**Próximos Passos:**
- [ ] Criar painel admin CMS no Next.js (`/app/dashboard/cms`)
- [ ] Implementar CRUD visual para conteúdo
- [ ] Usar DaisyUI para formulários de edição
- [ ] Aproveitar services já existentes (`MaterialService`, etc.)

---

### 📁 Armazenamento de Mídia Privada

**Objetivo:** Armazenar vídeos de cursos, músicas e imagens de forma privada com controle de acesso por role.

#### 🎥 Vídeos de Cursos

**Opção 1: YouTube Unlisted (Público por Link)**
- ✅ Gratuito e ilimitado
- ✅ Fácil de incorporar (`<iframe>`)
- ⚠️ Limitação: Qualquer um com o link pode ver

**Opção 2: Firebase Storage (Privado Real)** ⭐ **Recomendado**
- ✅ Controle total de permissões via Security Rules
- ✅ URLs assinadas com expiração
- ✅ 5GB grátis no plano Spark
- ✅ Integração nativa com Firestore

```typescript
// Exemplo de implementação
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const storage = getStorage();
const videoRef = ref(storage, 'courses/modulo1/video1.mp4');
const url = await getDownloadURL(videoRef); // URL expira em 1 hora
```

**Firestore Security Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /courses/{allPaths=**} {
      allow read: if request.auth != null &&
                     request.auth.token.role in ['admin', 'missionario', 'recantiano'];
    }
    match /music/{allPaths=**} {
      allow read: if request.auth != null;
    }
  }
}
```

#### 🎵 Músicas

**Opção 1: SoundCloud Privado**
- Upload como "Privado" e compartilha link secreto

**Opção 2: Firebase Storage** ⭐ **Recomendado**
- Mesmo esquema dos vídeos
- Controle de acesso por role

#### 🖼️ Imagens

**❌ Imgur NÃO recomendado:**
- Público por natureza, mesmo imagens "privadas" podem vazar

**✅ Firebase Storage recomendado:**
- Controle total de privacidade
- URLs assinadas com expiração
- Security Rules customizadas

---

### 💰 Configuração Gratuita Completa

```
Frontend:
  └── Vercel (grátis, ilimitado para hobby)

Backend:
  ├── Firebase Auth (grátis até 50k usuários/mês)
  ├── Firestore (1GB grátis)
  └── Firebase Storage (5GB grátis)

CDN/Mídia:
  ├── YouTube Unlisted (vídeos públicos da comunidade)
  ├── Firebase Storage (vídeos/áudios/imagens privadas)
  └── URLs assinadas com expiração por role
```

**Estimativa de Custo:** 🎉 **R$ 0,00/mês** (até 5GB storage + 50k usuários)

---

### 🚀 Próximas Ações Priorizadas

1. **[ ] Implementar painel CMS admin** (`/app/dashboard/cms`)
   - CRUD visual para conteúdo dinâmico
   - Upload de mídia com preview
   - Categorização e tags

2. **[ ] Configurar Firebase Storage Security Rules**
   - Regras por role (admin, missionario, recantiano)
   - URLs assinadas com expiração
   - Controle de upload por permissão

3. **[ ] Implementar upload seguro de mídia**
   - Upload direto para Firebase Storage
   - Preview antes do envio
   - Validação de tipo de arquivo
   - Progress bar

4. **[ ] Estruturar collections Firestore para CMS**
   - `/content_pages` (páginas dinâmicas)
   - `/content_courses` (cursos com módulos)
   - `/content_resources` (recursos multimídia)

---

## Fase 4: CMS Modular Headless (Semanas 19-26)

**Objetivo:** Transformar o site público em um CMS modular onde o conteúdo é gerenciado via Firestore/JSON e renderizado por componentes React reutilizáveis (Mods), permitindo edição visual no dashboard admin.

**Conceito Central:** Separar **Conteúdo (Firestore)** da **Apresentação (Mods)**.

### 📐 Arquitetura do CMS

```
Frontend (Next.js):
  ├── Área Pública: /[...slug] (renderizador dinâmico)
  ├── Dashboard Admin: /app/dashboard/admin/cms (editor visual)
  └── Mods Library: /components/mods (componentes reutilizáveis)

Firestore Collections:
  ├── /content_pages (páginas CMS: slug, title, blocks[])
  └── /mods_configs (configurações dos Mods disponíveis)

Componentes:
  ├── Hero, Gallery, ChartBlock, ContactForm, etc.
  └── Cada Mod tem props configuráveis via editor admin
```

---

### Fase 4.0: Setup Inicial (Semana 19)

**Objetivo:** Criar infraestrutura base do CMS sem modificar páginas existentes.

#### 📋 Tarefas

**1. Estrutura de Diretórios**
```
src/
├── components/
│   └── mods/                      # Mods CMS
│       ├── Hero/
│       │   ├── Hero.tsx
│       │   └── config.ts
│       ├── Gallery/
│       ├── ChartBlock/
│       ├── ContactForm/
│       ├── index.ts              # Export central
│       └── README.md
├── services/
│   └── firebase/
│       ├── ContentPageService.ts  # CRUD páginas CMS
│       └── ModConfigService.ts    # CRUD configs Mods
├── types/
│   └── cms-types.ts               # Tipos do CMS
└── app/
    ├── (main)/
    │   └── [...slug]/             # Renderizador dinâmico
    │       └── page.tsx
    └── (app)/app/dashboard/admin/
        └── cms/                   # Editor CMS
            ├── page.tsx           # Lista páginas
            ├── [pageId]/
            │   └── page.tsx       # Editor de página
            └── mods/
                └── page.tsx       # Gerenciar Mods
```

**2. Criar Tipos TypeScript (`src/types/cms-types.ts`)**
```typescript
import { Role } from '@/features/auth/types/user';

// Bloco de conteúdo em uma página
export interface CMSBlock {
  id: string;                      // ID único do bloco
  modId: string;                   // ID do Mod (ex: "Hero", "Gallery")
  props: Record<string, any>;      // Props dinâmicas do Mod
  order: number;                   // Ordem de renderização
}

// Página gerenciada pelo CMS
export interface CMSPage {
  id: string;
  slug: string;                    // URL da página (ex: "/sobre", "/")
  title: string;
  description?: string;
  blocks: CMSBlock[];              // Array de blocos
  is_published: boolean;
  target_audience?: Role[];        // Controle de acesso (opcional)
  seo?: {
    meta_title?: string;
    meta_description?: string;
    og_image?: string;
  };
  created_at: string;
  updated_at?: string;
}

// Configuração de um Mod
export interface ModConfig {
  id: string;                      // ID único do Mod
  name: string;                    // Nome amigável
  description?: string;
  icon?: string;                   // Ícone Lucide
  category: 'hero' | 'content' | 'chart' | 'gallery' | 'form' | 'testimonial' | 'cta' | 'other';
  props: ModPropConfig[];          // Definição das props editáveis
  preview?: string;                // URL de preview
}

// Configuração de uma prop de Mod
export interface ModPropConfig {
  key: string;                     // Nome da prop
  label: string;                   // Label no editor
  type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'json-editor' | 'image' | 'color' | 'date';
  options?: string[];              // Para type="select"
  required?: boolean;
  defaultValue?: any;
  placeholder?: string;
  helpText?: string;
}
```

**3. Criar Services Firestore**
```typescript
// src/services/firebase/ContentPageService.ts
import { BaseFirebaseService } from './BaseFirebaseService';
import { CMSPage } from '@/types/cms-types';

class ContentPageService extends BaseFirebaseService<CMSPage> {
  constructor() {
    super('content_pages');
  }

  // Buscar página por slug
  async getBySlug(slug: string): Promise<CMSPage | null> {
    const pages = await this.queryByField('slug', slug);
    return pages[0] || null;
  }

  // Listar apenas páginas publicadas
  async listPublished(): Promise<CMSPage[]> {
    return this.queryByField('is_published', true);
  }

  // Listar páginas públicas (sem controle de acesso)
  async listPublic(): Promise<CMSPage[]> {
    const pages = await this.listPublished();
    return pages.filter(p => !p.target_audience || p.target_audience.includes(null));
  }
}

export const contentPageService = new ContentPageService();
```

```typescript
// src/services/firebase/ModConfigService.ts
import { BaseFirebaseService } from './BaseFirebaseService';
import { ModConfig } from '@/types/cms-types';

class ModConfigService extends BaseFirebaseService<ModConfig> {
  constructor() {
    super('mods_configs');
  }

  // Listar por categoria
  async listByCategory(category: string): Promise<ModConfig[]> {
    return this.queryByField('category', category);
  }
}

export const modConfigService = new ModConfigService();
```

**4. Criar Primeiro Mod: Hero**
```typescript
// src/components/mods/Hero/Hero.tsx
import Image from 'next/image';

interface HeroProps {
  title: string;
  subtitle: string;
  theme?: 'primary' | 'secondary' | 'accent';
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function Hero({
  title,
  subtitle,
  theme = 'primary',
  imageUrl,
  ctaText,
  ctaLink
}: HeroProps) {
  return (
    <div className={`hero min-h-screen bg-${theme}`}>
      <div className="hero-content flex-col lg:flex-row-reverse">
        {imageUrl && (
          <div className="relative w-full max-w-sm h-64 lg:h-96">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="rounded-lg shadow-2xl object-cover"
            />
          </div>
        )}
        <div>
          <h1 className="text-5xl font-bold">{title}</h1>
          <p className="py-6">{subtitle}</p>
          {ctaText && ctaLink && (
            <a href={ctaLink} className="btn btn-primary">
              {ctaText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

```typescript
// src/components/mods/Hero/config.ts
import { ModConfig } from '@/types/cms-types';

export const HeroConfig: ModConfig = {
  id: 'Hero',
  name: 'Seção Hero',
  description: 'Seção de destaque com título, subtítulo e imagem',
  icon: 'rocket',
  category: 'hero',
  props: [
    {
      key: 'title',
      label: 'Título Principal',
      type: 'text',
      required: true,
      placeholder: 'Ex: Bem-vindo ao Recanto'
    },
    {
      key: 'subtitle',
      label: 'Subtítulo',
      type: 'textarea',
      required: true,
      helpText: 'Texto descritivo abaixo do título'
    },
    {
      key: 'theme',
      label: 'Tema de Cor',
      type: 'select',
      options: ['primary', 'secondary', 'accent'],
      defaultValue: 'primary'
    },
    {
      key: 'imageUrl',
      label: 'Imagem',
      type: 'image',
      helpText: 'URL da imagem ou upload'
    },
    {
      key: 'ctaText',
      label: 'Texto do Botão (CTA)',
      type: 'text',
      placeholder: 'Ex: Saiba Mais'
    },
    {
      key: 'ctaLink',
      label: 'Link do Botão',
      type: 'text',
      placeholder: 'Ex: /sobre'
    }
  ]
};
```

**5. Index Central dos Mods**
```typescript
// src/components/mods/index.ts
import Hero from './Hero/Hero';
import { HeroConfig } from './Hero/config';

// Mapeamento de componentes
export const ModComponents = {
  Hero,
  // Futuros Mods:
  // Gallery,
  // ChartBlock,
  // ContactForm,
  // Testimonials,
} as const;

// Mapeamento de configurações
export const ModConfigs: Record<string, ModConfig> = {
  Hero: HeroConfig,
  // Futuros Configs...
};

export type ModId = keyof typeof ModComponents;
```

**6. Renderizador Dinâmico de Páginas**
```typescript
// src/app/(main)/[...slug]/page.tsx
import { notFound } from 'next/navigation';
import { contentPageService } from '@/services/firebase/ContentPageService';
import { ModComponents } from '@/components/mods';
import { CMSPage, CMSBlock } from '@/types/cms-types';

interface PageProps {
  params: { slug: string[] };
}

async function getPageData(slug: string): Promise<CMSPage | null> {
  return await contentPageService.getBySlug(slug);
}

export default async function DynamicPage({ params }: PageProps) {
  const slug = params.slug ? `/${params.slug.join('/')}` : '/';
  const page = await getPageData(slug);

  if (!page || !page.is_published) {
    notFound();
  }

  // Ordenar blocos
  const sortedBlocks = [...page.blocks].sort((a, b) => a.order - b.order);

  return (
    <main>
      {sortedBlocks.map((block: CMSBlock) => {
        const Component = ModComponents[block.modId as keyof typeof ModComponents];

        if (!Component) {
          console.warn(`Mod "${block.modId}" não encontrado`);
          return null;
        }

        return (
          <Component
            key={block.id}
            {...block.props}
          />
        );
      })}
    </main>
  );
}

// Gerar metadata dinâmica
export async function generateMetadata({ params }: PageProps) {
  const slug = params.slug ? `/${params.slug.join('/')}` : '/';
  const page = await getPageData(slug);

  if (!page) {
    return { title: 'Página não encontrada' };
  }

  return {
    title: page.seo?.meta_title || page.title,
    description: page.seo?.meta_description || page.description,
    openGraph: {
      title: page.seo?.meta_title || page.title,
      description: page.seo?.meta_description || page.description,
      images: page.seo?.og_image ? [page.seo.og_image] : [],
    }
  };
}
```

#### 🧪 Testes da Fase 4.0

**Passo 1: Verificar Estrutura**
```bash
# Listar arquivos criados
ls src/components/mods/Hero
ls src/services/firebase/ContentPageService.ts
ls src/types/cms-types.ts
ls src/app/(main)/[...slug]/page.tsx
```

**Passo 2: Criar Página de Teste no Firestore**
```typescript
// Via Console do navegador em /app/dashboard
import { contentPageService } from '@/services/firebase/ContentPageService';

const testPage = await contentPageService.create({
  slug: '/teste-cms',
  title: 'Teste CMS Modular',
  description: 'Página de teste do novo sistema CMS',
  blocks: [
    {
      id: 'block-1',
      modId: 'Hero',
      props: {
        title: 'CMS Funcionando! 🎉',
        subtitle: 'Sistema modular implementado com sucesso',
        theme: 'primary',
        ctaText: 'Voltar ao Início',
        ctaLink: '/'
      },
      order: 0
    }
  ],
  is_published: true
});

console.log('Página criada:', testPage);
```

**Passo 3: Verificar Firestore**
- Abrir Firebase Console
- Coleção `content_pages`
- Confirmar documento criado

**Passo 4: Acessar Página Renderizada**
- Navegar para `http://localhost:3000/teste-cms`
- Verificar Hero renderizado corretamente
- Testar botão CTA

**Passo 5: Testar Mod Isolado**
```typescript
// Criar página: src/app/test-hero/page.tsx
import Hero from '@/components/mods/Hero/Hero';

export default function TestHeroPage() {
  return (
    <Hero
      title="Teste Isolado do Hero"
      subtitle="Verificando props e renderização"
      theme="secondary"
      imageUrl="https://images.unsplash.com/photo-1438032005730-c779502df39b"
      ctaText="Teste CTA"
      ctaLink="/sobre"
    />
  );
}
```
- Acessar `http://localhost:3000/test-hero`
- Verificar todos os elementos

#### ✅ Checklist Fase 4.0

- [ ] Estrutura de diretórios criada
- [ ] `cms-types.ts` implementado
- [ ] `ContentPageService.ts` implementado
- [ ] `ModConfigService.ts` implementado
- [ ] Mod `Hero` criado e configurado
- [ ] `index.ts` central dos Mods
- [ ] Renderizador `[...slug]/page.tsx` implementado
- [ ] Teste manual criação de página OK
- [ ] Verificação Firestore OK
- [ ] Teste renderização página CMS OK
- [ ] Teste Mod isolado OK

---

### Fase 4.1: Migrar Página Inicial (/) (Semana 20)

**Objetivo:** Converter a página inicial atual para o sistema CMS, criando Mods para cada seção.

#### 📋 Análise da Página Atual

**Componentes atuais em `src/features/main/`:**
1. Hero principal
2. Seção de eventos recentes
3. Seção sobre a comunidade
4. Call-to-action doações
5. Testemunhos
6. Footer

#### 📋 Tarefas

**1. Criar Mods Necessários**

**Mod: RecentEvents**
```typescript
// src/components/mods/RecentEvents/RecentEvents.tsx
import { eventService } from '@/services/firebase/EventService';

interface RecentEventsProps {
  title?: string;
  maxEvents?: number;
  showPastEvents?: boolean;
}

export default async function RecentEvents({
  title = 'Próximos Eventos',
  maxEvents = 3,
  showPastEvents = false
}: RecentEventsProps) {
  const events = showPastEvents
    ? await eventService.list('start', 'desc')
    : await eventService.getUpcomingEvents(maxEvents);

  return (
    <section className="py-12 bg-base-200">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {events.slice(0, maxEvents).map(event => (
            <div key={event.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title">{event.title}</h3>
                <p>{event.description}</p>
                <div className="card-actions justify-end">
                  <span className="badge badge-primary">
                    {new Date(event.start).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// config.ts
export const RecentEventsConfig: ModConfig = {
  id: 'RecentEvents',
  name: 'Eventos Recentes',
  description: 'Exibe próximos eventos da agenda',
  icon: 'calendar',
  category: 'content',
  props: [
    { key: 'title', label: 'Título da Seção', type: 'text', defaultValue: 'Próximos Eventos' },
    { key: 'maxEvents', label: 'Máximo de Eventos', type: 'number', defaultValue: 3 },
    { key: 'showPastEvents', label: 'Mostrar Eventos Passados', type: 'boolean', defaultValue: false }
  ]
};
```

**Mod: AboutSection**
```typescript
// src/components/mods/AboutSection/AboutSection.tsx
import Image from 'next/image';

interface AboutSectionProps {
  title: string;
  content: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function AboutSection({
  title,
  content,
  imageUrl,
  ctaText,
  ctaLink
}: AboutSectionProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {imageUrl && (
            <div className="lg:w-1/2">
              <div className="relative w-full h-96">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
          )}
          <div className={imageUrl ? 'lg:w-1/2' : 'w-full'}>
            <h2 className="text-4xl font-bold mb-4">{title}</h2>
            <div
              className="prose prose-lg"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            {ctaText && ctaLink && (
              <a href={ctaLink} className="btn btn-primary mt-6">
                {ctaText}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// config.ts
export const AboutSectionConfig: ModConfig = {
  id: 'AboutSection',
  name: 'Seção Sobre',
  description: 'Seção de conteúdo com texto e imagem',
  icon: 'info',
  category: 'content',
  props: [
    { key: 'title', label: 'Título', type: 'text', required: true },
    { key: 'content', label: 'Conteúdo (HTML)', type: 'textarea', required: true },
    { key: 'imageUrl', label: 'Imagem', type: 'image' },
    { key: 'ctaText', label: 'Texto do Botão', type: 'text' },
    { key: 'ctaLink', label: 'Link do Botão', type: 'text' }
  ]
};
```

**Mod: CTASection** (Call-to-Action)
```typescript
// src/components/mods/CTASection/CTASection.tsx
interface CTASectionProps {
  title: string;
  subtitle?: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
  theme?: 'primary' | 'secondary' | 'accent';
}

export default function CTASection({
  title,
  subtitle,
  primaryBtnText,
  primaryBtnLink,
  secondaryBtnText,
  secondaryBtnLink,
  theme = 'primary'
}: CTASectionProps) {
  return (
    <section className={`py-20 bg-${theme} text-${theme}-content`}>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">{title}</h2>
        {subtitle && <p className="text-xl mb-8">{subtitle}</p>}
        <div className="flex gap-4 justify-center flex-wrap">
          <a href={primaryBtnLink} className="btn btn-lg btn-neutral">
            {primaryBtnText}
          </a>
          {secondaryBtnText && secondaryBtnLink && (
            <a href={secondaryBtnLink} className="btn btn-lg btn-outline">
              {secondaryBtnText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// config.ts
export const CTASectionConfig: ModConfig = {
  id: 'CTASection',
  name: 'Call-to-Action',
  description: 'Seção de chamada para ação com botões',
  icon: 'mouse-pointer',
  category: 'cta',
  props: [
    { key: 'title', label: 'Título', type: 'text', required: true },
    { key: 'subtitle', label: 'Subtítulo', type: 'text' },
    { key: 'primaryBtnText', label: 'Texto Botão Principal', type: 'text', required: true },
    { key: 'primaryBtnLink', label: 'Link Botão Principal', type: 'text', required: true },
    { key: 'secondaryBtnText', label: 'Texto Botão Secundário', type: 'text' },
    { key: 'secondaryBtnLink', label: 'Link Botão Secundário', type: 'text' },
    { key: 'theme', label: 'Tema', type: 'select', options: ['primary', 'secondary', 'accent'] }
  ]
};
```

**2. Atualizar Index de Mods**
```typescript
// src/components/mods/index.ts
import Hero from './Hero/Hero';
import RecentEvents from './RecentEvents/RecentEvents';
import AboutSection from './AboutSection/AboutSection';
import CTASection from './CTASection/CTASection';

export const ModComponents = {
  Hero,
  RecentEvents,
  AboutSection,
  CTASection,
} as const;

export const ModConfigs = {
  Hero: HeroConfig,
  RecentEvents: RecentEventsConfig,
  AboutSection: AboutSectionConfig,
  CTASection: CTASectionConfig,
};
```

**3. Criar Página CMS para Home**
```typescript
// Script para popular Firestore (executar via Node.js ou console)
const homePage = await contentPageService.create({
  slug: '/',
  title: 'Página Inicial - Recanto do Amor Misericordioso',
  description: 'Comunidade católica de compaixão e formação',
  blocks: [
    {
      id: 'home-hero',
      modId: 'Hero',
      props: {
        title: 'Recanto do Amor Misericordioso',
        subtitle: 'Uma comunidade de fé, compaixão e formação inspirada em Mateus 18:33',
        theme: 'primary',
        imageUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b',
        ctaText: 'Conheça Nossa História',
        ctaLink: '/sobre'
      },
      order: 0
    },
    {
      id: 'home-about',
      modId: 'AboutSection',
      props: {
        title: 'Sobre o Recanto',
        content: '<p>O Recanto do Amor Misericordioso é uma comunidade católica...</p>',
        imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334',
        ctaText: 'Saiba Mais',
        ctaLink: '/sobre'
      },
      order: 1
    },
    {
      id: 'home-events',
      modId: 'RecentEvents',
      props: {
        title: 'Próximos Encontros',
        maxEvents: 3,
        showPastEvents: false
      },
      order: 2
    },
    {
      id: 'home-cta',
      modId: 'CTASection',
      props: {
        title: 'Faça Parte da Nossa Missão',
        subtitle: 'Sua contribuição transforma vidas',
        primaryBtnText: 'Fazer Doação',
        primaryBtnLink: '/doacoes',
        secondaryBtnText: 'Entre em Contato',
        secondaryBtnLink: '/contatos',
        theme: 'accent'
      },
      order: 3
    }
  ],
  is_published: true,
  seo: {
    meta_title: 'Recanto do Amor Misericordioso | Comunidade Católica',
    meta_description: 'Comunidade católica de formação e compaixão inspirada em Mateus 18:33',
    og_image: 'https://recanto-app.vercel.app/og-image.jpg'
  }
});
```

**4. Desativar Página Antiga (Temporariamente)**
```typescript
// Renomear src/app/(main)/page.tsx para page.tsx.old
// A nova rota [...slug]/page.tsx vai capturar o "/"
```

#### 🧪 Testes da Fase 4.1

**Teste 1: Verificar Mods Criados**
```bash
ls src/components/mods/RecentEvents
ls src/components/mods/AboutSection
ls src/components/mods/CTASection
```

**Teste 2: Popular Firestore**
- Executar script de criação da página home
- Verificar no Firebase Console collection `content_pages`
- Confirmar documento com slug `/`

**Teste 3: Acessar Home Nova**
- `npm run dev`
- Navegar para `http://localhost:3000/`
- Verificar renderização de todos os blocos:
  - [ ] Hero com título, subtítulo, imagem e CTA
  - [ ] Seção Sobre com conteúdo e imagem
  - [ ] Eventos recentes (mínimo 3 cards)
  - [ ] CTA final com 2 botões

**Teste 4: Responsividade**
- Testar em desktop (1920x1080)
- Testar em tablet (768px)
- Testar em mobile (375px)
- Verificar imagens carregando corretamente

**Teste 5: SEO**
- Inspecionar `<head>` com DevTools
- Verificar `<title>`, `<meta description>`, Open Graph tags

#### ✅ Checklist Fase 4.1

- [ ] Mod `RecentEvents` criado
- [ ] Mod `AboutSection` criado
- [ ] Mod `CTASection` criado
- [ ] Index de Mods atualizado
- [ ] Página home criada no Firestore
- [ ] Página antiga desativada
- [ ] Teste renderização completa OK
- [ ] Teste responsividade OK
- [ ] Teste SEO OK
- [ ] Todos os links funcionando

---

### Fase 4.2: Migrar Página Sobre (/sobre) (Semana 21)

**Objetivo:** Converter página `/sobre` para CMS usando Mods reutilizáveis.

#### 📋 Análise da Página Atual

**Seções identificadas:**
1. Hero interno (título + breadcrumb)
2. História da comunidade (texto + imagens)
3. Missão e visão
4. Valores (grid)
5. Equipe (cards com fotos)

#### 📋 Tarefas

**1. Criar Novos Mods**

**Mod: InternalHero**
```typescript
// src/components/mods/InternalHero/InternalHero.tsx
interface InternalHeroProps {
  title: string;
  breadcrumbs?: { label: string; href: string }[];
  backgroundImage?: string;
}

export default function InternalHero({
  title,
  breadcrumbs,
  backgroundImage
}: InternalHeroProps) {
  const bgStyle = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})` }
    : {};

  return (
    <div
      className="hero min-h-[40vh] bg-base-200"
      style={bgStyle}
    >
      <div className="hero-overlay bg-opacity-60"></div>
      <div className="hero-content text-center text-neutral-content">
        <div>
          {breadcrumbs && (
            <div className="text-sm breadcrumbs mb-4">
              <ul>
                {breadcrumbs.map((crumb, i) => (
                  <li key={i}>
                    <a href={crumb.href}>{crumb.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <h1 className="text-5xl font-bold">{title}</h1>
        </div>
      </div>
    </div>
  );
}

// config.ts
export const InternalHeroConfig: ModConfig = {
  id: 'InternalHero',
  name: 'Hero Interno',
  description: 'Hero para páginas internas com breadcrumb',
  icon: 'layout',
  category: 'hero',
  props: [
    { key: 'title', label: 'Título', type: 'text', required: true },
    { key: 'breadcrumbs', label: 'Breadcrumbs (JSON)', type: 'json-editor' },
    { key: 'backgroundImage', label: 'Imagem de Fundo', type: 'image' }
  ]
};
```

**Mod: ValuesGrid**
```typescript
// src/components/mods/ValuesGrid/ValuesGrid.tsx
interface Value {
  icon: string;
  title: string;
  description: string;
}

interface ValuesGridProps {
  title?: string;
  values: Value[];
}

export default function ValuesGrid({
  title = 'Nossos Valores',
  values
}: ValuesGridProps) {
  return (
    <section className="py-16 bg-base-100">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">{title}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, i) => (
            <div key={i} className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="card-title">{value.title}</h3>
                <p>{value.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// config.ts
export const ValuesGridConfig: ModConfig = {
  id: 'ValuesGrid',
  name: 'Grid de Valores',
  description: 'Exibe valores ou princípios em cards',
  icon: 'heart',
  category: 'content',
  props: [
    { key: 'title', label: 'Título da Seção', type: 'text', defaultValue: 'Nossos Valores' },
    {
      key: 'values',
      label: 'Valores (Array de objetos)',
      type: 'json-editor',
      helpText: 'Formato: [{ icon: "❤️", title: "Compaixão", description: "..." }]',
      required: true
    }
  ]
};
```

**Mod: TeamGrid**
```typescript
// src/components/mods/TeamGrid/TeamGrid.tsx
import Image from 'next/image';

interface TeamMember {
  name: string;
  role: string;
  photo: string;
  bio?: string;
}

interface TeamGridProps {
  title?: string;
  members: TeamMember[];
}

export default function TeamGrid({
  title = 'Nossa Equipe',
  members
}: TeamGridProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">{title}</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {members.map((member, i) => (
            <div key={i} className="card bg-base-100 shadow-xl">
              <figure className="px-4 pt-4">
                <div className="avatar">
                  <div className="w-32 rounded-full">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      width={128}
                      height={128}
                    />
                  </div>
                </div>
              </figure>
              <div className="card-body items-center text-center">
                <h3 className="card-title">{member.name}</h3>
                <p className="text-sm opacity-70">{member.role}</p>
                {member.bio && <p className="text-xs">{member.bio}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// config.ts
export const TeamGridConfig: ModConfig = {
  id: 'TeamGrid',
  name: 'Grid de Equipe',
  description: 'Exibe membros da equipe em cards',
  icon: 'users',
  category: 'content',
  props: [
    { key: 'title', label: 'Título', type: 'text', defaultValue: 'Nossa Equipe' },
    {
      key: 'members',
      label: 'Membros (JSON)',
      type: 'json-editor',
      helpText: '[{ name, role, photo, bio }]',
      required: true
    }
  ]
};
```

**2. Criar Página /sobre no Firestore**
```typescript
const aboutPage = await contentPageService.create({
  slug: '/sobre',
  title: 'Sobre o Recanto',
  blocks: [
    {
      id: 'about-hero',
      modId: 'InternalHero',
      props: {
        title: 'Sobre Nós',
        breadcrumbs: [
          { label: 'Início', href: '/' },
          { label: 'Sobre', href: '/sobre' }
        ],
        backgroundImage: 'https://images.unsplash.com/photo-1507692049790-de58290a4334'
      },
      order: 0
    },
    {
      id: 'about-history',
      modId: 'AboutSection',
      props: {
        title: 'Nossa História',
        content: '<p>O Recanto do Amor Misericordioso nasceu em...</p>',
        imageUrl: 'https://images.unsplash.com/photo-1438032005730-c779502df39b'
      },
      order: 1
    },
    {
      id: 'about-mission',
      modId: 'AboutSection',
      props: {
        title: 'Missão e Visão',
        content: '<p><strong>Missão:</strong> Promover...</p><p><strong>Visão:</strong> Ser...</p>'
      },
      order: 2
    },
    {
      id: 'about-values',
      modId: 'ValuesGrid',
      props: {
        title: 'Nossos Valores',
        values: [
          { icon: '❤️', title: 'Compaixão', description: 'Inspirados em Mateus 18:33' },
          { icon: '🙏', title: 'Oração', description: 'Vida de oração constante' },
          { icon: '📖', title: 'Formação', description: 'Crescimento espiritual contínuo' }
        ]
      },
      order: 3
    },
    {
      id: 'about-team',
      modId: 'TeamGrid',
      props: {
        title: 'Equipe de Coordenação',
        members: [
          { name: 'Pe. João', role: 'Coordenador', photo: 'https://randomuser.me/api/portraits/men/1.jpg' },
          { name: 'Maria Silva', role: 'Secretária', photo: 'https://randomuser.me/api/portraits/women/1.jpg' }
        ]
      },
      order: 4
    }
  ],
  is_published: true
});
```

#### 🧪 Testes da Fase 4.2

**Checklist de Testes:**
- [ ] Acessar `http://localhost:3000/sobre`
- [ ] Verificar Hero interno com breadcrumb
- [ ] Verificar seções de história e missão
- [ ] Verificar grid de valores (3 cards)
- [ ] Verificar grid de equipe com fotos
- [ ] Testar responsividade
- [ ] Testar navegação breadcrumb

#### ✅ Checklist Fase 4.2

- [ ] Mod `InternalHero` criado
- [ ] Mod `ValuesGrid` criado
- [ ] Mod `TeamGrid` criado
- [ ] Página /sobre criada no Firestore
- [ ] Testes completos OK

---

### Fase 4.3: Migrar /espritualidade (Semana 22)
### Fase 4.4: Migrar /doacoes (Semana 22)
### Fase 4.5: Migrar /contatos (Semana 23)

**Estrutura similar às fases anteriores, criando Mods específicos conforme necessário.**

---

### Fase 4.6: Editor Visual Admin + CLI (Semanas 24-26)

**Objetivo:** Criar interface visual no dashboard admin para gerenciar páginas CMS sem editar Firestore manualmente.

#### 📋 Tarefas

**Semana 24: Editor de Páginas**

**1. Lista de Páginas CMS**
```typescript
// src/app/(app)/app/dashboard/admin/cms/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { contentPageService } from '@/services/firebase/ContentPageService';
import { CMSPage } from '@/types/cms-types';
import Link from 'next/link';

export default function CMSPagesListPage() {
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  async function loadPages() {
    const data = await contentPageService.list('updated_at', 'desc');
    setPages(data);
    setLoading(false);
  }

  async function deletePage(id: string) {
    if (!confirm('Deletar página?')) return;
    await contentPageService.delete(id);
    loadPages();
  }

  if (loading) return <div className="loading loading-spinner"></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Páginas CMS</h1>
        <Link href="/app/dashboard/admin/cms/new" className="btn btn-primary">
          + Nova Página
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Última Atualização</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pages.map(page => (
              <tr key={page.id}>
                <td>{page.title}</td>
                <td><code>{page.slug}</code></td>
                <td>
                  <span className={`badge ${page.is_published ? 'badge-success' : 'badge-warning'}`}>
                    {page.is_published ? 'Publicado' : 'Rascunho'}
                  </span>
                </td>
                <td>{new Date(page.updated_at || page.created_at).toLocaleDateString('pt-BR')}</td>
                <td className="flex gap-2">
                  <Link href={`/app/dashboard/admin/cms/${page.id}`} className="btn btn-sm">
                    Editar
                  </Link>
                  <a href={page.slug} target="_blank" className="btn btn-sm btn-ghost">
                    Ver
                  </a>
                  <button onClick={() => deletePage(page.id)} className="btn btn-sm btn-error">
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

**2. Editor de Página Individual**
```typescript
// src/app/(app)/app/dashboard/admin/cms/[pageId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { contentPageService } from '@/services/firebase/ContentPageService';
import { ModConfigs, ModComponents } from '@/components/mods';
import { CMSPage, CMSBlock } from '@/types/cms-types';

export default function CMSPageEditorPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.pageId as string;

  const [page, setPage] = useState<CMSPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPage();
  }, [pageId]);

  async function loadPage() {
    if (pageId === 'new') {
      setPage({
        id: '',
        slug: '',
        title: '',
        blocks: [],
        is_published: false,
        created_at: new Date().toISOString()
      });
    } else {
      const data = await contentPageService.get(pageId);
      setPage(data);
    }
    setLoading(false);
  }

  async function savePage() {
    if (!page) return;

    if (pageId === 'new') {
      const newPage = await contentPageService.create(page);
      router.push(`/app/dashboard/admin/cms/${newPage.id}`);
    } else {
      await contentPageService.update(pageId, page);
      alert('Página salva!');
    }
  }

  function addBlock(modId: string) {
    if (!page) return;

    const newBlock: CMSBlock = {
      id: `block-${Date.now()}`,
      modId,
      props: {},
      order: page.blocks.length
    };

    setPage({ ...page, blocks: [...page.blocks, newBlock] });
  }

  function updateBlock(blockId: string, updates: Partial<CMSBlock>) {
    if (!page) return;

    const updatedBlocks = page.blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );

    setPage({ ...page, blocks: updatedBlocks });
  }

  function deleteBlock(blockId: string) {
    if (!page) return;
    setPage({ ...page, blocks: page.blocks.filter(b => b.id !== blockId) });
  }

  function moveBlock(blockId: string, direction: 'up' | 'down') {
    if (!page) return;

    const index = page.blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;

    const newBlocks = [...page.blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];

    // Atualizar order
    newBlocks.forEach((block, i) => {
      block.order = i;
    });

    setPage({ ...page, blocks: newBlocks });
  }

  if (loading) return <div className="loading loading-spinner"></div>;
  if (!page) return <div>Página não encontrada</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {pageId === 'new' ? 'Nova Página' : 'Editar Página'}
        </h1>
        <div className="flex gap-2">
          <button onClick={savePage} className="btn btn-primary">
            Salvar
          </button>
          <button onClick={() => router.back()} className="btn">
            Cancelar
          </button>
        </div>
      </div>

      {/* Metadados da Página */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">Informações da Página</h2>

          <div className="form-control">
            <label className="label"><span className="label-text">Título</span></label>
            <input
              type="text"
              className="input input-bordered"
              value={page.title}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text">Slug (URL)</span></label>
            <input
              type="text"
              className="input input-bordered"
              value={page.slug}
              onChange={(e) => setPage({ ...page, slug: e.target.value })}
              placeholder="/exemplo"
            />
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Publicado</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={page.is_published}
                onChange={(e) => setPage({ ...page, is_published: e.target.checked })}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Lista de Blocos */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Blocos de Conteúdo</h2>

        {page.blocks.map((block, index) => (
          <div key={block.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <h3 className="card-title">{ModConfigs[block.modId]?.name || block.modId}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => moveBlock(block.id, 'up')}
                    className="btn btn-sm"
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveBlock(block.id, 'down')}
                    className="btn btn-sm"
                    disabled={index === page.blocks.length - 1}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => deleteBlock(block.id)}
                    className="btn btn-sm btn-error"
                  >
                    Deletar
                  </button>
                </div>
              </div>

              {/* Formulário de Props */}
              <div className="divider"></div>
              <div className="space-y-2">
                {ModConfigs[block.modId]?.props.map(propConfig => (
                  <div key={propConfig.key} className="form-control">
                    <label className="label">
                      <span className="label-text">{propConfig.label}</span>
                      {propConfig.required && <span className="label-text-alt text-error">*</span>}
                    </label>

                    {propConfig.type === 'text' && (
                      <input
                        type="text"
                        className="input input-bordered"
                        value={block.props[propConfig.key] || ''}
                        onChange={(e) => updateBlock(block.id, {
                          props: { ...block.props, [propConfig.key]: e.target.value }
                        })}
                        placeholder={propConfig.placeholder}
                      />
                    )}

                    {propConfig.type === 'textarea' && (
                      <textarea
                        className="textarea textarea-bordered"
                        value={block.props[propConfig.key] || ''}
                        onChange={(e) => updateBlock(block.id, {
                          props: { ...block.props, [propConfig.key]: e.target.value }
                        })}
                        placeholder={propConfig.placeholder}
                        rows={4}
                      />
                    )}

                    {propConfig.type === 'select' && (
                      <select
                        className="select select-bordered"
                        value={block.props[propConfig.key] || ''}
                        onChange={(e) => updateBlock(block.id, {
                          props: { ...block.props, [propConfig.key]: e.target.value }
                        })}
                      >
                        <option value="">Selecione...</option>
                        {propConfig.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {propConfig.type === 'number' && (
                      <input
                        type="number"
                        className="input input-bordered"
                        value={block.props[propConfig.key] || 0}
                        onChange={(e) => updateBlock(block.id, {
                          props: { ...block.props, [propConfig.key]: parseInt(e.target.value) }
                        })}
                      />
                    )}

                    {propConfig.type === 'boolean' && (
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={block.props[propConfig.key] || false}
                        onChange={(e) => updateBlock(block.id, {
                          props: { ...block.props, [propConfig.key]: e.target.checked }
                        })}
                      />
                    )}

                    {propConfig.type === 'json-editor' && (
                      <textarea
                        className="textarea textarea-bordered font-mono text-xs"
                        value={JSON.stringify(block.props[propConfig.key], null, 2) || ''}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            updateBlock(block.id, {
                              props: { ...block.props, [propConfig.key]: parsed }
                            });
                          } catch (err) {
                            // Ainda editando JSON inválido
                          }
                        }}
                        rows={6}
                      />
                    )}

                    {propConfig.helpText && (
                      <label className="label">
                        <span className="label-text-alt">{propConfig.helpText}</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Adicionar Novo Bloco */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">Adicionar Bloco</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(ModConfigs).map(([modId, config]) => (
                <button
                  key={modId}
                  onClick={() => addBlock(modId)}
                  className="btn btn-outline"
                >
                  {config.icon && <span className="mr-2">{config.icon}</span>}
                  {config.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Semana 25: Gerenciador de Mods**
- Interface para visualizar Mods disponíveis
- Preview de cada Mod
- Documentação inline das props

**Semana 26: CLI Opcional**
- Script Node.js para adicionar Mods de um repositório
- Comando: `npm run cms-add <ModName>`
- Download automático de arquivos + instalação de dependências

#### 🧪 Testes da Fase 4.6

**Checklist de Testes:**
- [ ] Acessar `/app/dashboard/admin/cms`
- [ ] Criar nova página via interface
- [ ] Adicionar blocos (Hero, AboutSection, etc.)
- [ ] Preencher props de cada bloco
- [ ] Salvar e publicar página
- [ ] Visualizar página renderizada
- [ ] Editar página existente
- [ ] Reordenar blocos (up/down)
- [ ] Deletar blocos
- [ ] Deletar página inteira
- [ ] Testar todos os tipos de input (text, textarea, select, json-editor)

#### ✅ Checklist Fase 4.6

- [ ] Lista de páginas CMS implementada
- [ ] Editor de página individual funcionando
- [ ] CRUD completo de blocos
- [ ] Formulário dinâmico de props
- [ ] Reordenação de blocos OK
- [ ] Gerenciador de Mods (opcional)
- [ ] CLI de instalação (opcional)
- [ ] Testes completos OK

---

## 📊 Resumo da Fase 4 (CMS Modular)

| Semana | Foco | Mods Criados | Status |
|--------|------|--------------|--------|
| 19 | Setup Inicial | Hero | ⚪ Planejado |
| 20 | Home (/) | RecentEvents, AboutSection, CTASection | ⚪ Planejado |
| 21 | Sobre (/sobre) | InternalHero, ValuesGrid, TeamGrid | ⚪ Planejado |
| 22 | Espiritualidade + Doações | Mods específicos | ⚪ Planejado |
| 23 | Contatos | ContactForm, MapSection | ⚪ Planejado |
| 24-26 | Editor Admin + CLI | - | ⚪ Planejado |

**Total de Mods Planejados:** ~15 componentes reutilizáveis

---

## 📝 Observações sobre o CMS Modular

### Vantagens
1. ✅ **Reutilização:** Mods usados em múltiplas páginas
2. ✅ **Escalabilidade:** Adicionar Mods sem tocar em código existente
3. ✅ **Manutenibilidade:** Conteúdo gerenciado no Firestore, não em arquivos
4. ✅ **Edição Visual:** Dashboard admin para não-desenvolvedores
5. ✅ **Versionamento:** Histórico de mudanças no Firestore
6. ✅ **SEO:** Metadata configurável por página

### Desvantagens / Cuidados
1. ⚠️ **Curva de Aprendizado:** Equipe precisa entender sistema de Mods
2. ⚠️ **Performance:** Server Components ajudam, mas atenção ao bundle size
3. ⚠️ **Validação:** Props precisam ser validadas (Zod no futuro)
4. ⚠️ **Testes:** Cada Mod precisa de testes unitários

### Roadmap Futuro (Pós-Fase 4)
- [ ] Versionamento de páginas (histórico de edições)
- [ ] Preview de páginas antes de publicar
- [ ] A/B testing de variações de página
- [ ] Analytics de blocos (quais Mods são mais usados)
- [ ] Marketplace de Mods (comunidade contribuindo)

---

## 📝 Observações

- **Foco Impecável:** Não desviar das prioridades do MVP
- **Integração do Carisma:** Incorporar Mateus 18:33 na comunicação e design
- **Minimalismo:** Implementar primeiro o essencial, iterar depois
- **Testes Regulares:** Validar funcionalidades assim que prontas
- **GitHub como Diário:** Usar issues e projects para progresso
- **Comunicação:** Sincronizar semanalmente com Murilo e equipe

---

## 🎯 Status Geral do Projeto

| Fase | Status | Progresso | Observações |
|------|--------|-----------|-------------|
| **Fase 1 (MVP)** | 🟢 | ~67% | Core funcional, UX a validar |
| **Fase 2 (Expansão)** | ⚪ | 0% | Estruturas prontas, aguarda implementação |
| **Fase 3 (Maturidade)** | ⚪ | 5% | Entidades criadas, falta integração |
| **Fase 4 (CMS Modular)** | ⚪ | 0% | Planejamento completo, aguarda implementação |

**Última Atualização:** 2025-11-15

---

**Missão:** Refletir o carisma do Recanto através de ferramentas digitais que promovam compaixão, formação e comunidade, inspirados em Mateus 18:33 - "Não devias tu também ter compaixão do teu companheiro, como eu tive compaixão de ti?"
