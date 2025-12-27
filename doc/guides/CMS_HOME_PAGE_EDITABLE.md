# 🏠 Home Page Editável pelo CMS

## 🎯 Problema Resolvido

Dois problemas foram corrigidos:

1. ❌ **Erro**: `contentPageService.getAll is not a function`
2. ❌ **Limitação**: Home page era estática e não podia ser editada pelo CMS

## ✅ Solução Implementada

### 1. Método `getAll()` Adicionado

**Arquivo**: `src/services/firebase/ContentPageService.ts`

```typescript
/**
 * Listar todas as páginas
 * Alias para list() com ordenação por data de criação
 */
async getAll(): Promise<CMSPage[]> {
  return this.list('created_at', 'desc');
}
```

---

### 2. Home Page Agora é Editável

**Arquivo**: `src/app/(main)/page.tsx`

A home page agora tem **dois modos de renderização**:

#### Modo 1: CMS (se existir página com slug `/`)
- Se você criar uma página no CMS com slug `/` e publicá-la
- A home page será renderizada usando os blocos (Mods) do CMS
- Totalmente customizável pelo editor visual

#### Modo 2: Página Estática (fallback)
- Se não existir página CMS com slug `/` ou não estiver publicada
- Renderiza a página estática tradicional (`MainPage`)
- Mantém compatibilidade com o sistema antigo

---

## 🚀 Como Editar a Home Page pelo CMS

### Passo 1: Acessar o CMS

1. Faça login no dashboard: `/app/login`
2. Clique em **"Gerenciar Site"** no menu

---

### Passo 2: Criar Página Home

1. Clique em **"Nova Página"**
2. Preencha:
   - **Título**: "Página Inicial" (ou "Home")
   - **Slug**: `/` (apenas a barra, sem texto)
   - **Descrição**: "Página inicial da comunidade"
3. Clique em **"Criar e Editar Página"**

---

### Passo 3: Adicionar Blocos

Agora você pode adicionar os blocos desejados:

**Exemplo de estrutura típica de home page:**

1. **Hero** (banner principal)
   - Título: "Bem-vindo ao Recanto do Amor Misericordioso"
   - Subtítulo: "Comunidade Católica de Aliança e Vida"
   - CTA: "Conheça Nossa Missão"
   - Imagem de fundo

2. **About Section** (quando criar o Mod)
   - Breve apresentação da comunidade

3. **Recent Events** (quando criar o Mod)
   - Próximos eventos e retiros

4. **Testimonials** (quando criar o Mod)
   - Depoimentos de membros

5. **CTA Section** (quando criar o Mod)
   - Chamada para ação (participar de retiro, etc.)

---

### Passo 4: Publicar

1. Configure todos os blocos
2. Clique no botão **"👁️ Rascunho"** para mudar para **"✅ Publicada"**
3. Clique em **"💾 Salvar Alterações"**
4. Acesse `http://localhost:3000/` para ver a nova home page!

---

## 🔄 Comportamento do Sistema

### Quando EXISTE página CMS com slug `/` e está PUBLICADA

```
http://localhost:3000/
    ↓
Busca no Firestore: slug = "/"
    ↓
✅ Encontrou página CMS
    ↓
Renderiza blocos (Mods) configurados no editor
```

**Resultado**: Home page totalmente customizável pelo CMS

---

### Quando NÃO EXISTE página CMS com slug `/` ou está em RASCUNHO

```
http://localhost:3000/
    ↓
Busca no Firestore: slug = "/"
    ↓
❌ Não encontrou OU está em rascunho
    ↓
Renderiza <MainPage /> tradicional
```

**Resultado**: Home page estática (comportamento antigo)

---

## 📊 Diagrama de Fluxo

```
┌─────────────────────────────────────┐
│   Usuário acessa http://localhost:3000/   │
└────────────────┬────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │ Buscar página CMS (slug /) │
    └────────────┬───────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
  ✅ Encontrou      ❌ Não Encontrou
  E Publicada       OU Rascunho
        │                 │
        ▼                 ▼
 Renderiza Mods    Renderiza MainPage
  do CMS             (Estática)
```

---

## 🎨 Vantagens da Solução

### ✅ Backward Compatible
- Não quebra o sistema existente
- Se não criar página CMS, funciona como antes
- Migração gradual e segura

### ✅ Flexível
- Pode alternar entre CMS e estático facilmente
- Apenas despublicar página CMS volta ao modo estático
- Pode testar no rascunho antes de publicar

### ✅ Editável
- Administradores editam a home sem código
- Adicionar, remover, reordenar blocos
- Preview instantâneo salvando e recarregando

### ✅ Performático
- Next.js Server Components
- Busca otimizada no Firestore
- Cache automático do Next.js

---

## 📝 Exemplo de Uso

### Antes (Estático)

```tsx
// src/app/(main)/page.tsx
export default function Home() {
  return <MainPage />; // Sempre renderiza o mesmo
}
```

**Problema**: Para mudar a home, precisa editar código e fazer deploy

---

### Depois (CMS ou Estático)

