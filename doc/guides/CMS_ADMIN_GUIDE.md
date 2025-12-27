# 🎨 Guia do CMS Admin Modular

## 📋 Sumário
- [Visão Geral](#visão-geral)
- [Acesso ao Sistema](#acesso-ao-sistema)
- [Workflow Completo](#workflow-completo)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Criando Novos Mods](#criando-novos-mods)

---

## 🎯 Visão Geral

O **CMS Admin Modular** é um sistema completo de gerenciamento de conteúdo que permite criar e editar páginas personalizadas usando blocos modulares (Mods).

### Principais Recursos

✅ **Gerenciamento de Páginas**
- Criar, editar e excluir páginas
- Publicar/despublicar páginas
- URLs personalizadas (slugs)
- Meta tags para SEO

✅ **Editor Visual**
- Biblioteca de blocos (Mods) disponíveis
- Adicionar blocos com um clique
- Configurar props de cada bloco via formulários dinâmicos
- Reordenar blocos com drag-and-drop (arraste o ícone ≡)
- Editor visual de depoimentos com accordion
- Preview em tempo real

✅ **Sistema Modular**
- Mods são componentes React reutilizáveis
- Configurações definidas em arquivos `config.ts`
- Formulários gerados dinamicamente
- Fácil adicionar novos Mods

---

## 🔐 Acesso ao Sistema

### Rotas Criadas

| Rota | Descrição |
|------|-----------|
| `/app/dashboard/cms` | Lista todas as páginas CMS |
| `/app/dashboard/cms/new` | Criar nova página |
| `/app/dashboard/cms/[pageId]/edit` | Editor visual de página |
| `/app/dashboard/main-content` | CMS antigo (página principal estática) |

### Permissões

O acesso ao CMS está restrito aos roles:
- `admin` ✅
- `missionario` ✅

---

## 🚀 Workflow Completo

### Teste 1: Iniciar o Servidor

```bash
npm run dev
```

Acesse: http://localhost:3000

---

### Teste 2: Fazer Login no Dashboard

1. Vá para http://localhost:3000/app/login
2. Faça login com usuário `admin` ou `missionario`
3. Acesse o Dashboard

---

### Teste 3: Acessar o CMS

1. No menu lateral do dashboard, clique em **"Gerenciar Site"**
2. Você será redirecionado para `/app/dashboard/cms`
3. Deve ver a lista de páginas (vazia inicialmente)

---

### Teste 4: Criar Nova Página

1. Clique no botão **"Nova Página"** (canto superior direito)
2. Preencha o formulário:
   - **Título:** "Teste CMS Modular"
   - **Slug:** "teste-cms" (será convertido automaticamente para `/teste-cms`)
   - **Descrição:** "Página de teste do sistema modular"
3. Clique em **"Criar e Editar Página"**
4. Você será redirecionado para o editor

---

### Teste 5: Adicionar Blocos (Mods)

No **Editor de Página**:

1. **Biblioteca de Blocos (lateral esquerda)**
   - Veja o Mod "Hero" disponível
   - Clique nele para adicionar à página

2. **Bloco Adicionado**
   - O bloco aparece na área central
   - Clique em **"Editar"** para expandir as configurações

3. **Configurar Props**
   - **Título:** "Bem-vindo ao CMS Modular!"
   - **Subtítulo:** "Sistema funcionando perfeitamente"
   - **Tema:** Escolha entre primary, secondary, accent
   - **CTA Text:** "Saiba Mais"
   - **CTA Link:** "/sobre"
   - **Image URL:** `https://images.unsplash.com/photo-1438032005730-c779502df39b`

4. Clique em **"Fechar"** para recolher o editor

---

### Teste 6: Reordenar Blocos

1. Adicione mais um bloco Hero (repita o Teste 5)
2. Use os botões **↑** e **↓** para reordenar os blocos
3. Observe a mudança na ordem

---

### Teste 7: Remover Bloco

1. Clique no botão **🗑️ (lixeira)** em um bloco
2. Confirme a remoção
3. O bloco é removido da lista

---

### Teste 8: Publicar e Salvar

1. Clique no botão **"👁️ Rascunho"** para publicar
   - O status muda para **"✅ Publicada"**
2. Clique em **"💾 Salvar Alterações"**
3. Aguarde a mensagem de sucesso

---

### Teste 9: Ver Página Pública

1. Abra uma nova aba
2. Acesse: http://localhost:3000/teste-cms
3. Você deve ver a página renderizada com os blocos que configurou
4. Verifique:
   - ✅ Hero renderizado corretamente
   - ✅ Título, subtítulo e botão funcionando
   - ✅ Imagem de fundo carregada
   - ✅ Tema aplicado (cores)

---

### Teste 10: Voltar e Editar

1. Volte para `/app/dashboard/cms`
2. Clique em **"Editar"** na página criada
3. Faça alterações nos blocos
4. Salve novamente
5. Recarregue a página pública para ver as mudanças

---

## 📂 Estrutura de Arquivos

### Componentes do CMS

```
src/
├── app/(app)/app/dashboard/
│   ├── cms/
│   │   ├── page.tsx                     # Lista de páginas
│   │   ├── new/page.tsx                 # Criar nova página
│   │   └── [pageId]/edit/page.tsx       # Editor de página
│   └── main-content/
│       └── page.tsx                     # CMS antigo (migrado)
│
├── components/
│   ├── cms-editor/
│   │   ├── BlockEditor.tsx              # Editor de bloco individual
│   │   ├── DynamicModForm.tsx           # Formulários dinâmicos
│   │   ├── ModsLibrary.tsx              # Biblioteca lateral de Mods
│   │   └── index.ts
│   │
│   └── mods/
│       ├── Hero/
│       │   ├── Hero.tsx                 # Componente Hero
│       │   └── config.ts                # Configuração do Hero
│       ├── index.ts                     # Index central dos Mods
│       └── README.md
│
├── services/firebase/
│   ├── ContentPageService.ts            # CRUD de páginas
│   ├── ModConfigService.ts              # CRUD de configs
│   └── index.ts
│
└── types/
    └── cms-types.ts                     # Tipos do CMS
```

---

## 🔧 Criando Novos Mods

Quer adicionar um novo bloco? Siga este guia:

### Passo 1: Criar o Componente React

Crie `src/components/mods/Gallery/Gallery.tsx`:

```tsx
import React from 'react';

interface GalleryProps {
  title: string;
  images: string[];
  columns?: number;
}

export default function Gallery({ title, images, columns = 3 }: GalleryProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
        <div className={`grid grid-cols-${columns} gap-4`}>
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Gallery ${index + 1}`}
              className="w-full h-64 object-cover rounded"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

### Passo 2: Criar a Configuração

Crie `src/components/mods/Gallery/config.ts`:

```typescript
import { ModConfig } from '@/types/cms-types';

export const GalleryConfig: ModConfig = {
  id: 'Gallery',
  name: 'Galeria de Imagens',
  description: 'Galeria responsiva de imagens em grid',
  category: 'gallery',
  props: [
    {
      name: 'title',
      label: 'Título da Galeria',
      type: 'string',
      required: true,
      default: 'Nossa Galeria',
      placeholder: 'Digite o título...'
    },
    {
      name: 'images',
      label: 'URLs das Imagens (separadas por vírgula)',
      type: 'string',
      multiline: true,
      required: true,
      default: '',
      placeholder: 'https://exemplo.com/img1.jpg,https://exemplo.com/img2.jpg'
    },
    {
      name: 'columns',
      label: 'Número de Colunas',
      type: 'number',
      required: false,
      default: 3,
      description: 'Quantidade de imagens por linha (1-4)'
    }
  ]
};
```

---

### Passo 3: Registrar no Index

Edite `src/components/mods/index.ts`:

```typescript
import Gallery from './Gallery/Gallery';
import { GalleryConfig } from './Gallery/config';

export const ModComponents = {
  Hero,
  Gallery, // ← Adicionar
} as const;

export const ModConfigs: Record<string, ModConfig> = {
  Hero: HeroConfig,
  Gallery: GalleryConfig, // ← Adicionar
};
```

---

### Passo 4: Testar

1. Reinicie o servidor (`npm run dev`)
2. Acesse o editor de uma página
3. O Mod **"Galeria de Imagens"** aparecerá na biblioteca
4. Clique para adicionar e configure!

---

## 🎓 Próximos Passos

Depois de validar o sistema funcionando, você pode:

### Fase 4.1: Adicionar Mais Mods

Crie blocos para:
- ✅ Hero (já implementado)
- ⬜ RecentEvents (Eventos Recentes)
- ⬜ AboutSection (Seção Sobre Nós)
- ⬜ CTASection (Call-to-Action)
- ⬜ ValuesGrid (Grade de Valores)
- ⬜ TeamGrid (Grade da Equipe)
- ⬜ Gallery (Galeria de Fotos)
- ⬜ ChartBlock (Gráficos)
- ⬜ ContactForm (Formulário de Contato)
- ✅ Testimonials (Depoimentos) - **Editor visual implementado!**

### Editor de Depoimentos

O bloco **Testimonials** possui editor visual especial:

1. **Accordion DaisyUI** - Cada depoimento em painel colapsável
2. **Drag-and-drop** - Arraste pelo ícone ≡ para reordenar
3. **Preview em tempo real** - Veja nome e função no título
4. **Campos intuitivos**:
   - Nome *
   - Função/Papel *
   - URL do Avatar (com preview)
   - Depoimento *
   - Data

**Como usar:**
1. Adicione o bloco "Depoimentos da Comunidade"
2. Clique em "Editar"
3. Clique em "+ Adicionar" para novo depoimento
4. Preencha os campos
5. Arraste o ≡ para reordenar
6. Clique em "Salvar Alterações"

---

## 🐛 Problemas Conhecidos

### Erro: "Mod não encontrado"

**Causa:** O Mod não está registrado no `index.ts`

**Solução:** Adicione o Mod no arquivo `src/components/mods/index.ts`

---

### Erro: "Cannot read property 'props' of undefined"

**Causa:** A configuração do Mod não foi encontrada

**Solução:** Verifique se o `config.ts` do Mod está exportado corretamente

---

### Página não renderiza no frontend

**Causa 1:** Página não está publicada

**Solução:** Clique em "Publicar" no editor

**Causa 2:** Slug incorreto

**Solução:** Verifique se o slug começa com `/` e corresponde à URL acessada

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique o console do navegador (F12)
2. Verifique os logs do terminal do Next.js
3. Confira se todos os services Firebase estão funcionando
4. Verifique se o Firestore tem a collection `content_pages`

---

**Pronto! Seu CMS Admin Modular está completo e funcional! 🎉**

Teste todos os workflows acima e me avise se encontrar algum problema ou se quiser adicionar novas funcionalidades!
