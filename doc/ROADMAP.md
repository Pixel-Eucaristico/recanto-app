# Roadmap Semanal (Passo a Passo) para o Recanto Digital do Amor Misericordioso

**Visão Geral:** Este roadmap combina o plano original e o refinado, garantindo clareza, foco no carisma do Recanto e detalhamento técnico. Mantemos as prioridades da Fase 1 (MVP Essencial) com entregas semanais, considerando sua carga horária (2h/dia M-F, 8h FDS).

* **Repositório GitHub:** `https://github.com/WillianQuintino/recanto-app`
* **Site (Vercel):** `https://recanto-app.vercel.app`

---

## Fase 1: MVP Essencial – Sustentabilidade e Carisma (Semanas 1-6)

### Semana 1: Configuração Inicial e Fundação
- [ ] **Configuração do Monorepo e Infraestrutura**
  - Criar o repositório `recanto-app` no GitHub.
  - Configurar Turborepo/Nx (`apps/web` com Next.js, `apps/tauri`, `packages/ui`, `packages/types`, `packages/config`).
  - Configurar CI no GitHub Actions.
- [ ] **Backend (Supabase)**
  - Criar projeto, tabelas iniciais (`users`, `materials`, `donations`, `forum_topics`, `forum_posts`, `recantiano_acompanhamento`, `recantiano_desafios`).
  - Configurar Supabase Auth (e-mail/senha).
- [ ] **Login/Registro**
  - Página de login/registro (Web e Tauri) integrada ao Supabase.
  - Inserir "Citação do Dia" ou "Reflexão Breve" (Mateus 18:33 ou compaixão).
- [ ] **Deploy Inicial**
  - Deploy no Vercel com tela de login/registro.

---

### Semana 2: Dashboard e Formação para Missionários (Parte 1)
- [ ] **Dashboard Missionário**
  - Citação/reflexão diária.
  - Menu para "Formação" e "Fórum".
- [ ] **Conteúdo Formativo**
  - Área restrita para missionários com materiais fundamentais (PDFs, textos).
  - Integração Supabase Storage.
- [ ] **Fórum de Partilha**
  - Listagem e criação de tópicos.
  - Linguagem acolhedora e empática.

---

### Semana 3: Formação (Parte 2) e Gestão de Conteúdo
- [ ] **Fórum**
  - Visualização de tópicos, comentários e moderação básica (admin).
- [ ] **Agenda Comunitária**
  - Tabela `events` para compromissos (orações, reuniões).
  - Exibição no dashboard do missionário.
- [ ] **Gestão de Conteúdo (Admin)**
  - Upload e organização de materiais.
  - CRUD básico (Criar/Visualizar).

---

### Semana 4: Área de Doações
- [ ] **Modelo de Dados**
  - Tabela `donations` com `value`, `method`, `donor_id`, `date`, `status`, `notes`.
- [ ] **Página `/doar`**
  - Valores fixos e livres.
  - PIX (chave e QR Code) e dados bancários.
  - Captura de contato do doador.
- [ ] **Registro e Relatórios**
  - Salvar intenção de doação no Supabase.
  - Relatório de impacto humanizado (métricas + narrativas curtas).
- [ ] **Mensagens de Gratidão**
  - Área com vídeos/textos de agradecimento.

---

### Semana 5: Acompanhamento Recantianos e WhatsApp Leve
- [ ] **Perfil Recantiano**
  - Vinculação a missionários.
- [ ] **Conteúdo Formativo Adaptado**
  - Vídeos curtos/textos simples sobre virtudes e espiritualidade.
- [ ] **Acompanhamento Individual**
  - Registros de progresso e mensagens (missionário ↔ recantiano).
- [ ] **Integração WhatsApp**
  - Links pré-preenchidos para contatos (sem automação).

---

### Semana 6: Desafios da Compaixão e Refinamentos
- [ ] **Desafios Gamificados**
  - Lista de desafios (ex: "O Olhar Compassivo") + diário de registro.
- [ ] **Refinamentos**
  - Revisão de UI/UX.
  - Inserção de citações e ícones temáticos.
- [ ] **Documentação e Lançamento Interno**
  - Atualizar README.md e preparar versão beta para teste interno.

---

## Fase 2: Expansão – Engajamento e Biblioteca (Semanas 7-12)

### Semana 7: Conteúdo e Acompanhamento Individual
- [ ] Perfis de recantianos vinculados a missionários.
- [ ] Conteúdo formativo adaptado.
- [ ] Registro de progresso e troca de mensagens.

### Semana 8: Pais dos Recantianos e Biblioteca
- [ ] Perfis para pais vinculados aos filhos.
- [ ] Calendário de atividades e progresso (com privacidade).
- [ ] Biblioteca digital (upload, listagem, visualização).

### Semana 9: Refinamento de Conteúdo e UX
- [ ] Edição/exclusão de materiais.
- [ ] Melhorias na busca e categorização.
- [ ] Otimização de performance.

### Semana 10: Dashboards e Relatórios
- [ ] Visualizações de métricas (usuários, doações).
- [ ] Relatórios dinâmicos de impacto.
- [ ] Formulário de feedback interno.