```tsx
// src/app/(main)/page.tsx
export default async function Home() {
  const cmsPage = await contentPageService.getBySlug('/');

  if (cmsPage && cmsPage.is_published) {
    return <CMSRenderer blocks={cmsPage.blocks} />;
  }

  return <MainPage />;
}
```

**Benefício**: Administradores editam a home pelo dashboard, sem deploy!

---

## 🧪 Testando a Nova Funcionalidade

### Teste 1: Modo Estático (Padrão)

1. Acesse `http://localhost:3000/`
2. Você verá a `MainPage` tradicional
3. ✅ Funciona como antes

---

### Teste 2: Criar Home Page no CMS

1. Acesse `/app/dashboard/cms`
2. Clique em "Nova Página"
3. **Slug**: `/`
4. Adicione blocos Hero
5. Configure os blocos
6. **NÃO PUBLIQUE** ainda (deixe como rascunho)
7. Salve
8. Acesse `http://localhost:3000/`
9. ✅ Ainda vê a `MainPage` estática (porque está em rascunho)

---

### Teste 3: Publicar Home Page do CMS

1. Volte ao editor da página `/`
2. Clique em "Publicar"
3. Salve
4. Recarregue `http://localhost:3000/`
5. ✅ Agora vê a página CMS com os blocos que configurou!

---

### Teste 4: Despublicar para Voltar ao Estático

1. Volte ao editor
2. Clique em "Rascunho" (despublicar)
3. Salve
4. Recarregue `http://localhost:3000/`
5. ✅ Volta a ver a `MainPage` estática

---

## 🔧 Arquivos Modificados

### 1. ContentPageService.ts

```diff
+ /**
+  * Listar todas as páginas
+  * Alias para list() com ordenação por data de criação
+  */
+ async getAll(): Promise<CMSPage[]> {
+   return this.list('created_at', 'desc');
+ }
```

**Motivo**: O componente chamava `getAll()` mas o método não existia

---

### 2. src/app/(main)/page.tsx

```diff
+ import { contentPageService } from "@/services/firebase";
+ import { ModComponents } from "@/components/mods";

+ export const dynamic = 'force-dynamic';

+ export async function generateMetadata(): Promise<Metadata> {
+   const cmsPage = await contentPageService.getBySlug('/');
+   // ... metadata dinâmica
+ }

  export default async function Home() {
+   const cmsPage = await contentPageService.getBySlug('/');
+
+   if (cmsPage && cmsPage.is_published) {
+     return <CMSRenderer blocks={cmsPage.blocks} />;
+   }
+
    return <MainPage />;
  }
```

**Motivo**: Tornar a home page editável pelo CMS

---

## 🎓 Próximos Passos

Agora que a home page é editável, você pode:

### 1. Criar Mods Específicos para Home

Mods que fazem sentido na home page:
- ✅ Hero (já existe)
- ⬜ **FeaturedEvents** - Eventos em destaque
- ⬜ **CommunityStats** - Estatísticas da comunidade
- ⬜ **RecentTestimonials** - Depoimentos recentes
- ⬜ **CallToAction** - Chamada para participar de retiro
- ⬜ **NewsletterSignup** - Inscrição em newsletter
- ⬜ **UpcomingRetreats** - Próximos retiros

### 2. Página "Sobre" Editável

Aplicar o mesmo padrão para `/sobre`:

```tsx
// src/app/(main)/sobre/page.tsx
export default async function AboutPage() {
  const cmsPage = await contentPageService.getBySlug('/sobre');

  if (cmsPage && cmsPage.is_published) {
    return <CMSRenderer blocks={cmsPage.blocks} />;
  }

  return <AboutPageStatic />;
}
```

### 3. Todas as Páginas Editáveis

Fazer o mesmo para:
- `/espiritualidade`
- `/doacoes`
- `/contatos`
- `/galeria`
- etc.

---

## 🐛 Troubleshooting

### Problema: Home page não muda após publicar

**Causa**: Cache do Next.js

**Solução**:
1. Recarregue a página com `Ctrl + Shift + R` (hard refresh)
2. Ou limpe o cache: `rm -rf .next` e reinicie o servidor

---

### Problema: Erro "getBySlug is not a function"

**Causa**: Service não foi importado corretamente

**Solução**: Verifique o import:
```tsx
import { contentPageService } from "@/services/firebase";
```

---

### Problema: Blocos não aparecem na home page

**Causa 1**: Página não está publicada

**Solução**: Clique em "Publicar" no editor

**Causa 2**: Slug está errado

**Solução**: Verifique se o slug é exatamente `/` (apenas a barra)

---

## ✨ Conclusão

Agora você tem um **sistema CMS completo** onde:

✅ **Home page é editável** pelo dashboard
✅ **Sem necessidade de deploy** para mudar o conteúdo
✅ **Backward compatible** com o sistema antigo
✅ **Flexível** - pode ativar/desativar CMS facilmente
✅ **Escalável** - fácil aplicar para outras páginas

**Próximo teste**: Criar uma home page pelo CMS e ver ela funcionando! 🎉
