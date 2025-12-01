# 📋 Checklist de Migração de Páginas para CMS Modular

**Data de Criação**: 2025-11-30
**Última Atualização**: 2025-11-30

---

## 🎯 Objetivo

Migrar todas as páginas antigas do site público (`src/app/(main)/old/`) para o novo sistema CMS modular, tornando-as editáveis pelo dashboard administrativo.

---

## 📊 Status Geral

| Categoria | Total | Concluídas | Pendentes | % Completo |
|-----------|-------|------------|-----------|------------|
| **Páginas** | 9 | 1 | 8 | 11% |
| **Mods Criados** | 21 | 21 | - | 100% |

---

## 📄 Páginas a Migrar

### ✅ Concluídas

#### 1. Home (`/`)
- **Status**: ✅ Concluída
- **Slug CMS**: `/`
- **Arquivo Original**: `src/app/(main)/page.tsx`
- **Data Conclusão**: 2025-11-30
- **Mods Utilizados**:
  - HeroMission
  - ProjectsShowcase
  - EventsSection
  - Testimonials
- **Documentação**: `doc/guides/CMS_HOME_PAGE_EDITABLE.md`
- **Observações**: Sistema híbrido - usa CMS se existir página publicada, senão usa página estática

---

### ⏳ Pendentes

#### 2. Sobre (`/sobre`)
- **Status**: ⏳ Pendente
- **Slug CMS**: `/sobre`
- **Arquivo Original**: `src/app/(main)/old/sobre/page.tsx`
- **Prioridade**: 🔴 Alta
- **Mods Sugeridos**:
  - HeroStructure (banner interno)
  - TextIntro (introdução)
  - TextImageAnimation (história da comunidade)
  - PillarsGrid (missão, visão, valores)
  - CallToAction (participe)
- **Observações**: Página institucional importante

---

#### 3. Nossa Senhora (`/nossa-senhora`)
- **Status**: ⏳ Pendente
- **Slug CMS**: `/nossa-senhora`
- **Arquivo Original**: `src/app/(main)/old/nossa-senhora/page.tsx`
- **Prioridade**: 🔴 Alta
- **Mods Sugeridos**:
  - OurLadyHeader ✅ (específico para essa página)
  - TextWithQuote (citações marianas)
  - TextImageAnimation (história da devoção)
  - CallToAction (oração)
- **Observações**: Já tem Mod específico criado (OurLadyHeader)

---

#### 4. Espiritualidade/Carisma (`/espritualidade`)
- **Status**: ⏳ Pendente
- **Slug CMS**: `/espritualidade`
- **Arquivo Original**: `src/app/(main)/old/espritualidade/page.tsx`
- **Prioridade**: 🟠 Média
- **Mods Sugeridos**:
  - HeroWithAnimation (banner animado)
  - TextWithQuote (citações bíblicas/santos)
  - PillarsGrid (pilares espirituais)
  - TextIntro (carisma da comunidade)
  - CallToAction (retiro espiritual)
- **Observações**: Conteúdo espiritual central

---

#### 5. Estrutura/Vida Comunitária (`/estutura-vida`)
- **Status**: ⏳ Pendente
- **Slug CMS**: `/estutura-vida`
- **Arquivo Original**: `src/app/(main)/old/estutura-vida/page.tsx`
- **Prioridade**: 🟠 Média
- **Mods Sugeridos**:
  - HeroStructure ✅ (específico para essa página)
  - SectionsGrid ✅ (seções da estrutura)
  - InfographicGrid ✅ (organograma visual)
  - TextIntro (introdução)
- **Observações**: Já tem Mods específicos criados

---

#### 6. Vocacional (`/vocacional`)
- **Status**: ⏳ Pendente
- **Slug CMS**: `/vocacional`
- **Arquivo Original**: `src/app/(main)/old/vocacional/page.tsx`
- **Prioridade**: 🔴 Alta
- **Mods Sugeridos**:
  - VocationalBanner ✅ (banner vocacional)
  - FormationStages ✅ (etapas de formação)
  - QualitiesList ✅ (qualidades desejadas)
  - TextWithQuote (testemunhos vocacionais)
  - VocationalContactForm ✅ (formulário de contato)
- **Observações**: Já tem Mods específicos criados - pronto para migrar!

---

