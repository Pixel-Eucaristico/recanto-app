### ✅ Sistema de interface do usuário reutilizável (Reusable UI system)

> Crie uma **biblioteca interna de componentes visuais e layouts reutilizáveis** para garantir **consistência, produtividade e manutenibilidade** no design da aplicação.

---

## 🧱 O que é um sistema de UI reutilizável?

É um conjunto de **componentes genéricos, padronizados e reaproveitáveis** usados em diversas partes da aplicação. Em vez de reescrever os mesmos botões, inputs e containers em cada recurso, você centraliza esses elementos em pastas como:

```
components/
├── common/    # Elementos atômicos reutilizáveis (botões, inputs, modais)
└── layouts/   # Estruturas de páginas e seções (Header, Sidebar, PageWrapper)
```

---

## 🧩 Como organizar

### `components/common/`

Contém **elementos atômicos e isolados**, como:

| Arquivo       | Responsabilidade                                             |
| ------------- | ------------------------------------------------------------ |
| `Button.tsx`  | Um botão genérico com variantes (primário, secundário, etc.) |
| `Input.tsx`   | Campo de entrada reutilizável com suporte a erros            |
| `Modal.tsx`   | Componente de diálogo/modais                                 |
| `Spinner.tsx` | Indicador de carregamento                                    |

Esses componentes são **estáticos**, **testáveis** e altamente **reutilizáveis**.

---

### `components/layouts/`

Contém **estruturas de layout completas**, como:

| Arquivo           | Responsabilidade                                              |
| ----------------- | ------------------------------------------------------------- |
| `MainLayout.tsx`  | Estrutura base da aplicação (ex: header + sidebar + conteúdo) |
| `AuthLayout.tsx`  | Layout usado em páginas públicas ou de login                  |
| `PageWrapper.tsx` | Container com padding, título e breadcrumbs                   |

Layouts permitem que diferentes páginas compartilhem a **mesma base visual e estrutural** sem repetir código.

---

## 🎨 Vantagens desse sistema

| Vantagem                      | Resultado                                      |
| ----------------------------- | ---------------------------------------------- |
| 📦 Reutilização               | Reduz duplicação de código                     |
| 🎯 Consistência visual        | Interface uniforme em toda a aplicação         |
| 🧠 Facilidade de manutenção   | Corrige um bug/ajuste de estilo em um só lugar |
| 🚀 Rapidez no desenvolvimento | Novos recursos aproveitam componentes prontos  |
| 🧪 Testabilidade              | Componentes isolados são mais fáceis de testar |

---

## 📌 Exemplo de estrutura

```
components/
├── common/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── Spinner.tsx
└── layouts/
    ├── MainLayout.tsx
    ├── AuthLayout.tsx
    └── PageWrapper.tsx
```

---

## 📐 Integração com design systems

Você pode alinhar essa estrutura com bibliotecas como:

* **TailwindCSS + clsx** (classes utilitárias personalizadas)
* **shadcn/ui** (baseada em Radix e Tailwind)
* **Chakra UI**, **MUI**, ou qualquer outro framework de componentes

Ou até criar seu **design system interno** com temas e tokens visuais.

---

## ✅ Em resumo

O sistema de UI reutilizável:

* Centraliza a interface base da aplicação
* Evita duplicação de código
* Impõe consistência no visual e comportamento
* Acelera a entrega de novas features
* Facilita testes e manutenção a longo prazo
