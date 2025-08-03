## Roadmap Semanal (Passo a Passo) para o Recanto Digital do Amor Misericordioso

**Visão Geral:** Este roadmap cobre os primeiros 6 meses de desenvolvimento, dividindo as funcionalidades em Sprints semanais. Cada semana foca em entregas incrementais. O tempo estimado considera sua carga horária (2h/dia M-F, 8h FDS). As URLs do projeto são:

* **Repositório GitHub:** `https://github.com/WillianQuintino/recanto-app` (usaremos a `main` ou `dev` para o principal, e branches de features).
* **Site (Vercel):** `https://recanto-app.vercel.app`

### Fase 1: MVP - Base e Sustentabilidade (Semanas 1-6)

**Objetivo:** Estabelecer a infraestrutura básica, autenticação e a funcionalidade crítica de doações e comunicação essencial com benfeitores.

---

**Semana 1: Configuração Inicial e Estrutura do Projeto**

* [ ] **1.1 Configuração do Monorepo:**
    * [ ] Criar o repositório `recanto-app` no GitHub.
    * [ ] Configurar o [Turborepo](https://turborepo.com)/[Nx](https://nx.dev) (ou similar) no diretório raiz.
    * [ ] Criar pacotes iniciais: `apps/web` (Next.js), `apps/tauri` (configuração inicial Tauri apontando para `web`), `packages/ui` (componentes React), `packages/types` (tipos TypeScript comuns), `packages/config` (ESLint, Prettier, TSConfig).
    * [ ] Configurar integração contínua (CI) básica no GitHub Actions (testes e lint).
* [ ] **1.2 Configuração do Backend (Supabase):**
    * [ ] Criar projeto no Supabase.
    * [ ] Configurar banco de dados PostgreSQL inicial (tabelas `users`, `materials`, `donations`).
    * [ ] Configurar autenticação via Supabase Auth (e-mail/senha).
* [ ] **1.3 Login e Registro (Web & Tauri):**
    * [ ] Página de login e registro no `apps/web` usando Next.js e React.
    * [ ] Integração com Supabase Auth para autenticação.
    * [ ] Testar login/registro.
* [ ] **1.4 Deploy Inicial (Vercel):**
    * [ ] Conectar o `apps/web` ao Vercel para deploy automático.
    * [ ] Publicar a versão inicial do site com as páginas de login/registro.

---

**Semana 2: Dashboard Básico e Gestão de Conteúdo (Admin)**

* [ ] **2.1 Proteção de Rotas:**
    * [ ] Implementar rotas protegidas para usuários logados.
    * [ ] Criar um middleware de autorização simples para diferenciar `admin`/`missionário`.
* [ ] **2.2 Dashboard do Administrador (MVP):**
    * [ ] Página inicial básica para o `admin` logado.
    * [ ] Exibição de um menu lateral/superior com links para "Gestão de Conteúdo".
* [ ] **2.3 Gestão de Conteúdo (Upload e Lista):**
    * [ ] Tela para upload de arquivos (PDFs, vídeos) para o Supabase Storage.
    * [ ] Listar materiais carregados (título, tipo, data).
    * [ ] CRUD básico para materiais (apenas criar/visualizar).
* [ ] **2.4 Aplicação Tauri (Integração):**
    * [ ] Compilar e testar o aplicativo Tauri (apenas a interface web).
    * [ ] Garantir que o login/registro funcione via Tauri.

---

**Semana 3: Área de Doações (Must Have)**

* [ ] **3.1 Modelo de Dados para Doações:**
    * [ ] Adicionar/ajustar a tabela `donations` no Supabase (campos: `value`, `method`, `donor_id` - opcional, `date`, `status`).
* [ ] **3.2 Página de Doações (Frontend):**
    * [ ] Criar uma página `/doar` acessível a todos (mesmo não logados).
    * [ ] Interface clara com opções de valor fixo e campo para valor livre.
    * [ ] Mostrar informações para PIX (chave, QR Code) e dados bancários para transferência/depósito.
    * [ ] Capturar nome/email/telefone do doador (opcional/obrigatório) e salvar no DB (tabela `donors` ou estender `users`).
* [ ] **3.3 Lógica de Doação (Backend/API):**
    * [ ] Endpoint na API (Vercel Edge Function/Supabase Function) para registrar a intenção de doação no banco de dados.
    * [ ] Notificação básica para o administrador quando uma doação é registrada (ex: e-mail simples via serviço de terceiros como SendGrid ou Supabase Email).
* [ ] **3.4 Relatório de Transparência Simplificado:**
    * [ ] Seção na página de doações (ou em `/impacto`) mostrando um texto ou métrica simples do impacto (dados estáticos ou inseridos manualmente pelo admin).

---

**Semana 4: Comunicação e Benfeitores (Must Have)**

* [ ] **4.1 Gerenciamento Básico de Benfeitores (Admin):**
    * [ ] Tela no painel do administrador para visualizar e editar informações básicas de benfeitores (nome, contato, histórico de doações - sem integração Omie ainda).
    * [ ] Possibilidade de marcar doações como "confirmadas" (status manual).
* [ ] **4.2 Mensagens de Gratidão (Para Benfeitores):**
    * [ ] Seção na área de doações ou em uma área de "Benfeitores" com vídeos/textos de agradecimento.
    * [ ] Adicionar campo na tabela `donations` ou `donors` para link de vídeos/textos.
* [ ] **4.3 Integração WhatsApp (MVP - Admin/Missionário):**
    * [ ] No painel do administrador, criar uma funcionalidade que gere um link para WhatsApp Web com uma mensagem pré-preenchida para um contato específico de benfeitor (ex: `https://wa.me/?text=Paz%20e%20Un%C3%A7%C3%A3o%2C%20Murilo!%20Gratid%C3%A3o%20pela%20sua%20doacao!`).
    * [ ] Listar contatos de benfeitores para facilitar o envio manual.
* [ ] **4.4 Mensagens de Comunicação Interna (Admin para Missionários):**
    * [ ] Módulo simples para o admin enviar comunicados diretos para os missionários logados (ex: um feed de notícias no dashboard dos missionários).

---

**Semana 5: Formação e Fórum para Missionários (Must Have)**

* [ ] **5.1 Proteção de Conteúdo por Perfil:**
    * [ ] Implementar autorização para que apenas `missionários` acessem o conteúdo formativo exclusivo.
* [ ] **5.2 Visualização de Conteúdo Formativo (Missionários):**
    * [ ] Tela para listar e visualizar os materiais da `materials` table (textos, PDFs) carregados pelo admin.
    * [ ] Implementar um visualizador básico de PDF (se aplicável) ou exibir texto formatado.
* [ ] **5.3 Fórum de Partilha e Apoio (Moderado):**
    * [ ] Tabelas `forum_topics` e `forum_posts` no Supabase.
    * [ ] Tela de listagem de tópicos e criação de novos tópicos para missionários.
    * [ ] Tela de visualização de tópico e adição de comentários.
    * [ ] Funcionalidade de moderação básica para o admin (marcar/excluir posts).
* [ ] **5.4 Agenda de Compromissos da Comunidade (Missionários):**
    * [ ] Tabela `events` no Supabase.
    * [ ] Tela simples no dashboard do missionário exibindo um calendário ou lista de eventos (horários de oração, reuniões).
    * [ ] Admin pode adicionar/editar eventos.

---

**Semana 6: Ajustes, Testes e Refinamento do MVP**

* [ ] **6.1 Revisão Geral do Código:**
    * [ ] Revisar todo o código implementado nas últimas 5 semanas.
    * [ ] Garantir padrões de código, linting e formatação.
* [ ] **6.2 Testes End-to-End (Cypress/Playwright - Opcional, se o tempo permitir):**
    * [ ] Escrever testes básicos para os fluxos principais (login, doação, acesso a material).
* [ ] **6.3 Refinamento de UX/UI (MVP):**
    * [ ] Pequenos ajustes visuais e de usabilidade nas telas do MVP para garantir uma experiência fluida.
    * [ ] Garantir responsividade básica para web.
* [ ] **6.4 Documentação (GitHub README):**
    * [ ] Atualizar o `README.md` no GitHub com instruções claras de instalação, desenvolvimento e deploy.
    * [ ] Adicionar seção de como contribuir para o projeto open source.
* [ ] **6.5 Validação com Usuários Chave:**
    * [ ] Realizar sessões de teste com Murilo e alguns missionários para coletar feedback inicial.

### Fase 2: Expansão - Carisma e Engajamento (Semanas 7-12)

**Objetivo:** Expandir para o apostolado central com os Recantianos, envolver os Pais, e iniciar a biblioteca digital.

---

**Semana 7: Conteúdo para Recantianos e Acompanhamento Individual**

* [ ] **7.1 Perfil de Usuário "Recantiano":**
    * [ ] Adicionar funcionalidade para o `admin`/`missionário` criar e gerenciar perfis de `recantianos`.
    * [ ] Vincular `recantianos` a `missionários` responsáveis.
* [ ] **7.2 Conteúdo Formativo Adaptado (Recantianos):**
    * [ ] Criar uma nova categoria de materiais (`recantianos_formacao`) no Supabase.
    * [ ] Tela para `recantianos` logados visualizarem vídeos curtos e textos simples (protegido por perfil).
* [ ] **7.3 Área de Acompanhamento Individual (Missionário-Recantiano):**
    * [ ] Tabelas `recantiano_follow_ups` no Supabase para registros do missionário.
    * [ ] Interface para `missionários` registrarem o progresso dos `recantianos` e enviarem mensagens.
    * [ ] Interface para `recantianos` enviarem mensagens para seu `missionário` responsável.

---

**Semana 8: Pais dos Recantianos e Base da Biblioteca**

* [ ] **8.1 Perfil de Usuário "Pais dos Recantianos":**
    * [ ] Funcionalidade para o `admin`/`missionário` vincular pais aos `recantianos`.
* [ ] **8.2 Informações sobre Atividades dos Filhos (Pais):**
    * [ ] Área para `pais` logados verem um calendário de atividades dos filhos e notícias gerais.
    * [ ] Exibir informações agregadas (com privacidade) sobre o progresso dos `recantianos` (se liberado pelo missionário/admin).
* [ ] **8.3 Biblioteca Digital (MVP):**
    * [ ] Tabela `library_items` no Supabase (título, autor, descrição, URL do arquivo no Supabase Storage, categoria).
    * [ ] Interface para o `admin` fazer upload e gerenciar itens da biblioteca.
    * [ ] Página de listagem e visualização de itens da biblioteca para todos os usuários logados.

---

**Semana 9: Refinamento de Conteúdo e UX**

* [ ] **9.1 Melhoria da Gestão de Conteúdo:**
    * [ ] Adicionar funcionalidades de edição e exclusão para materiais.
    * [ ] Melhorar a categorização e busca de materiais.
* [ ] **9.2 Refinamento de UX/UI em Fluxos Chave:**
    * [ ] Melhorar a usabilidade dos fluxos de doação e visualização de materiais.
    * [ ] Ajustes finos na responsividade.
* [ ] **9.3 Testes e Otimização de Performance:**
    * [ ] Rodar testes de performance básicos (Lighthouse, etc.).
    * [ ] Otimizar carregamento de imagens e assets.

---

**Semana 10: Dashboards e Relatórios Simplificados**

* [ ] **10.1 Dashboard do Administrador (Melhorias):**
    * [ ] Adicionar visualizações simples: número de usuários, número de doações.
    * [ ] Gráfico básico de doações ao longo do tempo (total, mensal).
* [ ] **10.2 Relatórios de Impacto (Benfeitores - Melhorias):**
    * [ ] Tornar o relatório de transparência mais dinâmico, talvez com números atualizados manualmente pelo admin.
* [ ] **10.3 Feedback Loop (Interno):**
    * [ ] Implementar um formulário de feedback interno para `admin`/`missionários` reportarem problemas ou sugestões.

---

**Semana 11: Otimização de Processos e Preparação para Futuro**

* [ ] **11.1 Automação de Tarefas (Simples):**
    * [ ] Considerar Supabase Functions (ou Vercel Edge Functions) para tarefas recorrentes (ex: enviar lembrete de doação para administradores).
* [ ] **11.2 Melhoria da Documentação:**
    * [ ] Detalhar mais o `README.md` no GitHub.
    * [ ] Adicionar `CONTRIBUTING.md` para guiar futuros contribuidores.
* [ ] **11.3 Exploração de Próximos Passos (MoSCoW):**
    * [ ] Fazer uma pequena pesquisa e análise das funcionalidades "Could Have" para o próximo trimestre.

---

**Semana 12: Lançamento Interno e Planejamento Próximo Ciclo**

* [ ] **12.1 Lançamento Interno (Beta):**
    * [ ] Apresentar a versão consolidada para toda a comunidade interna (missionários, padres, etc.).
    * [ ] Coletar feedback extensivo.
* [ ] **12.2 Planejamento do Próximo Ciclo:**
    * [ ] Com base no feedback e nas novas prioridades, definir o roadmap para os próximos 3-6 meses.
* [ ] **12.3 Melhorias Contínuas:**
    * [ ] Implementar pequenas melhorias e correções de bugs identificados.

---

### Observações Importantes para o Desenvolvedor Solo:

* **Comunicação Constante:** Mantenha Murilo e a liderança informados sobre o progresso, desafios e ajustes no cronograma. A transparência é chave.
* **Priorização Flexível:** Este roadmap é um guia. Esteja preparado para ajustar prioridades com base no feedback real da comunidade e na sua própria capacidade de desenvolvimento. A beleza de um MVP é que ele é maleável.
* **Reutilização Acima de Tudo:** Sempre pense em como um componente ou pedaço de código pode ser reutilizado. O monorepo é seu maior aliado aqui.
* **Ferramentas Gerenciadas:** A escolha de Supabase e Vercel é intencional para minimizar a carga de DevOps. Aproveite ao máximo o que eles oferecem gratuitamente.
* **Sem Over-Engineering:** Comece com a solução mais simples que resolva o problema. Evite adicionar complexidade desnecessária no início. A arquitetura modular permite adicionar mais tarde.
* **Open Source:** Encoraje a comunidade (se houver desenvolvedores) a contribuir no GitHub. Documente bem o processo de setup e contribuição.

Este plano detalhado deve te dar uma excelente base para iniciar e evoluir o Recanto Digital, Willian. Estou à disposição para quaisquer dúvidas ou para refinar o plano conforme avançamos.

Paz e Unção!