#### 7. Ações/Projetos/Evangelização (`/acoes-projetos-evangelizacao`)
- **Status**: ⏳ Pendente
- **Slug CMS**: `/acoes-projetos-evangelizacao`
- **Arquivo Original**: `src/app/(main)/old/acoes-projetos-evangelizacao/page.tsx`
- **Prioridade**: 🟠 Média
- **Mods Sugeridos**:
  - Hero (banner)
  - EvangelizationActions ✅ (ações de evangelização)
  - ProjectsShowcase ✅ (projetos)
  - TextIntro (introdução)
  - CallToAction (participe)
- **Observações**: Já tem Mods específicos criados

---

#### 8. Doações (`/doacoes`)
- **Status**: ⏳ Pendente
- **Slug CMS**: `/doacoes`
- **Arquivo Original**: `src/app/(main)/old/doacoes/page.tsx`
- **Prioridade**: 🔴 Alta
- **Mods Sugeridos**:
  - Hero (banner)
  - TextIntro (importância das doações)
  - CallToAction (múltiplos CTAs para diferentes formas de doar)
  - Testimonials (depoimentos de doadores)
- **Mods Faltantes**:
  - ❌ DonationForm (formulário de doação com PIX)
  - ❌ DonationTiers (níveis de contribuição)
  - ❌ ImpactMetrics (métricas de impacto)
- **Observações**: Precisa criar Mods específicos para funcionalidades de doação

---

#### 9. Contatos (`/contatos`)
- **Status**: ⏳ Pendente
- **Slug CMS**: `/contatos`
- **Arquivo Original**: `src/app/(main)/old/contatos/page.tsx`
- **Prioridade**: 🟡 Baixa
- **Mods Sugeridos**:
  - Hero (banner)
  - TextIntro (introdução)
- **Mods Faltantes**:
  - ❌ ContactForm (formulário de contato genérico)
  - ❌ ContactInfo (informações de contato)
  - ❌ MapLocation (mapa de localização)
  - ❌ SocialMedia (redes sociais)
- **Observações**: Precisa criar Mods específicos para funcionalidades de contato

---

## 🧩 Mods Criados (21 Total)

### Heroes (4)
1. ✅ Hero - Banner básico
2. ✅ HeroMission - Banner de missão
3. ✅ HeroWithAnimation - Banner com animação Lottie
4. ✅ HeroStructure - Banner para estrutura

### Conteúdo (9)
5. ✅ TextIntro - Introdução textual
6. ✅ TextWithAnimation - Texto com animação
7. ✅ TextImageAnimation - Texto + imagem + animação
8. ✅ TextWithQuote - Texto com citação
9. ✅ PillarsGrid - Grid de pilares/valores
10. ✅ SectionsGrid - Grid de seções
11. ✅ InfographicGrid - Infográfico em grid
12. ✅ OurLadyHeader - Cabeçalho Nossa Senhora
13. ✅ CallToAction - Chamada para ação

### Específicos (5)
14. ✅ EventsSection - Seção de eventos
15. ✅ Testimonials - Depoimentos
16. ✅ EvangelizationActions - Ações de evangelização
17. ✅ ProjectsShowcase - Showcase de projetos

### Vocacional (4)
18. ✅ VocationalBanner - Banner vocacional
19. ✅ FormationStages - Etapas de formação
20. ✅ QualitiesList - Lista de qualidades
21. ✅ VocationalContactForm - Formulário vocacional

---

## 🚀 Mods Faltantes (Por Criar)

### Alta Prioridade
- ❌ **ContactForm** - Formulário genérico de contato
- ❌ **ContactInfo** - Card com informações (telefone, email, endereço)
- ❌ **DonationForm** - Formulário de doação com PIX
- ❌ **MapLocation** - Mapa de localização (Google Maps)

### Média Prioridade
- ❌ **DonationTiers** - Níveis de contribuição
- ❌ **ImpactMetrics** - Métricas de impacto das doações
- ❌ **SocialMedia** - Links de redes sociais
- ❌ **TeamGrid** - Grid de membros da equipe

### Baixa Prioridade
- ❌ **Timeline** - Linha do tempo de história
- ❌ **FAQSection** - Perguntas frequentes
- ❌ **NewsletterSignup** - Inscrição em newsletter
- ❌ **Gallery** - Galeria de fotos

---

## 📝 Processo de Migração (Por Página)

### Passo 1: Análise
1. ✅ Ler conteúdo da página antiga
2. ✅ Identificar seções e componentes
3. ✅ Mapear Mods existentes que podem ser usados
4. ✅ Listar Mods faltantes que precisam ser criados

