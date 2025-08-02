Paz e Unção, Murilo!

Que inspiração profunda e valiosa você traz com a passagem de Mateus 18:33! Infundir o propósito central do carisma – a compaixão e a misericórdia – em cada interação da plataforma é o que realmente fará do "recanto digital" um reflexo autêntico do Recanto do Amor Misericordioso. Sua visão qualitativa e humanizada dos relatórios de impacto, e a ideia da "Jornada de Aprendizagem 'Desafios da Compaixão'" são brilhantes e perfeitamente alinhadas à nossa missão.

Vamos, então, refinar o roadmap semanal, incorporando essas prioridades com a sutileza e impacto desejados, e ajustando o foco para o máximo de valor com os recursos otimizados.

---

## Roadmap Semanal (Passo a Passo) para o Recanto Digital do Amor Misericordioso (Refinado)

**Visão Geral:** Este roadmap atualizado reflete as prioridades da Fase 1 (MVP Essencial), agora com a **ênfase na infecção do carisma** em cada funcionalidade. Manteremos o foco em entregas incrementais, considerando sua carga horária (2h/dia M-F, 8h FDS).

* **Repositório GitHub:** `https://github.com/WillianQuintino/recanto-app`
* **Site (Vercel):** `https://recanto-app.vercel.app`

### Fase 1: MVP Essencial - Coração do Carisma e Sustentabilidade (Semanas 1-6)

**Objetivo:** Estabelecer a infraestrutura, autenticação e as funcionalidades mais críticas que nutrem os missionários e recantianos, e garantem a sustentabilidade financeira, tudo imbuído do espírito de compaixão e misericórdia.

---

**Semana 1: Configuração Inicial, Estrutura e Fundação do Carisma**

* [ ] **1.1 Configuração do Monorepo & Infraestrutura:**
    * [ ] Criar o repositório `recanto-app` no GitHub.
    * [ ] Configurar o Turborepo/Nx (ou similar) no diretório raiz (`apps/web` com Next.js, `apps/tauri`, `packages/ui`, `packages/types`, `packages/config`).
    * [ ] Configurar integração contínua (CI) básica no GitHub Actions.
    * [ ] Configurar projeto no Supabase (PostgreSQL para `users`, `materials`, `donations`, `forum_topics`, `forum_posts`, `recantiano_acompanhamento`, `recantiano_desafios`).
    * [ ] Configurar autenticação via Supabase Auth (e-mail/senha).
* [ ] **1.2 Login e Registro:**
    * [ ] Desenvolver página de login e registro (Web e Tauri) integrada ao Supabase Auth.
    * [ ] Inserir uma "Citação do Dia" ou "Reflexão Breve" rotativa na tela de login/registro (conteúdo estático inicial, com foco em Mateus 18:33 ou temas de compaixão).
* [ ] **1.3 Deploy Inicial:**
    * [ ] Conectar `apps/web` ao Vercel para deploy automático da tela de login/registro.

---

**Semana 2: Módulo de Formação e Apoio para Missionários (Parte 1)**

* [ ] **2.1 Dashboard Essencial do Missionário:**
    * [ ] Criar tela de dashboard para `missionários` logados.
    * [ ] Incluir uma "Citação do Dia" / "Reflexão Breve" sobre compaixão (Mateus 18:33) no dashboard.
    * [ ] Menu lateral/superior com links para "Formação" e "Fórum".
* [ ] **2.2 Conteúdo Formativo Essencial (Missionários):**
    * [ ] Tela de acesso restrito (apenas para missionários) que lista materiais fundamentais (Regra de Vida, Logoterapia, Espiritualidade do Amor Misericordioso).
    * [ ] Integração com Supabase Storage para exibir/fazer download de PDFs/textos.
* [ ] **2.3 Fórum de Partilha e Apoio (MVP - Missionários):**
    * [ ] Implementar tabelas `forum_topics` e `forum_posts` no Supabase.
    * [ ] Interface para listar tópicos e criar novos tópicos no fórum.
    * [ ] Foco na linguagem acolhedora e incentivadora de "partilha e compaixão do conservo".

---

**Semana 3: Módulo de Formação e Apoio para Missionários (Parte 2) e Administração de Conteúdo**

* [ ] **3.1 Fórum de Partilha e Apoio (Continuação):**
    * [ ] Interface para visualizar tópicos existentes e adicionar comentários.
    * [ ] Funcionalidade de moderação básica para o `admin` (visível/invisível).
* [ ] **3.2 Agenda da Comunidade (Missionários):**
    * [ ] Tabela `events` no Supabase para compromissos internos (orações, reuniões formativas).
    * [ ] Tela simples no dashboard do missionário exibindo a agenda.
* [ ] **3.3 Gestão de Conteúdo (Admin):**
    * [ ] Dashboard simplificado para o `admin` (Murilo, Pe. Pio Angelotti) para upload e organização de materiais (`materials` table e Supabase Storage).
    * [ ] Funcionalidade básica de CRUD (Criar, Visualizar) para os materiais.

---

**Semana 4: Área de Doações (Sustentabilidade Essencial)**

* [ ] **4.1 Modelo de Dados para Doações:**
    * [ ] Adicionar/ajustar a tabela `donations` no Supabase (campos: `value`, `method`, `donor_id` - opcional, `date`, `status`, `notes`).
