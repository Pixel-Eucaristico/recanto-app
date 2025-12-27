# UX/UI Multiplataforma com Next.js e DaisyUI

Guia completo para desenvolvimento de interfaces responsivas que funcionam perfeitamente em Web, Android e iOS usando Next.js e DaisyUI.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estratégias de Implementação](#estratégias-de-implementação)
3. [Design Mobile-First](#design-mobile-first)
4. [Breakpoints e Responsividade](#breakpoints-e-responsividade)
5. [Touch Targets e Acessibilidade](#touch-targets-e-acessibilidade)
6. [Implementação com DaisyUI](#implementação-com-daisyui)
7. [PWA - Progressive Web Apps](#pwa---progressive-web-apps)
8. [Apps Nativos com Capacitor](#apps-nativos-com-capacitor)
9. [Best Practices](#best-practices)
10. [Checklist de Implementação](#checklist-de-implementação)

---

## 🎯 Visão Geral

### Plataformas Suportadas

Com Next.js e DaisyUI, você pode criar uma única aplicação que funciona em:

- **🌐 Web (Desktop)** - Chrome, Firefox, Safari, Edge
- **📱 Android** - Via PWA ou Capacitor
- **🍎 iOS** - Via PWA (iOS 16.4+) ou Capacitor

### Tecnologias Principais

- **Next.js 15** - Framework React com SSR/SSG
- **Tailwind CSS 4** - Utility-first CSS framework
- **DaisyUI 5** - Componentes prontos para Tailwind
- **Capacitor** (opcional) - Para apps nativos
- **PWA** (opcional) - Para apps instaláveis

---

## 🚀 Estratégias de Implementação

### 1. PWA (Progressive Web App)

**Quando usar:**
- Você quer uma solução rápida
- Não precisa de recursos nativos complexos
- Quer evitar App Store/Play Store

**Vantagens:**
✅ Zero configuração adicional
✅ Atualização instantânea (sem App Store review)
✅ Custo reduzido de desenvolvimento
✅ Funciona em iOS 16.4+ (com limitações)

**Desvantagens:**
❌ Menos recursos nativos
❌ Push notifications limitados no iOS
❌ Descoberta limitada (sem App Store)

### 2. Capacitor (App Nativo)

**Quando usar:**
- Precisa de recursos nativos (câmera, GPS, notificações)
- Quer distribuir via App Store/Play Store
- Precisa de melhor performance offline

**Vantagens:**
✅ Acesso completo a APIs nativas
✅ Distribuição via lojas oficiais
✅ Melhor integração com o sistema
✅ Plugins para recursos nativos

**Desvantagens:**
❌ Mais complexo de configurar
❌ Processo de review das lojas
❌ Precisa de builds separados para iOS/Android

### 3. Híbrido (PWA + Capacitor)

**Quando usar:**
- Quer o melhor dos dois mundos
- Tem recursos para manter ambas versões

**Implementação:**
- PWA para web e Android (via Chrome)
- Capacitor para iOS e Android (via stores)

---

## 📱 Design Mobile-First

### Conceito

Mobile-First significa projetar primeiro para dispositivos móveis e depois expandir para telas maiores.

### Por que Mobile-First?

1. **Performance**: Carrega rápido em redes móveis
2. **Priorização**: Força foco no conteúdo essencial
3. **Escalabilidade**: Mais fácil expandir do que reduzir
4. **Estatísticas**: 60%+ do tráfego web é mobile

### Implementação com Tailwind CSS

```jsx
// ❌ ERRADO - Desktop-First
<div className="w-full lg:w-1/2 md:w-3/4">
  Conteúdo
</div>

// ✅ CORRETO - Mobile-First
<div className="w-full md:w-3/4 lg:w-1/2">
  Conteúdo
</div>
```

**Explicação:**
- Base (sem prefixo) = Mobile
- `md:` = Tablet e acima
- `lg:` = Desktop e acima

### Padrão de Pensamento

```
Mobile (base)
    ↓
Tablet (md:)
    ↓
Desktop (lg:)
    ↓
Wide (xl:, 2xl:)
```

---

## 📐 Breakpoints e Responsividade

### Breakpoints Padrão do Tailwind

| Prefixo | Tamanho Mínimo | Dispositivo Típico |
|---------|----------------|-------------------|
| (nenhum)| 0px | Mobile (base) |
| `sm:` | 640px | Smartphone grande |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Laptop/Desktop pequeno |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Monitor grande |

### Customização de Breakpoints

```javascript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      'mobile': '320px',
      'tablet': '640px',
      'laptop': '1024px',
      'desktop': '1280px',
      'wide': '1536px',
    }
  }
}
```

### Exemplos Práticos

#### Layout de Grid Responsivo

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 coluna */}
  {/* Tablet: 2 colunas */}
  {/* Desktop: 3 colunas */}
  {items.map(item => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</div>
```

#### Navegação Responsiva

```jsx
<nav className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
  {/* Mobile: Menu vertical */}
  {/* Desktop: Menu horizontal */}
  <a href="/">Home</a>
  <a href="/sobre">Sobre</a>
  <a href="/contatos">Contatos</a>
</nav>
```

#### Tipografia Responsiva

```jsx
<h1 className="text-2xl md:text-4xl lg:text-6xl font-bold">
  {/* Mobile: 24px */}
  {/* Tablet: 36px */}
  {/* Desktop: 60px */}
  Título Principal
</h1>
```

#### Espaçamento Responsivo

```jsx
<div className="p-4 md:p-6 lg:p-8">
  {/* Mobile: padding 16px */}
  {/* Tablet: padding 24px */}
  {/* Desktop: padding 32px */}
  Conteúdo com padding adaptativo
</div>
```

---

## 👆 Touch Targets e Acessibilidade

### Tamanhos Mínimos Recomendados

#### Apple (iOS/iPadOS)

- **Mínimo**: 44x44 pixels (11mm)
- **Recomendado**: 48x48 pixels ou maior
- **Topo da tela**: 44px (31pt / 11mm)
- **Base da tela**: 46px (34pt / 12mm)

#### Google (Android)

- **Mínimo**: 48x48 dp (density-independent pixels)
- **Recomendado**: 48x48 dp com margem de 8dp
- **Material Design 3**: 48dp altura mínima

#### WCAG 2.1 (Acessibilidade Web)

- **Nível AAA**: 44x44 pixels
- **Área de toque**: 1cm x 1cm (0.4in x 0.4in)

### Implementação com DaisyUI

```jsx
// ✅ CORRETO - Botões touch-friendly
<button className="btn btn-primary min-h-12 min-w-12">
  {/* 48px = 12 * 4px (Tailwind) */}
  Clique
</button>

// ✅ CORRETO - Inputs touch-friendly
<input
  type="text"
  className="input input-bordered h-12"
  placeholder="Nome"
/>

// ✅ CORRETO - Links com área de toque adequada
<a href="/contatos" className="block py-3 px-4 min-h-12">
  Fale Conosco
</a>
```

### Espaçamento entre Elementos

```jsx
// ❌ ERRADO - Elementos muito próximos
<div className="flex gap-1">
  <button className="btn">Cancelar</button>
  <button className="btn">Confirmar</button>
</div>

// ✅ CORRETO - Espaçamento adequado
<div className="flex gap-4 md:gap-6">
  {/* Mobile: 16px */}
  {/* Desktop: 24px */}
  <button className="btn min-h-12">Cancelar</button>
  <button className="btn min-h-12">Confirmar</button>
</div>
```

### Área de Toque vs Área Visual

```jsx
// Botão visualmente pequeno, mas com área de toque grande
<button className="relative">
  {/* Área visual */}
  <span className="px-2 py-1">X</span>

  {/* Área de toque estendida (invisível) */}
  <span className="absolute inset-0 min-w-12 min-h-12" />
</button>
```

---

## 🎨 Implementação com DaisyUI

### Componentes Responsivos Prontos

DaisyUI herda completamente o sistema responsivo do Tailwind CSS.

#### Navbar Responsiva

```jsx
<div className="navbar bg-base-100">
  <div className="navbar-start">
    <div className="dropdown">
      {/* Mobile: Dropdown menu */}
      <label tabIndex={0} className="btn btn-ghost lg:hidden">
        <svg>...</svg> {/* Ícone hamburger */}
      </label>
      <ul className="menu menu-sm dropdown-content">
        <li><a>Item 1</a></li>
        <li><a>Item 2</a></li>
      </ul>
    </div>
  </div>

  <div className="navbar-center hidden lg:flex">
    {/* Desktop: Menu horizontal */}
    <ul className="menu menu-horizontal px-1">
      <li><a>Item 1</a></li>
      <li><a>Item 2</a></li>
    </ul>
  </div>
</div>
```

#### Cards Responsivos

```jsx
<div className="card w-full md:w-96 bg-base-100 shadow-xl">
  {/* Mobile: 100% largura */}
  {/* Tablet+: 384px largura */}
  <figure className="h-48 md:h-64">
    {/* Altura adaptativa */}
    <img src="..." alt="..." />
  </figure>
  <div className="card-body p-4 md:p-6">
    <h2 className="card-title text-lg md:text-xl">Título</h2>
    <p className="text-sm md:text-base">Descrição...</p>
  </div>
</div>
```

#### Modal Responsivo

```jsx
<dialog className="modal">
  <div className="modal-box w-11/12 md:w-auto max-w-5xl">
    {/* Mobile: 91.67% largura */}
    {/* Desktop: largura automática até max 1280px */}
    <h3 className="text-lg md:text-2xl font-bold">Título</h3>
    <p className="py-4">Conteúdo do modal</p>
  </div>
</dialog>
```

#### Formulários Responsivos

```jsx
<form className="space-y-4">
  <div className="form-control w-full">
    <label className="label">
      <span className="label-text text-sm md:text-base">Email</span>
    </label>
    <input
      type="email"
      className="input input-bordered w-full h-12 md:h-14"
      placeholder="seu@email.com"
    />
  </div>

  <button className="btn btn-primary w-full md:w-auto min-h-12">
    {/* Mobile: largura total */}
    {/* Desktop: largura automática */}
    Enviar
  </button>
</form>
```

### Drawer (Menu Lateral) para Mobile

```jsx
<div className="drawer lg:drawer-open">
  <input id="my-drawer" type="checkbox" className="drawer-toggle" />

  <div className="drawer-content">
    {/* Botão visível apenas no mobile */}
    <label htmlFor="my-drawer" className="btn btn-primary drawer-button lg:hidden">
      Abrir Menu
    </label>

    {/* Conteúdo principal */}
    <div className="p-4 lg:p-8">
      Conteúdo
    </div>
  </div>

  <div className="drawer-side">
    <label htmlFor="my-drawer" className="drawer-overlay"></label>

    {/* Sidebar */}
    <ul className="menu p-4 w-80 min-h-full bg-base-200">
      <li><a>Item 1</a></li>
      <li><a>Item 2</a></li>
    </ul>
  </div>
</div>
```

---

## 🌐 PWA - Progressive Web Apps

### Configuração Next.js 15 (Built-in)

Next.js 15 tem suporte nativo para PWA via App Router.

#### 1. Criar Web App Manifest

```typescript
// app/manifest.ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Recanto do Amor Misericordioso',
    short_name: 'Recanto',
    description: 'Comunidade católica em Sumaré',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e40af',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable', // iOS
      },
    ],
  }
}
```

#### 2. Adicionar Service Worker (Serwist)

```bash
npm install @serwist/next
```

```javascript
// next.config.ts
import withSerwist from '@serwist/next';

export default withSerwist({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
})({
  // Sua configuração Next.js
});
```

```typescript
// app/sw.ts
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry } from '@serwist/precaching';
import { Serwist } from 'serwist';

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
```

#### 3. Configurar Metadata

```typescript
// app/layout.tsx
export const metadata = {
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Recanto',
  },
  formatDetection: {
    telephone: false,
  },
};
```

### Testando PWA

**Chrome Desktop:**
1. Abra DevTools → Application → Manifest
2. Verifique se o manifest carrega corretamente
3. Clique em "Install" no ícone da barra de endereço

**Chrome Android:**
1. Acesse o site
2. Menu → "Adicionar à tela inicial"
3. App é instalado como ícone na home

**Safari iOS (16.4+):**
1. Acesse o site
2. Compartilhar → "Adicionar à Tela de Início"
3. **IMPORTANTE**: Push notifications só funcionam se instalado

### Limitações do iOS

❌ Push Notifications (sem instalação)
❌ Background Sync
❌ Bluetooth
✅ Push Notifications (COM instalação, iOS 16.4+)
✅ Geolocation
✅ Camera/Media
✅ Storage (IndexedDB, LocalStorage)

---

## 📦 Apps Nativos com Capacitor

### O que é Capacitor?

Capacitor é uma runtime que transforma sua aplicação web Next.js em um app nativo iOS/Android.

### Instalação e Configuração

#### 1. Instalar Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init
```

```json
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.org.recanto',
  appName: 'Recanto do Amor',
  webDir: 'out', // Next.js static export
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

#### 2. Configurar Next.js para Export Estático

```javascript
// next.config.ts
const nextConfig = {
  output: 'export', // ← IMPORTANTE: Capacitor precisa de export
  images: {
    unoptimized: true, // Desabilita otimização de imagem
  },
};

export default nextConfig;
```

#### 3. Adicionar Plataformas

```bash
# Build do Next.js
npm run build

# Adicionar iOS (requer macOS + Xcode)
npx cap add ios

# Adicionar Android (requer Android Studio)
npx cap add android

# Sincronizar alterações
npx cap sync
```

#### 4. Abrir no IDE Nativo

```bash
# Abrir Xcode (iOS)
npx cap open ios

# Abrir Android Studio
npx cap open android
```

### Plugins Úteis do Capacitor

```bash
# Camera
npm install @capacitor/camera

# Geolocation
npm install @capacitor/geolocation

# Push Notifications
npm install @capacitor/push-notifications

# Storage (SQLite)
npm install @capacitor/preferences

# Share
npm install @capacitor/share

# Haptics (vibração)
npm install @capacitor/haptics
```

### Exemplo de Uso - Camera

```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

async function takePicture() {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });

  return image.webPath;
}
```

### Exemplo de Uso - Geolocation

```typescript
import { Geolocation } from '@capacitor/geolocation';

async function getCurrentPosition() {
  const coordinates = await Geolocation.getCurrentPosition();

  return {
    lat: coordinates.coords.latitude,
    lng: coordinates.coords.longitude,
  };
}
```

### Detecção de Plataforma

```typescript
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

// Código condicional
if (platform === 'ios') {
  // Código específico iOS
} else if (platform === 'android') {
  // Código específico Android
} else {
  // Código web
}
```

### Workflow de Desenvolvimento

```bash
# 1. Desenvolva no browser (mais rápido)
npm run dev

# 2. Teste em dispositivo quando precisar de recursos nativos
npm run build && npx cap sync && npx cap open android
```

---

## ✅ Best Practices

### 1. Performance

#### Lazy Loading de Imagens

```jsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={600}
  loading="lazy" // Lazy load
  placeholder="blur" // Blur placeholder
/>
```

#### Code Splitting

```jsx
import dynamic from 'next/dynamic';

// Componente carrega apenas quando necessário
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Carregando...</p>,
  ssr: false, // Não renderiza no servidor
});
```

### 2. Acessibilidade

#### Labels Adequadas

```jsx
// ✅ CORRETO
<label htmlFor="email" className="label">
  <span className="label-text">Email</span>
