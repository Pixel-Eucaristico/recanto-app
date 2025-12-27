### Conteúdo Completo para `docs/STATE-MANAGEMENT.md`

````markdown
# 💡 Estratégia de Gerenciamento de Estado (Jotai)

Paz e Unção!

Este documento explica como o estado da nossa aplicação é gerenciado. Adotamos o **Jotai**, uma biblioteca de gerenciamento de estado minimalista e otimista, que se alinha perfeitamente com a nossa arquitetura de monorepo e a necessidade de um desenvolvedor solo.

## 1. Princípios de Organização

A gestão de estado é centralizada e modular. Os átomos (as unidades de estado do Jotai) são organizados de forma clara e por responsabilidade.

-   **Pastas por Recurso:** Mantenha os arquivos de estado em uma pasta dedicada, como `src/state/`.
-   **Nomenclatura Clara:** Nomeie os arquivos e os átomos de forma semântica, como `authState.ts` ou `themeAtom.ts`.
-   **Granularidade Otimizada:** Evite criar um átomo para cada valor. Prefira criar **objetos atômicos** para agrupar informações relacionadas (ex: `userAtom` para `id`, `name` e `email` do usuário).

## 2. Tipos de Átomos e Uso

### ✅ Átomos Base (`atom`)

Use para estados simples e isolados.

```typescript
// src/state/themeState.ts
import { atom } from 'jotai';

export const themeAtom = atom<'light' | 'dark'>('light');
````

### ✅ Átomos Derivados (`atom(get => ...)`)

Use para criar estado que é derivado de outros átomos. Isso evita duplicação de lógica e garante que o estado seja sempre consistente.

```typescript
// src/state/userState.ts
import { atom } from 'jotai';
import { authAtom } from './authState';

// Um seletor de átomo que apenas retorna o nome do usuário, se ele estiver logado.
export const userNameAtom = atom((get) => get(authAtom)?.name || 'Visitante');
```

### ✅ Átomos com Persistência (`atomWithStorage`)

Para dados que precisam ser persistidos no armazenamento local (como token de autenticação ou preferências de tema), use o `atomWithStorage` do pacote `jotai/utils`.

```typescript
// src/state/authState.ts
import { atomWithStorage } from 'jotai/utils';

interface AuthState {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// O estado de autenticação será persistido no localStorage
export const authAtom = atomWithStorage<AuthState | null>('auth', null);
```

### 3. Boas Práticas

  - **Evite Lógica Complexa nos Componentes:** Mova a lógica de manipulação de estado para dentro dos átomos ou para hooks customizados que utilizem o Jotai.
  - **Separação de Preocupações:** Os átomos devem ser responsáveis apenas por manter o estado. As chamadas à API, validações e outras lógicas de negócio devem residir em `services` ou `hooks`, para manter o código limpo e testável.

Ao seguir estas diretrizes, garantimos que o gerenciamento de estado seja claro, escalável e fácil de manter por um desenvolvedor solo.

Paz e Unção!