# Sistema de Temas - Documentação Técnica

> ⚠️ **ATENÇÃO**: Este documento descreve o funcionamento atual do sistema de temas. NÃO modifique sem entender completamente a arquitetura!

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Fluxo de Funcionamento](#fluxo-de-funcionamento)
4. [LocalStorage](#localstorage)
5. [Componentes Principais](#componentes-principais)
6. [Problemas Conhecidos e Soluções](#problemas-conhecidos-e-soluções)
7. [Como NÃO Quebrar](#como-não-quebrar)

---

## 🎯 Visão Geral

O sistema de temas usa **DUAS bibliotecas trabalhando juntas**:

| Biblioteca | Responsabilidade | LocalStorage Key |
|------------|------------------|------------------|
| **Jotai** | Gerenciar estado do tema (`light`/`dark`/`system`) | `theme-preference` |
| **next-themes** | Wrapper para compatibilidade | `theme` |
| **DaisyUI** | Aplicar temas visuais (ex: `recanto-light`, `cupcake`) | - |

### Por Que Duas Bibliotecas?

- **Jotai**: Fonte única da verdade, persiste no localStorage
- **next-themes**: Fornece hooks compatíveis com alguns componentes legados
- **Não há conflito**: Usam chaves DIFERENTES no localStorage

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         USER CLICK                          │
│                            🕯️                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   ThemeController.tsx                        │
│  const [theme, setTheme] = useTheme() // Jotai             │
│  setTheme('light' | 'dark')                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Jotai Atom (Source of Truth)             │
│  atomWithStorage('theme-preference', 'system')              │
│  → Salva no localStorage                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   ThemeProvider.tsx                          │
│  1. Lê do Jotai: const [theme] = useLocalTheme()           │
│  2. Sincroniza: setTheme(theme) // next-themes             │
│  3. Resolve DaisyUI: theme === 'dark' ? darkTheme : lightTheme │
│  4. Aplica: <div data-theme={resolvedTheme}>               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                         HTML DOM                             │
│  <div data-theme="recanto-dark">                            │
│  → DaisyUI aplica variáveis CSS                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Funcionamento

### 1️⃣ **Mudança de Tema (Usuário Clica)**

```typescript
// ThemeController.tsx
const handleThemeChange = (event) => {
  setTheme(event.target.checked ? "dark" : "light");
  // ✅ Salva em localStorage['theme-preference']
};
```

### 2️⃣ **ThemeProvider Detecta Mudança**

```typescript
// ThemeProvider.tsx
useEffect(() => {
  setTheme(theme);  // Sincroniza com next-themes

  const selectedTheme = theme === "system" ? systemTheme : theme;
  const appliedTheme = selectedTheme === "dark" ? darkTheme : lightTheme;

  setResolvedTheme(appliedTheme);  // Ex: 'recanto-dark'
}, [theme, systemTheme, darkTheme, lightTheme, setTheme]);
```

### 3️⃣ **Tema por Página (CMS)**

```typescript
// LayoutWithTheme.tsx
useEffect(() => {
  const page = await contentPageService.getBySlug(pathname);

  if (page) {
    setThemes({
      light: page.theme_light || 'recanto-light',
      dark: page.theme_dark || 'recanto-dark',
    });
  }
}, [pathname]);

// Passa temas dinâmicos para ThemeProvider
<ThemeProvider lightTheme={themes.light} darkTheme={themes.dark}>
```

**Fluxo completo:**
1. Usuário em modo `dark`
2. Navega para `/sobre` (tema: `cupcake` light, `dracula` dark)
3. ThemeProvider recebe `darkTheme="dracula"`
4. Resolve para `"dracula"` e aplica `data-theme="dracula"`

---

## 💾 LocalStorage

### Chaves Usadas

| Chave | Usado Por | Valores | Descrição |
|-------|-----------|---------|-----------|
| `theme-preference` | Jotai | `"light"`, `"dark"`, `"system"` | Preferência do usuário |
| `theme` | next-themes | `"light"`, `"dark"`, `"system"` | Sincronizado do Jotai |

### ⚠️ CRÍTICO: NÃO Mude as Chaves!

```typescript
// ❌ NUNCA FAÇA ISSO:
export const dualThemeAtom = atomWithStorage<ThemeType>('theme', 'system');
//                                                        ^^^^^^
//                                              Conflita com next-themes!

// ✅ SEMPRE USE:
export const dualThemeAtom = atomWithStorage<ThemeType>('theme-preference', 'system');
//                                                        ^^^^^^^^^^^^^^^^
//                                                        Chave única!
```

**Por Quê?**
Se ambos usarem `'theme'`, eles brigarão pelo mesmo espaço no localStorage, causando:
- ⚡ Tema pisca mas não muda
- ⚡ Volta para o tema anterior
- ⚡ Loop infinito de re-renders

---

## 📦 Componentes Principais

### 1. `theme.atom.ts` - Estado Global

```typescript
import { atomWithStorage } from 'jotai/utils'
import { ThemeType } from './theme.types';

export const dualThemeAtom = atomWithStorage<ThemeType>('theme-preference', 'system');
```

**Responsabilidade:**
- Armazenar preferência do usuário
- Persistir no localStorage
- Fonte única da verdade

### 2. `ThemeController.tsx` - Botão de Troca

```typescript
const ThemeController: FC = () => {
  const [theme, setTheme] = useTheme();  // Jotai
  const systemTheme = useSystemTheme();

  const handleThemeChange = (event) => {
    setTheme(event.target.checked ? "dark" : "light");
  };

  const isDarkMode = theme === "system" ? systemTheme === "dark" : theme === "dark";

  return (
    <label className="swap swap-flip">
      <input type="checkbox" checked={isDarkMode} onChange={handleThemeChange} />
      <CandleOffIcon className="swap-off" />
      <CandleOnIcon className="swap-on" />
    </label>
  );
};
```

**Responsabilidade:**
- UI do botão de troca
- Chamar `setTheme` do Jotai
- Calcular estado do checkbox

### 3. `ThemeProvider.tsx` - Orquestrador

```typescript
export function ThemeProvider({
  children,
  lightTheme,
  darkTheme,
  propsNextThemes,
  ...divProps
}: Props) {
  const [theme] = useLocalTheme();           // Lê do Jotai
  const { setTheme } = useNextTheme();       // Setter do next-themes
  const systemTheme = useSystemTheme();      // Detecta tema do SO
  const [resolvedTheme, setResolvedTheme] = useState<string | null>(null);

  useEffect(() => {
    setTheme(theme);  // Sincroniza Jotai → next-themes

    const selectedTheme = theme === "system" ? systemTheme : theme;
    const appliedTheme = selectedTheme === "dark" ? darkTheme : lightTheme;

    setResolvedTheme(appliedTheme);
  }, [theme, systemTheme, darkTheme, lightTheme, setTheme]);

  if (!resolvedTheme) return null;  // Aguarda resolução

  return (
    <div data-theme={resolvedTheme} {...divProps}>
      <NextThemesProvider {...propsNextThemes}>
        {children}
      </NextThemesProvider>
    </div>
  );
}
```

**Responsabilidade:**
- Sincronizar Jotai → next-themes
- Resolver tema DaisyUI (ex: `light` → `recanto-light`)
- Aplicar `data-theme` no HTML
- Wrapper para compatibilidade

### 4. `LayoutWithTheme.tsx` - Temas por Página

```typescript
export function LayoutWithTheme({ children }: LayoutWithThemeProps) {
  const pathname = usePathname();
  const [themes, setThemes] = useState({
    light: 'recanto-light',
    dark: 'recanto-dark',
  });

  useEffect(() => {
    const loadPageTheme = async () => {
      const page = await contentPageService.getBySlug(pathname);

      if (page) {
        setThemes({
          light: page.theme_light || 'recanto-light',
          dark: page.theme_dark || 'recanto-dark',
        });
      }
    };

    loadPageTheme();
  }, [pathname]);

  return (
    <ThemeProvider
      lightTheme={themes.light}
      darkTheme={themes.dark}
      propsNextThemes={{ attribute: 'data-theme', enableSystem: true }}
    >
      <Navbar />
      <main>{children}</main>
      <Footer />
    </ThemeProvider>
  );
}
```

**Responsabilidade:**
- Buscar tema da página no CMS
- Passar temas dinâmicos para ThemeProvider
- Permitir páginas com temas diferentes

---

## 🐛 Problemas Conhecidos e Soluções

### Problema 1: Tema Pisca mas Não Muda

**Sintoma:**
- Usuário clica no botão
- Tela pisca branco/escuro
- Volta para o tema anterior

**Causa:**
Conflito de chaves no localStorage (`'theme'` vs `'theme'`)

**Solução:**
```typescript
// theme.atom.ts
export const dualThemeAtom = atomWithStorage<ThemeType>('theme-preference', 'system');
//                                                        ^^^^^^^^^^^^^^^^
```

### Problema 2: Tema Não Persiste

**Sintoma:**
- Usuário muda o tema
- Recarrega a página
- Volta para o tema padrão

**Causa:**
- `atomWithStorage` não está funcionando
- localStorage bloqueado (navegação anônima)

**Solução:**
```typescript
// Verificar se localStorage está disponível
if (typeof window !== 'undefined' && window.localStorage) {
  console.log('localStorage disponível');
}
```

### Problema 3: Tema Não Muda em Páginas Específicas

**Sintoma:**
- Tema funciona na home
- Não funciona em `/sobre`

**Causa:**
- `LayoutWithTheme` não está envolvendo a rota
- ThemeProvider não aplicado

**Solução:**
Verificar hierarquia de layouts:
```
app/
  (main)/
    layout.tsx → LayoutWithTheme ✅
    page.tsx
    sobre/
      page.tsx
```

### Problema 4: Flash/Piscar ao Carregar

**Sintoma:**
- Página carrega com tema errado
- Depois muda para o tema correto
- Causa flash visual

**Causa:**
```typescript
if (!resolvedTheme) return null;  // SSR/Hydration
```

**Solução (Atual):**
Aceitar o flash (trade-off necessário para SSR)

---

## ❌ Como NÃO Quebrar

### 🚫 NUNCA Faça:

1. **Mudar a chave do localStorage**
   ```typescript
   // ❌ ERRADO
   atomWithStorage('theme', 'system')

   // ✅ CERTO
   atomWithStorage('theme-preference', 'system')
   ```

2. **Remover next-themes**
   ```typescript
   // ❌ ERRADO - Quebra compatibilidade
   return <div>{children}</div>

   // ✅ CERTO
   return (
     <div data-theme={resolvedTheme}>
       <NextThemesProvider {...propsNextThemes}>
         {children}
       </NextThemesProvider>
     </div>
   );
   ```

3. **Usar apenas next-themes (sem Jotai)**
   ```typescript
   // ❌ ERRADO - Perde controle fino
   const { theme, setTheme } = useTheme();  // next-themes

   // ✅ CERTO - Jotai como fonte da verdade
   const [theme, setTheme] = useTheme();  // Jotai
   ```

4. **Tentar "melhorar" com useLayoutEffect**
   ```typescript
   // ❌ ERRADO - Causa loops
   useLayoutEffect(() => {
     setTheme(theme);
     // ... mais lógica
   }, [theme, setTheme]);

   // ✅ CERTO - useEffect simples
   useEffect(() => {
     setTheme(theme);
     // ... resolver tema
   }, [theme, systemTheme, darkTheme, lightTheme, setTheme]);
   ```

5. **Aplicar tema no document.documentElement**
   ```typescript
   // ❌ ERRADO - Conflita com next-themes
   document.documentElement.setAttribute('data-theme', theme);

   // ✅ CERTO - Deixar ThemeProvider aplicar via data-theme prop
   return <div data-theme={resolvedTheme}>{children}</div>
   ```

### ✅ SEMPRE Faça:

1. **Testar mudança de tema**
   ```bash
   # Abrir console (F12)
   localStorage.getItem('theme-preference')  # Deve mudar ao clicar
   ```

2. **Testar persistência**
   ```bash
   # Mudar tema → F5 → Verificar se manteve
   ```

3. **Testar tema por página**
   ```bash
   # CMS → Configurar página com tema custom → Visitar página
   ```

4. **Limpar cache ao fazer mudanças**
   ```bash
   rm -rf .next
   npm run dev
   ```

---

## 🧪 Como Testar

### Teste 1: Mudança de Tema
```
1. Abrir site
2. Clicar no botão 🕯️
3. ✅ Tema deve mudar instantaneamente
4. ✅ SEM piscar/flash
```

### Teste 2: Persistência
```
1. Mudar para dark
2. F5 (recarregar)
3. ✅ Deve continuar dark
```

### Teste 3: Tema por Página
```
1. CMS → Editar página
2. Configurar: Light = cupcake, Dark = dracula
3. Salvar
4. Visitar página
5. ✅ Tema deve ser cupcake (se light) ou dracula (se dark)
```

### Teste 4: Navegação entre Páginas
```
1. Home (tema padrão)
2. Navegar para /sobre (tema custom)
3. ✅ Tema deve mudar automaticamente
4. Voltar para home
5. ✅ Tema deve voltar ao padrão
```

---

## 📚 Referências

- **Jotai**: https://jotai.org/docs/utilities/storage
- **next-themes**: https://github.com/pacocoursey/next-themes
- **DaisyUI**: https://daisyui.com/docs/themes/

---

## 📝 Histórico de Mudanças

| Data | Mudança | Motivo |
|------|---------|--------|
| 2025-01-16 | Mudou chave Jotai para `theme-preference` | Conflito com next-themes |
| 2025-01-16 | Documentação criada | Evitar quebras futuras |

---

## 🆘 Troubleshooting

Se o tema parar de funcionar:

1. ✅ Verificar chave do localStorage: `'theme-preference'`
2. ✅ Limpar cache: `rm -rf .next`
3. ✅ Limpar localStorage: `localStorage.clear()`
4. ✅ Reiniciar servidor: `npm run dev`
5. ✅ Aba anônima: `Ctrl+Shift+N`
6. ✅ Hard refresh: `Ctrl+Shift+R`

Se ainda não funcionar, compare com o commit: `3499d25d44ff439c9dadce40e655ba1117a4d5bb`

---

**Última atualização:** 16/01/2025
**Status:** ✅ Funcionando
**Versão:** 1.0.0
