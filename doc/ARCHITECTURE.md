# Arquitetura de Software do Recanto Digital

Paz e Unção!

Este documento detalha a arquitetura de software e as escolhas de tecnologia do projeto, com o objetivo de fornecer clareza, guiar o desenvolvimento e facilitar a colaboração.

## 1. Visão Geral e Princípios Arquiteturais

Acreditamos que uma arquitetura bem definida é a base para um projeto durável e escalável. Nosso projeto foi desenhado com os seguintes princípios em mente:

-   **API-First:** O backend, hospedado no Supabase, é a única fonte de verdade para os dados. Ele é desacoplado do frontend, garantindo que o mesmo backend possa ser utilizado no futuro para as plataformas mobile (Android/iOS) sem reescrita de código.
-   **Eficiência e Baixa Manutenção:** A pilha de tecnologia foi escolhida para otimizar o tempo de um desenvolvedor solo. Soluções como Supabase (BaaS) e Vercel (PaaS) reduzem drasticamente a carga de infraestrutura e DevOps.
-   **Reutilização e Modularidade:** O código é estruturado em módulos e componentes, com uma forte separação de responsabilidades (UI ≠ Lógica ≠ API), o que facilita a manutenção e a adição de novas funcionalidades.

## 2. Ferramentas e Boas Práticas (Detalhado)

### 🧩 **Componentes e UI**

A base da nossa interface de usuário é o React. Para acelerar o desenvolvimento e manter a consistência, utilizamos as seguintes bibliotecas:

#### ✅ [DaisyUI](https://daisyui.com) e [Tailwind CSS](https://tailwindcss.com)

* **Evite misturar componentes da UI com lógica complexa.** Extraia a lógica para hooks.
* Use as classes do DaisyUI via constantes ou [Tailwind Variants](https://www.tailwind-variants.org), para evitar duplicação e facilitar a manutenção.
* Crie uma **pasta `components/ui/`** com wrappers padronizados se precisar adaptar ou extender os componentes.

#### ✅ [shadcn/ui](https://ui.shadcn.com)

* **Crie componentes adaptados em `components/ui/`**, com nomes de domínio da aplicação (ex: `UserDropdown`).
* Utilize o `className` e o `variant` pattern com `tailwind-variants` para manter consistência visual.
* Evite modificar os componentes diretamente; prefira wrappers com props estendidas.

#### ✅ [Lucide](https://lucide.dev)

* **Centralize os ícones usados em um único arquivo `icons/index.ts`** para padronização.
* Nomeie semanticamente (ex: `TrashIcon`, `EditIcon`).

#### ✅ [Hero UI](https://www.heroui.com)

* **Evite usar diretamente os exemplos de UI com lógica embutida**. Separe a visualização da lógica.
* Adapte os exemplos à sua arquitetura de componentes, mantendo consistência nos nomes e props.

---

### 💻 **Gerenciamento de Estado**

#### ✅ [Jotai](https://jotai.org)

* Organize os átomos em uma pasta `state/` por recurso: `authAtom.ts`, `themeAtom.ts`.
* Evite criar um átomo para cada valor. Prefira **objetos atômicos** e use `atomWithStorage` para persistência.
* Use **atom selectors (`atom(get => ...)`)** para derivar estado sem duplicar a lógica.

---

### 🔗 **HTTP e Validação**

#### ✅ [Axios](https://axios-http.com)

* Crie um único `apiClient.ts` com interceptadores, tratamento de erros e baseURL global.
* Evite chamadas diretas ao `axios.get()` dentro dos componentes. Prefira services como `productService.getAll()`.
* Tipagem sempre com generics: `axios.get<Product[]>("/products")`.

#### ✅ [Zod](https://zod.dev)

* Centralize os esquemas por recurso: `schemas/productSchema.ts`, `schemas/userSchema.ts`.
* **Integre com React Hook Form** e `SWR` para validações automáticas.

#### ✅ [React Hook Form](https://www.react-hook-form.com)

* Prefira `useForm({ resolver: zodResolver(schema) })` com `Zod` para validação tipada.
* **Crie componentes de formulário reutilizáveis** com `useFormContext()` para inputs comuns.
* Nomeie campos com clareza e use a tipagem `FormValues` com Zod.

#### ✅ [SWR](https://swr.vercel.app/pt-BR)

* Armazene fetchers nomeados como `productFetcher`, `userFetcher` em `services/`.
* Use `useSWR(key, fetcher)` com chaves semânticas (`"/products"` → `"/products?search=laptop"`).
* Combine com Jotai para **revalidação otimista e cache compartilhado.**

---

### 📁 **Upload, Estilo, Senhas e Persistência**

#### ✅ [react-dropzone](https://react-dropzone.js.org)

* Separe o Dropzone em um componente isolado: `components/common/FileDropzone.tsx`.
* Exporte callbacks como `onDropAccepted`, `onDropRejected`.
* Valide tipos de arquivos com `Zod` antes de subir.

#### ✅ [Tailwind Variants](https://www.tailwind-variants.org)

* Crie **componentes com variantes nomeadas** (ex: `button({ variant: "primary" })`).
* Centralize configurações em `styles/variants/`, evitando misturar com o JSX.

#### ✅ [bcrypt.js](https://github.com/dcodeIO/bcrypt.js)

* **Nunca use diretamente nos componentes.** Crie uma abstração `utils/hash.ts` no backend.
* Sempre compare senhas com `await bcrypt.compare()` e salve com `await bcrypt.hash(...)`.

#### ✅ [sqlite3 (Node)](https://www.npmjs.com/package/sqlite3)

* Crie um **repositório (ex: `userRepository.ts`)** com métodos de leitura/escrita, e não chame SQL direto na UI.
* Use DDL (migrations) e centralize no `database/` ou `db/schema.sql`.

#### ✅ [localForage](https://localforage.github.io/localForage/)

* Crie um `storage.ts` para wrappers de acesso ao armazenamento.
* Combine com `Zod` para validar os dados ao carregar do armazenamento.

---

### 📚 **Documentação e Testes**

#### ✅ [storybook](https://storybook.js.org)

* Crie `*.stories.tsx` para cada componente em `components/ui/` ou `components/common/`.
* Mantenha stories pequenos e representativos (um por variação visual).

---

## ✅ Resumo: Princípios de *Clean Code*

| Princípio | Aplicação |
|---|---|
| **Separação de responsabilidades** | Cada ferramenta faz apenas uma coisa (UI ≠ lógica ≠ API) |
| **Nomeação clara** | Evite nomes genéricos: `AuthForm`, `ProductCard`, `getUserById` |
| **Componentização** | Divida grandes partes em pequenos blocos reutilizáveis |
| **Evite duplicações** | Crie helpers, constantes e utilitários |
| **Tipagem forte** | Com Zod, TS e generics no Axios/SWR |
| **Arquitetura modular** | Pasta por recurso (ex: `features/products`) |
| **Código testável** | Separe a lógica da UI em hooks e services isolados |