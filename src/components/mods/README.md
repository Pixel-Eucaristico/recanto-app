# Mods CMS - Biblioteca de Componentes

Este diretório contém todos os **Mods** (componentes modulares) do CMS Headless do Recanto.

## O que são Mods?

Mods são componentes React reutilizáveis que podem ser combinados para criar páginas dinâmicas. Cada Mod tem:

1. **Componente React** (`ModName.tsx`) - Renderização visual
2. **Configuração** (`config.ts`) - Define props editáveis no admin
3. **Props Interface** - Tipagem TypeScript das props

## Estrutura de um Mod

```
/components/mods/
├── Hero/
│   ├── Hero.tsx          # Componente React
│   └── config.ts         # Configuração do editor
├── Gallery/
├── ContactForm/
└── index.ts              # Export central
```

## Como Criar um Novo Mod

### 1. Criar Diretório e Componente

```tsx
// src/components/mods/MeuMod/MeuMod.tsx
interface MeuModProps {
  titulo: string;
  descricao?: string;
}

export default function MeuMod({ titulo, descricao }: MeuModProps) {
  return (
    <section className="py-16">
      <h2>{titulo}</h2>
      {descricao && <p>{descricao}</p>}
    </section>
  );
}
```

### 2. Criar Configuração

```ts
// src/components/mods/MeuMod/config.ts
import { ModConfig } from '@/types/cms-types';

export const MeuModConfig: ModConfig = {
  id: 'MeuMod',
  name: 'Meu Componente',
  description: 'Descrição do componente',
  icon: 'box',
  category: 'content',
  props: [
    {
      key: 'titulo',
      label: 'Título',
      type: 'text',
      required: true
    },
    {
      key: 'descricao',
      label: 'Descrição',
      type: 'textarea'
    }
  ]
};
```

### 3. Adicionar ao Index

```ts
// src/components/mods/index.ts
import MeuMod from './MeuMod/MeuMod';
import { MeuModConfig } from './MeuMod/config';

export const ModComponents = {
  Hero,
  MeuMod,  // ← Adicionar aqui
  // ...
};

export const ModConfigs = {
  Hero: HeroConfig,
  MeuMod: MeuModConfig,  // ← Adicionar aqui
  // ...
};
```

## Tipos de Props Disponíveis

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `text` | Input de texto simples | Nome, título |
| `textarea` | Área de texto maior | Descrição longa |
| `select` | Dropdown com opções | Tema, categoria |
| `number` | Input numérico | Quantidade, preço |
| `boolean` | Checkbox | Mostrar/ocultar |
| `json-editor` | Editor JSON | Arrays, objetos |
| `image` | Upload de imagem | URL ou arquivo |
| `color` | Seletor de cor | Cor de fundo |
| `date` | Seletor de data | Data de evento |

## Categorias de Mods

- **hero** - Seções de destaque (Hero, Banner)
- **content** - Conteúdo textual (About, Features)
- **chart** - Gráficos (Echarts, Chart.js)
- **gallery** - Galerias de imagens
- **form** - Formulários (Contato, Inscrição)
- **testimonial** - Depoimentos
- **cta** - Call-to-Action
- **other** - Outros

## Boas Práticas

### ✅ Fazer

- Usar TypeScript para todas as props
- Documentar componentes com JSDoc
- Usar Tailwind CSS + DaisyUI para estilos
- Tornar componentes responsivos
- Validar props com `required: true`

### ❌ Evitar

- Lógica de negócio complexa nos Mods
- Props não documentadas
- Estilos inline (usar classes)
- Componentes muito específicos (dificulta reutilização)

## Mods Disponíveis

### Hero
**Categoria:** hero
**Descrição:** Seção de destaque com título, subtítulo, imagem e CTA
**Props:** `title`, `subtitle`, `theme`, `imageUrl`, `ctaText`, `ctaLink`

---

**Última atualização:** 2025-11-15
