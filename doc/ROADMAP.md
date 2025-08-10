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

## Observações
- **Foco Impecável:** Não desviar das prioridades.
- **Integração do Carisma:** Incorporar Mateus 18:33 na comunicação e design.
- **Minimalismo:** Implementar primeiro o essencial.
- **Testes Regulares:** Validar funcionalidades assim que prontas.
- **GitHub como Diário:** Usar issues e board para progresso.
- **Comunicação:** Sincronizar semanalmente com Murilo e equipe.