</label>
<input id="email" type="email" className="input" />

// ❌ ERRADO - Sem label
<input type="email" placeholder="Email" />
```

#### Contraste de Cores

```jsx
// DaisyUI já segue WCAG 2.1
<button className="btn btn-primary">
  {/* Contraste automático */}
  Botão Acessível
</button>
```

#### Navegação por Teclado

```jsx
<button
  className="btn"
  tabIndex={0} // Navegável por teclado
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Clique ou Enter
</button>
```

### 3. SEO

#### Metadata Dinâmica

```typescript
// app/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recanto do Amor Misericordioso',
  description: 'Comunidade católica em Sumaré',
  openGraph: {
    title: 'Recanto do Amor',
    description: 'Vivenciando o Amor Misericordioso',
    images: ['/og-image.jpg'],
  },
};
```

### 4. Offline-First

```typescript
// Service Worker com cache strategies
import { Serwist } from 'serwist';

const serwist = new Serwist({
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.exemplo\.com/,
      handler: 'NetworkFirst', // Network primeiro, cache como fallback
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
      handler: 'CacheFirst', // Cache primeiro (imagens)
    },
  ],
});
```

### 5. Testes em Dispositivos Reais

#### Chrome DevTools

```
F12 → Toggle Device Toolbar (Ctrl+Shift+M)
```

Testes simulados:
- iPhone 14 Pro Max (430x932)
- Samsung Galaxy S20 (360x800)
- iPad Pro (1024x1366)

#### BrowserStack / Sauce Labs

Teste em dispositivos reais na nuvem.

---

## 📋 Checklist de Implementação

### Design e Layout

- [ ] Design mobile-first implementado
- [ ] Breakpoints Tailwind configurados
- [ ] Grid responsivo funcionando
- [ ] Navegação adaptativa (mobile/desktop)
- [ ] Tipografia responsiva
- [ ] Espaçamentos adaptativos

### Touch e Interatividade

- [ ] Botões com mínimo 48x48px
- [ ] Inputs com altura mínima 48px
- [ ] Espaçamento mínimo 8px entre elementos
- [ ] Área de toque estendida em ícones pequenos
- [ ] Sem hover-only interactions

### Componentes DaisyUI

- [ ] Navbar responsiva
- [ ] Cards adaptativos
- [ ] Modais responsivos
- [ ] Formulários touch-friendly
- [ ] Drawer/Sidebar para mobile

### PWA (Se Aplicável)

- [ ] Manifest configurado
- [ ] Ícones 192x192 e 512x512
- [ ] Service Worker instalado
- [ ] Cache offline configurado
- [ ] Testado no Chrome Android
- [ ] Testado no Safari iOS

### Capacitor (Se Aplicável)

- [ ] Next.js configurado para export
- [ ] capacitor.config.ts configurado
- [ ] Plataformas iOS/Android adicionadas
- [ ] Plugins necessários instalados
- [ ] Build testado em dispositivo real
- [ ] Permissões configuradas (camera, location, etc.)

### Performance

- [ ] Imagens otimizadas (Next/Image)
- [ ] Code splitting implementado
- [ ] Lazy loading ativado
- [ ] Lighthouse score > 90

### Acessibilidade

- [ ] Labels em todos inputs
- [ ] Contraste WCAG AAA
- [ ] Navegação por teclado
- [ ] ARIA labels onde necessário
- [ ] Testes com leitor de tela

### SEO

- [ ] Metadata configurada
- [ ] Open Graph tags
- [ ] Sitemap gerado
- [ ] robots.txt configurado

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [Next.js PWA](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [DaisyUI Components](https://daisyui.com/components/)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Ferramentas

- [Responsive Design Checker](https://responsivedesignchecker.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Can I Use](https://caniuse.com/)

### Starter Templates

- [Next.js + Capacitor Starter](https://github.com/mlynch/nextjs-tailwind-ionic-capacitor-starter)
- [Next.js PWA Template](https://github.com/vercel/next.js/tree/canary/examples/progressive-web-app)

---

## 🎯 Conclusão

Com Next.js e DaisyUI, você tem todas as ferramentas necessárias para criar experiências UX/UI excepcionais em Web, Android e iOS:

✅ **Uma única base de código** para todas as plataformas
✅ **Mobile-first** por padrão com Tailwind
✅ **Componentes responsivos** prontos com DaisyUI
✅ **PWA** para distribuição rápida
✅ **Capacitor** quando precisar de recursos nativos

**Última atualização:** 2025-10-12
**Versão:** 1.0.0