### Passo 2: Criar Mods Faltantes (se necessário)
1. ❌ Criar componente React
2. ❌ Criar config.ts com props editáveis
3. ❌ Adicionar no index.ts
4. ❌ Testar isoladamente

### Passo 3: Criar Página no CMS
1. ❌ Acessar `/app/dashboard/cms`
2. ❌ Criar nova página com slug correto
3. ❌ Adicionar blocos (Mods)
4. ❌ Configurar props de cada bloco
5. ❌ Salvar como rascunho

### Passo 4: Testes
1. ❌ Visualizar página em rascunho
2. ❌ Testar responsividade (mobile/tablet/desktop)
3. ❌ Verificar SEO (title, description)
4. ❌ Testar links e navegação
5. ❌ Validar conteúdo

### Passo 5: Publicação
1. ❌ Publicar página no CMS
2. ❌ Verificar renderização no site público
3. ❌ Atualizar este checklist
4. ❌ Documentar no commit

---

## 🎯 Ordem Recomendada de Migração

### Sprint 1 - Institucional (Semana 1-2)
1. 🔴 `/sobre` - Página institucional
2. 🔴 `/nossa-senhora` - Devoção mariana
3. 🟠 `/espritualidade` - Carisma

### Sprint 2 - Vocacional (Semana 3)
4. 🔴 `/vocacional` - Já tem todos os Mods prontos!

### Sprint 3 - Estrutura e Missão (Semana 4)
5. 🟠 `/estutura-vida` - Já tem todos os Mods prontos!
6. 🟠 `/acoes-projetos-evangelizacao` - Já tem todos os Mods prontos!

### Sprint 4 - Funcionalidades (Semana 5-6)
7. 🔴 `/doacoes` - Precisa criar Mods de doação
8. 🟡 `/contatos` - Precisa criar Mods de contato

---

## 📊 Métricas de Progresso

### Por Sprint
- **Sprint 1**: 0/3 páginas (0%)
- **Sprint 2**: 0/1 páginas (0%)
- **Sprint 3**: 0/2 páginas (0%)
- **Sprint 4**: 0/2 páginas (0%)

### Por Prioridade
- **Alta (🔴)**: 0/4 páginas (0%)
- **Média (🟠)**: 0/3 páginas (0%)
- **Baixa (🟡)**: 0/1 páginas (0%)

### Mods
- **Existentes**: 21/21 (100%)
- **Faltantes**: 12 identificados

---

## 🔗 Referências

### Documentação
- [ROADMAP.md](../ROADMAP.md) - Roadmap geral do projeto
- [CMS_HOME_PAGE_EDITABLE.md](./guides/CMS_HOME_PAGE_EDITABLE.md) - Como editar home
- [NEXT_STEPS_CMS.md](./guides/NEXT_STEPS_CMS.md) - Próximos passos
- [CMS_ADMIN_GUIDE.md](./guides/CMS_ADMIN_GUIDE.md) - Guia do admin

### Arquivos Importantes
- `src/components/mods/index.ts` - Lista de Mods disponíveis
- `src/_config/routes_main.ts` - Rotas do site público
- `repositor/main-content.json` - Conteúdo atual da home

---

## ✅ Checklist de Validação (Por Página)

Ao migrar uma página, verificar:

- [ ] Todos os Mods necessários criados
- [ ] Página criada no CMS com slug correto
- [ ] Todos os blocos adicionados e configurados
- [ ] Conteúdo revisado e aprovado
- [ ] Imagens otimizadas (Next.js Image)
- [ ] Links internos funcionando
- [ ] SEO configurado (title, description, OG)
- [ ] Responsividade testada (mobile/tablet/desktop)
- [ ] Performance aceitável (Lighthouse > 90)
- [ ] Página publicada no CMS
- [ ] Arquivo antigo movido para `/old` (se ainda não estiver)
- [ ] Documentação atualizada
- [ ] Checklist atualizado

---

## 🎉 Quando Concluir

Ao finalizar todas as migrações:

1. ✅ Remover pasta `src/app/(main)/old/`
2. ✅ Atualizar documentação geral
3. ✅ Criar guia de manutenção para editores
4. ✅ Fazer treinamento com equipe
5. ✅ Comemorar! 🎊

---

**Última Verificação**: 2025-11-30
**Responsável**: Claude Code + Willian Quintino