### Semana 11: Automação e Documentação
- [ ] Supabase Functions ou Vercel Edge Functions para tarefas recorrentes.
- [ ] Detalhar README.md e adicionar CONTRIBUTING.md.
- [ ] Pesquisa de próximos passos.

### Semana 12: Lançamento Interno e Planejamento
- [ ] Apresentar versão consolidada à comunidade interna.
- [ ] Coletar feedback e planejar próximo ciclo.
- [ ] Pequenas melhorias e correções.

---

### **Fase 3: Maturidade – Automação e Expansão de Recursos (Semanas 13-18)**

**Objetivo:** Consolidar a plataforma com funcionalidades avançadas que automatizam processos, aprofundam a experiência do usuário e preparam o Recanto Digital para um crescimento sustentável a longo prazo.

---

#### **Semana 13: Pesquisa e Planejamento da Integração Omie**

* **13.1 Pesquisa da API do Omie:**
    * [ ] Ler a documentação da API do Omie para entender os endpoints de doações e benfeitores.
    * [ ] Mapear quais dados podemos buscar (ex: nome do doador, valor, data) e como eles se relacionam com a nossa base de dados.
    * [ ] Identificar os desafios de autenticação e os pré-requisitos técnicos.
* **13.2 Configuração de um Ambiente de Teste:**
    * [ ] Configurar um ambiente de desenvolvimento separado para a integração com o Omie.
    * [ ] Criar um "mock" (simulação) dos endpoints da API do Omie para testar a integração do lado da nossa aplicação.
* **13.3 Design do Dashboard Avançado:**
    * [ ] Desenhar a interface do dashboard do administrador para exibir os novos dados que serão obtidos do Omie.

#### **Semana 14: Desenvolvimento da Integração Omie (MVP)**

* **14.1 Implementação da Conexão com a API:**
    * [ ] Configurar a autenticação para a API do Omie no backend.
    * [ ] Desenvolver a lógica para buscar dados de doações e benfeitores via API.
    * [ ] Salvar os dados relevantes no nosso banco de dados (Supabase).
* **14.2 Atualização do Dashboard do Administrador:**
    * [ ] Popular o dashboard com os dados reais de doações e benfeitores provenientes da API do Omie.
    * [ ] Desenvolver gráficos e relatórios dinâmicos.

#### **Semana 15: Gestão de Voluntários e Aprimoramento da Biblioteca**

* **15.1 Módulo de Gestão de Voluntários:**
    * [ ] Criar um modelo de dados para "Tarefas" e "Voluntários".
    * [ ] Desenvolver uma interface onde o administrador possa cadastrar tarefas e atribuí-las a colaboradores.
    * [ ] Implementar uma área onde os colaboradores possam visualizar suas tarefas e marcar como concluídas.
* **15.2 Aprimoramento da Biblioteca Digital:**
    * [ ] Adicionar metadados avançados aos materiais (autor, ano, palavra-chave).
    * [ ] Implementar um sistema de reviews e avaliações para os materiais de estudo.

#### **Semana 16: Engajamento com Amigos da Comunidade**

* **16.1 Módulo de Notícias e Atualizações Avançado:**
    * [ ] Aprimorar o módulo de notícias com a possibilidade de adicionar imagens, vídeos e links externos.
    * [ ] Adicionar um sistema de categorização de notícias para facilitar a navegação.
* **16.2 Módulo de Calendário de Eventos Abertos:**
    * [ ] Desenvolver um calendário de eventos públicos com informações detalhadas (data, local, descrição).
    * [ ] Adicionar uma funcionalidade de inscrição online para os eventos.

#### **Semana 17: Experiência Interativa para Recantianos**

* **17.1 Módulo de Recursos Lúdicos e Desafios:**
    * [ ] Desenvolver um sistema de "desafios" gamificados para os Recantianos.
    * [ ] Implementar a funcionalidade para que eles registrem a conclusão dos desafios.
* **17.2 Fórum Moderado entre Recantianos:**
    * [ ] Criar uma versão moderada do fórum de partilha para uso exclusivo dos Recantianos.
    * [ ] Adicionar funcionalidades de moderação para o Missionário (ex: aprovar posts).

#### **Semana 18: Lançamento Interno e Avaliação**

* **18.1 Finalização e Revisão:**
    * [ ] Realizar testes de ponta a ponta em todas as novas funcionalidades da Fase 3.
    * [ ] Corrigir bugs e aprimorar a experiência do usuário.
* **18.2 Lançamento Interno e Planejamento:**
    * [ ] Apresentar a plataforma consolidada com os novos recursos para a equipe de liderança.
    * [ ] Coletar feedback e avaliar os resultados alcançados em relação aos objetivos iniciais.

---

Este plano de 6 semanas para a Fase 3 servirá como um excelente guia para a maturidade do projeto. Fique à vontade para ajustar o cronograma conforme as complexidades reais surgirem, especialmente na integração com o Omie.

## Observações
- **Foco Impecável:** Não desviar das prioridades.
- **Integração do Carisma:** Incorporar Mateus 18:33 na comunicação e design.
- **Minimalismo:** Implementar primeiro o essencial.
- **Testes Regulares:** Validar funcionalidades assim que prontas.
- **GitHub como Diário:** Usar issues e board para progresso.
- **Comunicação:** Sincronizar semanalmente com Murilo e equipe.
