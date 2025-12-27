### ✅ Ganchos personalizados reutilizáveis (Reusable custom hooks)

> **Abstraia lógica de negócios ou comportamentos repetitivos em ganchos personalizados (`hooks/`)** para obter código mais limpo, reutilizável, testável e fácil de entender.

---

## 🧠 O que são custom hooks?

Ganchos personalizados (ou **custom hooks**) são funções do React que:

* Começam com `use`
* Podem usar outros hooks (como `useState`, `useEffect`, `useReducer`, etc.)
* Encapsulam **lógica reutilizável** que seria repetida em vários componentes

Eles ajudam a separar **lógica de apresentação** da **lógica de negócio**.

---

## 📂 Organização recomendada

Coloque os ganchos dentro da pasta:

```
hooks/
├── useAuth.ts
├── useDebounce.ts
├── useFetch.ts
├── useModal.ts
└── useOutsideClick.ts
```

Cada arquivo exporta um hook responsável por **uma única tarefa ou comportamento reutilizável**.

---

## 🧩 Exemplos reais de custom hooks

### `hooks/useAuth.ts` — Hook para autenticação

```ts
import { useAppSelector } from "@/store/hooks";

export const useAuth = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = !!user;

  return { user, isAuthenticated };
};
```

---

### `hooks/useDebounce.ts` — Hook para controle de debounce

```ts
import { useEffect, useState } from "react";

export const useDebounce = <T>(value: T, delay = 300): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
};
```

---

### `hooks/useFetch.ts` — Hook genérico para chamadas à API

```ts
import { useEffect, useState } from "react";
import apiClient from "@/services/apiClient";

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<T>(url)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}
```

---

## 🔁 Onde usar esses hooks?

Em qualquer componente React onde você precisa reutilizar lógica:

```tsx
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <LoginPrompt />;
  return <h1>Bem-vindo, {user.fullName}!</h1>;
};
```

---

## 🔍 Vantagens dos custom hooks

| Vantagem                          | Benefício                                                              |
| --------------------------------- | ---------------------------------------------------------------------- |
| 🔁 Reutilização                   | Centraliza lógica usada em múltiplos lugares                           |
| 🧹 Separação de responsabilidades | Mantém componentes focados apenas na interface                         |
| 🧪 Testabilidade                  | Hooks são funções puras, fáceis de testar isoladamente                 |
| 🧠 Clareza                        | Deixa o código mais legível e expressivo (`useAuth()`, `useModal()`)   |
| ⚙️ Composição                     | Hooks podem ser combinados entre si para comportamentos mais complexos |

---

## 📌 Dicas práticas

* 🔤 Sempre comece com `use` (ex: `useForm`, `useUserPermissions`, `useTheme`)
* 💡 Nomeie com clareza e propósito
* 🧪 Teste a lógica de hooks críticos com [React Testing Library](https://testing-library.com/docs/react-testing-library/api/) + `@testing-library/react-hooks`
* 📦 Compartilhe hooks entre projetos com uma **mini biblioteca interna**, se for o caso

---

## ✅ Em resumo

Usar hooks personalizados significa:

* Separar lógica de negócio do visual
* Reaproveitar comportamentos complexos com poucas linhas
* Manter componentes mais limpos, concisos e fáceis de testar
