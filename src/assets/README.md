### ✅ Organização de ativos e configuração (Assets and config organization)

> Mantenha **tudo que for estático ou configurável** da aplicação em pastas bem definidas como `assets/` e `config/`. Isso ajuda na escalabilidade, facilita manutenções e mantém o código limpo e sem "hard-codes".

---

## 🧱 Por que separar ativos e configurações?

Separar arquivos estáticos e configurações do restante da lógica da aplicação oferece:

* **Centralização**: ajustes em um só lugar (ex: rotas, temas, caminhos)
* **Organização visual**: diretórios limpos e fáceis de navegar
* **Redução de duplicações**: evita constantes `import` repetidos ou valores fixos espalhados
* **Escalabilidade**: novas rotas, ícones ou assets são adicionados de forma padronizada

---

## 📁 Estrutura recomendada

```
src/
├── assets/
│   ├── images/
│   │   └── logo.png
│   ├── icons/
│   │   └── home.svg
│   └── fonts/
│       └── Inter.ttf
├── config/
│   ├── routes.ts
│   ├── constants.ts
│   └── theme.ts
```

---

## 📦 assets/ — Arquivos estáticos

Essa pasta abriga tudo que **não muda em tempo de execução** e é **carregado pela aplicação**:

| Tipo                | Exemplo                            |
| ------------------- | ---------------------------------- |
| Imagens             | `logo.png`, `background.jpg`, etc. |
| Ícones SVG          | `edit.svg`, `delete.svg`           |
| Fontes customizadas | `Inter.ttf`, `Roboto.woff`         |
| Vídeos/áudios       | `intro.mp4`, `notific.mp3`         |

### Exemplo de import:

```tsx
import Logo from "@/assets/images/logo.png";
<img src={Logo} alt="Logo" />;
```

> Para SVGs, você pode usar como React components com `vite-plugin-svgr` ou `@svgr/webpack`.

---

## ⚙ config/ — Configurações centralizadas

Contém arquivos com **valores fixos, constantes globais e rotas nomeadas**.

### `config/routes.ts`

```ts
// config/routes.ts

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  PRODUCTS: "/products",
};
```

➡️ Agora, ao invés de usar `/dashboard` em todo lugar, você usa:

```tsx
import { ROUTES } from "@/config/routes";
<Link to={ROUTES.DASHBOARD}>Ir para dashboard</Link>
```

---

### `config/constants.ts`

```ts
// config/constants.ts

export const APP_NAME = "Meu App";
export const API_TIMEOUT = 10000;
```

### `config/theme.ts`

```ts
export const COLORS = {
  primary: "#1e40af",
  secondary: "#facc15",
  background: "#f9fafb",
};
```

---

## 🔐 Configurações de ambiente

Além disso, valores dinâmicos (como API URL) ficam em `.env`:

```env
VITE_API_URL=https://api.seudominio.com
```

E você consome com:

```ts
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## 🎯 Benefícios dessa organização

| Vantagem            | Benefício                                                      |
| ------------------- | -------------------------------------------------------------- |
| 📦 Reutilização     | Imagens, rotas e cores centralizadas                           |
| 🔄 Escalabilidade   | Novos arquivos e configurações seguem o padrão                 |
| 🧠 Clareza          | Equipe sabe exatamente onde encontrar ícones, rotas ou valores |
| ✨ Limpeza de código | Nada de strings hardcoded nos componentes                      |
| 📁 Estrutura limpa  | Separação clara entre lógica, estilo e recursos                |

---

## ✅ Em resumo

A organização em `assets/` e `config/` permite que você:

* Tenha **rotas nomeadas**, **cores globais**, e **constantes** em um só lugar
* Trabalhe com **imagens e ícones reutilizáveis** facilmente
* Mantenha a aplicação **modular, previsível e bem estruturada**