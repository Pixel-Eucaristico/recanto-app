
### ✅ Código testável (Testable code structure)

> Estruture seu projeto para tornar o código **fácil de testar**, com testes automatizados colocados **próximos dos componentes e funções que validam** — promovendo organização, confiança e escalabilidade.

---

## 🧠 Por que se preocupar com testes?

Testes automatizados:

* **Garantem que seu código funciona como esperado**
* **Evitam regressões** após alterações
* **Documentam o comportamento do sistema**
* **Facilitam refatorações seguras**

---

## 🧪 Onde ficam os testes?

Você pode organizar os testes de duas formas recomendadas:

### 🔹 1. **Dentro da pasta do recurso ou componente**

```bash
features/products/
├── ProductCard.tsx
├── ProductCard.test.tsx  ← Teste localizado junto do componente
```

### 🔹 2. **Em uma subpasta chamada `__tests__/`**

```bash
features/products/
├── components/
│   ├── ProductCard.tsx
│   └── __tests__/
│       └── ProductCard.test.tsx
```

Ambas as abordagens são válidas. O importante é manter **proximidade entre teste e implementações**, facilitando:

* Localização dos testes
* Atualizações sincronizadas
* Reaproveitamento de mocks ou fixtures

---

## ⚙️ Ferramentas comuns para testes

| Tipo           | Biblioteca                                                                             | Descrição                                 |
| -------------- | -------------------------------------------------------------------------------------- | ----------------------------------------- |
| 🧪 Unitários   | [Vitest](https://vitest.dev/), [Jest](https://jestjs.io/)                              | Testes de funções, hooks, slices, lógica  |
| 🧩 Componentes | [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | Testes de comportamento do usuário e UI   |
| 🔗 Integração  | Jest + Testing Library                                                                 | Valida fluxos entre múltiplos componentes |
| 🌐 End-to-end  | [Cypress](https://www.cypress.io/), [Playwright](https://playwright.dev/)              | Testes automatizados no navegador real    |

---

## 📦 Exemplo de teste com Testing Library

```tsx
// ProductCard.test.tsx
import { render, screen } from "@testing-library/react";
import { ProductCard } from "./ProductCard";

test("renderiza o nome do produto", () => {
  render(<ProductCard name="Camisa" price={99.9} />);
  expect(screen.getByText("Camisa")).toBeInTheDocument();
});
```

---

## 📄 Testando hooks personalizados

```ts
// useCounter.test.ts
import { renderHook, act } from "@testing-library/react-hooks";
import { useCounter } from "../useCounter";

test("incrementa corretamente", () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});
```

---

## 📁 Exemplo de estrutura com testes

```
features/
├── products/
│   ├── components/
│   │   ├── ProductCard.tsx
│   │   ├── ProductCard.test.tsx
│   │   └── __tests__/
│   │       └── ProductCard.integration.test.tsx
│   ├── productSlice.ts
│   └── productSlice.test.ts
hooks/
├── useAuth.ts
└── useAuth.test.ts
```

---

## 🚀 Vantagens dessa abordagem

| Vantagem            | Benefício                                                |
| ------------------- | -------------------------------------------------------- |
| 📍 Proximidade      | Facilita encontrar e manter os testes                    |
| 🔍 Clareza          | Cada arquivo de código tem seu "espelho" de teste        |
| ✅ Confiabilidade    | Testes quebram onde a lógica muda — intencionalmente     |
| 🧪 Testes modulares | Componentes e funções isoladas são mais fáceis de testar |
| 🧼 Manutenção       | Refatorações são mais seguras com testes por perto       |

---

## 📌 Dicas para testabilidade

* Escreva código que **evite efeitos colaterais** (ex: lógica fora de componentes)
* Use **injeção de dependência** onde possível
* Exporte funções puras separadas para facilitar testes
* **Evite testar implementações internas**, foque no **comportamento observado**

---

## ✅ Em resumo

Ter uma estrutura de **código testável** com testes próximos:

* Garante confiança ao desenvolver e refatorar
* Reduz tempo de debugging
* Incentiva o uso de boas práticas como separação de lógica e componentes puros
* Escala com o crescimento do time e do projeto