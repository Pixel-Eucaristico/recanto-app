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

**Última Atualização:** 2025-10-12

---

**Missão:** Refletir o carisma do Recanto através de ferramentas digitais que promovam compaixão, formação e comunidade, inspirados em Mateus 18:33 - "Não devias tu também ter compaixão do teu companheiro, como eu tive compaixão de ti?"