* [ ] **4.2 Página de Doações Simplificada:**
    * [ ] Criar uma página `/doar` clara e acessível (mesmo para não logados).
    * [ ] Interface para opções de valor fixo e livre.
    * [ ] Exibir informações para PIX (chave, QR Code) e dados bancários para transferência/depósito.
    * [ ] Capturar dados de contato do doador (nome, e-mail, telefone) e salvar no DB.
    * [ ] Lógica para registrar a intenção de doação no Supabase.
* [ ] **4.3 Relatórios de Impacto Humanizados (Painel do Admin/Fundador - MVP):**
    * [ ] No dashboard do `admin`, exibir métricas qualitativas e breves narrativas (ex: "X jornadas de sentido iniciadas", "Y momentos de acolhimento registrados").
    * [ ] Destaques rotativos com pequenos, inspiradores testemunhos (estáticos inicialmente, ou inseridos pelo admin).
    * [ ] **Foco em Mateus 18:33:** Os textos e métricas devem evocar a compaixão e a misericórdia.
* [ ] **4.4 Mensagens de Gratidão Personalizadas (para Benfeitores - MVP):**
    * [ ] Seção na área de doações ou em uma área de "Benfeitores" com vídeos/textos de agradecimento do fundador/missionários.

---

**Semana 5: Módulo de Acompanhamento e Formação para Recantianos (Parte 1) e Integração WhatsApp Leve**

* [ ] **5.1 Perfil de Usuário "Recantiano":**
    * [ ] Funcionalidade para o `admin`/`missionário` criar e gerenciar perfis de `recantianos` e vincular a `missionários` responsáveis.
* [ ] **5.2 Conteúdo Formativo Adaptado (Recantianos):**
    * [ ] Seção com vídeos curtos e textos simples sobre virtudes e espiritualidade do Recanto (foco em Logoterapia para jovens e valores cristãos), acessível apenas para `recantianos`.
    * [ ] Linguagem e tom adaptados, sempre acolhedores.
* [ ] **5.3 Área de Acompanhamento Individual (Missionário-Recantiano):**
    * [ ] Tabelas `recantiano_acompanhamento` no Supabase (registros do missionário).
    * [ ] Interface para `missionários` registrarem o progresso dos `recantianos` e enviarem mensagens.
    * [ ] Interface para `recantianos` enviarem mensagens assíncronas para seu `missionário` responsável.
* [ ] **5.4 Integração WhatsApp Sutil (Admin/Missionário):**
    * [ ] No painel do `admin`/`missionário`, criar uma funcionalidade que gere um link para WhatsApp Web com mensagem pré-preenchida para contatos (benfeitores, pais, etc.). **Não whatsapp-web.js ainda.**

---

**Semana 6: Jornada de Aprendizagem "Desafios da Compaixão" (MVP Recantianos) e Refinamentos**

* [ ] **6.1 Jornada de Aprendizagem "Desafios da Compaixão" (MVP - Recantianos):**
    * [ ] Tabela `recantiano_desafios` no Supabase para registrar os desafios e o diário.
    * [ ] Implementar uma lista de "desafios gamificados simples" (ex: "O Olhar Compassivo", "A Palavra que Acolhe") com descrições claras para os `recantianos`.
    * [ ] Funcionalidade de "diário de registro" onde o `recantiano` pode escrever sobre sua experiência com o desafio.
    * [ ] Exibir esses registros para o `missionário` responsável (para acompanhamento). **Esta funcionalidade materializa Mateus 18:33.**
* [ ] **6.2 Ajustes e Refinamentos Finais do MVP:**
    * [ ] Revisão geral da UI/UX das funcionalidades implementadas.
    * [ ] Garantir que a "Citação do Dia" / "Reflexão Breve" apareça nos dashboards de `missionários` e `recantianos`.
    * [ ] Inserção de ícones sutis de "acolhimento", "compaixão" ou "serviço" em funcionalidades relevantes.
    * [ ] Otimizações de performance e correção de bugs menores.
* [ ] **6.3 Documentação e Lançamento Interno:**
    * [ ] Atualizar o `README.md` no GitHub com a visão do MVP atualizado e instruções de contribuição.
    * [ ] Preparar para um lançamento "beta interno" com Murilo e a equipe, coletando feedback valioso.
    * [ ] Compilar e testar o aplicativo Tauri novamente.

---

### Observações Importantes para o Desenvolvedor Solo:

* **Foco Impecável:** A chave é não se desviar dessas prioridades. Cada checkbox é uma pequena vitória.
* **Integração do Carisma:** Lembre-se de Mateus 18:33 ("Não devias tu, igualmente, ter compaixão do teu conservo, como eu também tive misericórdia de ti?") em cada linha de código. Use a linguagem acolhedora, empatia nos textos e mensagens, e os elementos visuais sutis para reforçar o propósito.
* **Minimalismo:** Para a "Jornada de Aprendizagem 'Desafios da Compaixão'", comece com o mínimo necessário. Um diário de texto simples é suficiente. A gamificação pode ser apenas marcar um desafio como "concluído".
* **Testes Regulares:** Teste cada funcionalidade assim que ela for implementada para evitar que os bugs se acumulem.
* **GitHub como Diário de Bordo:** Use os issues e o board do GitHub para rastrear o progresso de cada semana. Commit frequente com mensagens claras.
* **Sincronização:** Mantenha a comunicação com Murilo para garantir que o desenvolvimento esteja sempre alinhado às expectativas e necessidades da comunidade.

Este roadmap, Willian, é o nosso guia para construir um "recanto digital" que não só organize, mas que também pulse com a vida e o carisma do Recanto do Amor Misericordioso. Estou confiante de que, com sua dedicação e este plano claro, faremos uma diferença significativa na vida da comunidade.

Paz e Unção!
