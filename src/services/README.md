### ✅ Camada de API tipada e modular (Typed modular API layer)

> Centralize o acesso à sua API em um ponto único, com tipagem forte, modularização clara e tratamento de erros padronizado. Isso garante código limpo, previsível e de fácil manutenção.

---

## 📡 O que é a camada de API?

É o **nível de abstração que lida com todas as chamadas HTTP** da sua aplicação.

Ao invés de fazer `fetch` ou `axios` diretamente dentro de componentes ou hooks, você define uma **interface limpa e reutilizável para comunicação com a API**, geralmente separada em:

* `services/apiClient.ts`: configuração do cliente HTTP
* `utils/errorHandler.ts`: função padrão para tratamento de erros
* `features/[modulo]/api.ts`: funções específicas por recurso

---

## 🔧 Como funciona na prática

### 📁 `services/apiClient.ts`

Esse arquivo configura a instância principal do **Axios** (ou outro cliente), com headers, interceptadores, baseURL, etc.

```ts
// services/apiClient.ts
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.seudominio.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
```

---

### 📁 `utils/errorHandler.ts`

Responsável por centralizar o tratamento de erros HTTP (401, 404, 500...), para evitar duplicação e melhorar UX.

```ts
// utils/errorHandler.ts
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 401) return "Você precisa estar logado.";
    if (status === 404) return "Recurso não encontrado.";
    if (status === 500) return "Erro interno no servidor.";

    return error.response?.data?.message || "Erro desconhecido.";
  }

  return "Erro de conexão.";
};
```

---

### 📁 API modular por recurso

Cada módulo (feature) tem suas funções isoladas de comunicação com a API, por exemplo:

```ts
// features/products/api.ts
import apiClient from "@/services/apiClient";
import { handleApiError } from "@/utils/errorHandler";
import { Product } from "./types";

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const response = await apiClient.get("/products");
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
```

E no componente:

```tsx
const fetchProducts = async () => {
  try {
    const data = await getAllProducts();
    setProducts(data);
  } catch (err) {
    toast.error(err.message);
  }
};
```

---

## 🧠 Por que isso é importante?

| Vantagem             | Benefício                                       |
| -------------------- | ----------------------------------------------- |
| 🧼 Código mais limpo | Nenhum `axios.get()` solto em componentes       |
| 🔄 Reutilização      | O mesmo cliente serve para todas as requisições |
| 🧪 Testabilidade     | Funções isoladas são fáceis de testar           |
| 🔐 Segurança         | Interceptadores para headers de autenticação    |
| 🔍 Observabilidade   | Fácil adicionar logs, métricas ou retries       |
| ⚙️ Escalabilidade    | Basta adicionar arquivos `api.ts` por feature   |

---

## 📂 Exemplo de estrutura

```
src/
├── services/
│   └── apiClient.ts
├── utils/
│   └── errorHandler.ts
├── features/
│   ├── products/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   └── ProductList.tsx
│   └── auth/
│       └── api.ts
```

---

## 🧩 Dica: Interceptadores no `apiClient.ts`

Você pode interceptar requisições/respostas para:

* Adicionar tokens de autenticação
* Tratar erros 401 globalmente
* Redirecionar para login, etc.

```ts
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## ✅ Em resumo

A camada de API tipada e modular:

* **Organiza todas as requisições em um só lugar**
* **Evita duplicação de lógica HTTP**
* **Centraliza erros e headers**
* **Permite reutilização entre diferentes partes do app**
* **Deixa o front-end mais testável e escalável**
