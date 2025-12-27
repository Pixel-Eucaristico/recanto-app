### ✅ Sistema de estilo consistente (Consistent styling system)

> Mantenha a **identidade visual da aplicação unificada** e a experiência de desenvolvimento organizada com **SCSS Modules**, temas globais e estilos isolados por componente ou feature.

---

## 🎨 Por que um sistema de estilo consistente?

Aplicações grandes precisam manter:

* **Visual padronizado**
* **Escalabilidade no design**
* **Manutenção simplificada**

Estilos misturados e sem padrão (inline, global, por componente, diferentes sintaxes) causam:

* Conflitos de CSS
* Temas inconsistentes
* Dificuldade para manutenção ou refatoração

---

## 🧱 A solução: SCSS Modules com temas globais

### ✅ O que são **SCSS Modules**?

* Escopam o CSS por componente (evitam conflitos)
* Permitem **nomes reutilizáveis** (como `.container`) sem sobrescrever outros estilos
* Têm **autocompletar e verificação de tipos** no TypeScript (com bibliotecas como `typed-scss-modules`)

---

## 📁 Estrutura recomendada

```
styles/
├── global.scss                ← Estilos base aplicados globalmente
└── variables.module.scss      ← Variáveis globais (cores, espaçamento, fontes)
```

E por componente/feature:

```
features/products/ProductCard.module.scss
components/common/Button.module.scss
```

---

## 🎯 Exemplo de `variables.module.scss`

```scss
// styles/variables.module.scss

:root {
  --color-primary: #1e40af;
  --color-secondary: #facc15;
  --color-background: #f9fafb;

  --font-body: 'Inter', sans-serif;
  --border-radius: 8px;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
}
```

Isso fornece uma **base visual consistente** e facilita o uso de temas.

---

## 📦 Exemplo de `global.scss`

```scss
// styles/global.scss

@import './variables.module.scss';

body {
  font-family: var(--font-body);
  background-color: var(--color-background);
  margin: 0;
  padding: 0;
  color: #111;
}

* {
  box-sizing: border-box;
}
```

Esse arquivo é importado uma única vez, geralmente no `App.tsx` ou no `_app.tsx` (caso use Next.js):

```tsx
import "@/styles/global.scss";
```

---

## 🧩 Exemplo de uso em componente com SCSS Module

```tsx
// Button.tsx
import styles from "./Button.module.scss";

export const Button = ({ children }) => {
  return <button className={styles.primary}>{children}</button>;
};
```

```scss
// Button.module.scss
.primary {
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
}
```

✅ Esse estilo é aplicado **somente nesse componente**, sem risco de conflito com outros `.primary` da aplicação.

---

## 🧪 Vantagens dessa abordagem

| Vantagem                     | Benefício                                          |
| ---------------------------- | -------------------------------------------------- |
| 🎨 Consistência visual       | Mesmas cores, fontes e espaçamentos em toda a UI   |
| 🧼 Organização               | Cada componente tem seus próprios estilos isolados |
| ⚙️ Escalabilidade            | Fácil trocar o tema ou alterar valores globais     |
| 🚫 Sem conflito de classes   | SCSS Modules criam nomes únicos automaticamente    |
| 🧪 Testabilidade e segurança | Tipagem e escopo local facilitam manutenção        |

---

## 💡 Dica extra: Suporte a temas dinâmicos

Você pode criar arquivos como:

```
styles/themes/dark.scss
styles/themes/light.scss
```

E aplicar dinamicamente via classes no `<body>` ou com `:root`.

---

## ✅ Em resumo

Um sistema de estilo consistente com SCSS Modules:

* Mantém a aplicação padronizada e bonita
* Separa estilos de forma clara por componente
* Permite trocas rápidas de tema e design tokens
* Ajuda a evitar bugs visuais e conflitos de CSS