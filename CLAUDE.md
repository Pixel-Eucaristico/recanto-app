# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Recanto do Amor Misericordioso** is a web platform for a Catholic community built with Next.js 15, React 19, TypeScript, and Firebase/Supabase. The platform serves both public-facing content and an authenticated dashboard for community members.

## Key Commands

### Development
```bash
npm run dev          # Start Next.js dev server
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing
```bash
npm test             # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Architecture

### Dual-Layout System

The app uses Next.js App Router with **two distinct route groups**:

1. **`(main)`** - Public marketing site
   - Routes: `/`, `/sobre`, `/espritualidade`, `/doacoes`, `/contatos`, etc.
   - Layout: `src/app/(main)/layout.tsx` with `Navbar` and footer
   - Navigation config: `src/_config/routes_main.ts`

2. **`(app)`** - Authenticated dashboard
   - Routes: `/app/login`, `/app/register`, `/app/dashboard/*`
   - Layout: `src/app/(app)/app/dashboard/layout.tsx` with `Sidebar` and `AuthProvider`
   - Navigation config: `src/_config/routes_app.ts`
   - Protected by `ProtectedRoute` component

### Role-Based Access Control (RBAC)

User roles defined in `src/features/auth/types/user.ts`:
- `admin` - Full system access
- `missionario` - Missionary members
- `recantiano` - Community members
- `pai` - Parents/guardians
- `colaborador` - Collaborators
- `benfeitor` - Benefactors
- `null` - Unauthenticated users

Routes in `routes_app.ts` specify which roles can access each dashboard section. Use `RoleProtectedRoute` component to enforce role-based restrictions.

### Feature-Based Organization

Code is organized by feature domains in `src/features/`:
- `auth/` - Authentication logic (Firebase client/admin, session management)
- `dashboard/` - Dashboard components, contexts (AuthContext), Sidebar
- `main/` - Public site pages (MainPage component)
- `about/`, `contact/`, `donations/`, `spirituality/`, etc. - Feature-specific pages

Each feature contains:
- `components/` - React components
- `contexts/` - React contexts
- `types/` - TypeScript types
- `services/` - Business logic (e.g., `firebaseClient.ts`, `sessionService.ts`)

### Domain Services

`src/domains/` contains core business logic:
- `auth/services/` - Firebase Admin SDK, user role management, session handling

### Image Configuration

`next.config.ts` includes remote image patterns for:
- `randomuser.me`
- `images.unsplash.com`
- `cdn2.picryl.com`

When adding new external image sources, update the `remotePatterns` array.

### Next.js Image Component

Always use the Next.js 13+ Image API:
- Use `fill` prop instead of `layout="fill"`
- Use `object-cover` className instead of `objectFit="cover"`
- Example: `<Image src="..." alt="..." fill className="object-cover" />`

## UI & Styling

### Libraries
- **DaisyUI** + **Tailwind CSS** for base components and utilities
- **shadcn/ui** for custom components (store in `src/components/ui/`)
- **Framer Motion** for animations
- **Lottie** for JSON animations
- **Lucide** icons (centralize in `icons/index.ts` for consistency)

### Principles from ARCHITECTURE.md
- Separate UI from logic - extract complex logic into hooks
- Use Tailwind Variants for component variants
- Create wrappers in `components/ui/` for adapted components
- Maintain semantic naming (e.g., `UserDropdown`, `ProductCard`)

## State Management

- **Jotai** for global state
- Organize atoms by resource in `state/` directory (e.g., `authAtom.ts`, `themeAtom.ts`)
- Use `atomWithStorage` for persistence
- Use atom selectors for derived state
- **SWR** for data fetching with semantic keys

## Forms & Validation

- **React Hook Form** with **Zod** resolvers
- Schema files in `schemas/` by resource
- Example: `useForm({ resolver: zodResolver(schema) })`
- Use `useFormContext()` for reusable form inputs

## DaisyUI Component Reference

**DaisyUI v5** - 40+ components on Tailwind CSS

**Componentes principais:**
- Buttons: `btn btn-primary/outline/ghost` (xs, sm, md, lg)
- Cards: `card bg-base-100 shadow-xl`
- Navbar: `navbar bg-base-100`
- Forms: `input/select/textarea input-bordered`
- Modal: `modal modal-toggle`
- Alert: `alert alert-info/success/warning/error`
- Loading: `loading loading-spinner/dots/ring`

**Temas:** Semantic colors (primary, secondary, accent, neutral, base-100/200/300)
**Config:** `tailwind.config.ts` → `daisyui.themes`
**Aplicar:** `<html data-theme="dark">`

## WhatsApp Integration (Future Phase)

**WhatsApp Web.js v1.34.1** - Para integração futura (Fase 3+)

**Setup básico:** `Client` + `LocalAuth`

**Casos de uso:**
- Notificações de eventos
- Materiais de formação (PDF/vídeo)
- Recibos de doação
- Comunicação de grupos
- Coordenação de missionários

**Importante:** QR auth, rate limits, WhatsApp ToS

## API & Data Fetching

- **Firestore** for all data persistence (migrated from Realtime Database)
- **Firebase Authentication** for user authentication
- Service layer pattern in `src/services/firebase/`:
  - `BaseFirebaseService` - Generic CRUD operations for all entities
  - `UserService` - User management, role assignment, relationships
  - `MaterialService` - Formation materials (PDFs, videos, texts)
  - `DonationService` - Donation tracking and reporting
  - `ForumService` - Forum topics and posts with moderation
  - `EventService` - Community events and agenda
  - `AcompanhamentoService` - Recantiano follow-up records
  - `DesafioService` - Challenges and gamification
  - `AuthService` - Authentication wrapper (register, login, logout)

### Firestore Service Usage

**Note:** Migrated from Realtime Database to Firestore on 2025-10-06 for better query capabilities and scalability.

```typescript
import { userService, materialService } from '@/services/firebase';

// Create
const user = await userService.create({ name, email, role });

// Read
const user = await userService.get(userId);
const materials = await materialService.getMaterialsByCategory('formacao');

// Update
await userService.update(userId, { role: 'admin' });

// Delete
await userService.delete(userId);

// Real-time listeners
const unsubscribe = userService.onValueChange((users) => {
  console.log('Users updated:', users);
});

// NEW: Advanced Firestore queries
const acompanhamentos = await acompanhamentoService.queryWithFilters([
  { field: 'missionario_id', operator: '==', value: userId },
  { field: 'progresso', operator: '==', value: 'avancado' }
]);

const upcomingEvents = await eventService.getUpcomingEvents(10); // Limit 10
```

### Firestore Advantages Over Realtime Database
- ✅ **Compound queries:** Multiple filters + orderBy (impossible in Realtime)
- ✅ **Array queries:** `array-contains` operator for role-based filtering
- ✅ **Better scalability:** 10 GB free (vs 1 GB), unlimited connections
- ✅ **Offline support:** Native offline persistence for mobile apps
- ✅ **Powerful indexes:** Automatic + custom indexes for complex queries

## Authentication Flow

1. **Firebase Authentication** - Email/password and social providers (Google, Facebook, Twitter)
2. **AuthService** (`src/services/firebase/AuthService.ts`) - Handles registration, login, logout
3. **AuthContext** (`src/features/dashboard/contexts/AuthContext.tsx`) - Provides auth state to app
4. **User persistence** - Users stored in Firebase Realtime Database with roles
5. **ProtectedRoute** - Enforces authentication on `/app/dashboard/*`
6. **Middleware** (`src/middleware.ts`) - Defines public vs protected paths

### Auth Usage

```typescript
import { useAuth } from '@/features/dashboard/contexts/AuthContext';

const { user, login, register, logout } = useAuth();

// Register
await register(email, password, name, role);

// Login
await login(email, password);

// Logout
await logout();

// Access current user
console.log(user.role, user.name);
```

## Testing

- **Jest** + **React Testing Library** + **@testing-library/user-event**
- Test files: `src/__tests__/` or co-located `*.test.ts(x)`
- Config: `jest.config.js` with `jest.setup.js`
- Always test component rendering, user interactions, and edge cases

## Important Configuration Notes

### Build Settings
- `next.config.ts` has **ESLint and TypeScript errors ignored during builds** for rapid iteration
- Remove these settings before production deployment

### Select Elements
- Use `defaultValue` prop on `<select>`, not `selected` attribute on `<option>`
- Example: `<select defaultValue=""><option disabled value="">Label</option></select>`

## Code Quality Principles

From ARCHITECTURE.md:

| Principle | Application |
|-----------|-------------|
| **Separation of concerns** | UI ≠ logic ≠ API |
| **Clear naming** | Avoid generics: use `AuthForm`, `ProductCard`, `getUserById` |
| **Componentization** | Break large parts into small reusable blocks |
| **Avoid duplication** | Create helpers, constants, utilities |
| **Strong typing** | Zod + TypeScript + generics in Axios/SWR |
| **Modular architecture** | Feature-based folders (e.g., `features/products`) |
| **Testable code** | Separate logic from UI in hooks and services |

## Entity Data & Firebase Structure

All entities are defined in `src/types/firebase-entities.ts` following the roadmap:

### Phase 1 (MVP) Entities
- `FirebaseUser` - Users with roles and relationships
- `Material` - Formation content (PDFs, videos, texts)
- `Donation` - Donation tracking and impact reporting
- `ForumTopic` & `ForumPost` - Community forum with moderation
- `Event` - Community agenda and events
- `AcompanhamentoRecantiano` - Follow-up records for recantianos
- `Desafio` & `DesafioRegistro` - Challenges and completion tracking

### Firestore Collections Structure
```
/users/{userId}                    - User profiles with roles
/materials/{materialId}            - Formation content (PDFs, videos, texts)
/donations/{donationId}            - Donation tracking
/forum_topics/{topicId}            - Forum topics
/forum_posts/{postId}              - Forum posts
/events/{eventId}                  - Community events
/acompanhamentos/{acompanhamentoId} - Recantiano follow-up records
/desafios/{desafioId}              - Challenges
/desafio_registros/{registroId}    - Challenge completion records
```

**Security:** All collections protected by `firestore.rules` with RBAC (Role-Based Access Control). See `SECURITY_BEST_PRACTICES.md` for details.

## Development Guidelines

### Code Quality & Standards
- **Clean Code & SOLID principles** - Always follow clean code practices and SOLID design principles
- **English codebase** - All code (variables, functions, classes, comments) must be in English following community conventions
- **Portuguese UI** - All user-facing content (labels, messages, buttons) must be in Brazilian Portuguese (pt-BR)
- **Responsive design** - UI/UX optimized for both desktop and mobile screens

### API-First Architecture
- **Service layer pattern** - All data access through Firebase services
- **Endpoint-ready structure** - Database and services designed for future mobile app integration
- **Separation of concerns** - UI components separate from business logic
- **Type safety** - Full TypeScript typing for all entities and services

### UI/UX Requirements
- All text visible to users in Brazilian Portuguese
- Responsive layouts using Tailwind CSS mobile-first approach
- DaisyUI components for consistency
- Accessibility considerations (ARIA labels in Portuguese)

## Development Philosophy

This project follows an **API-first** approach with **low maintenance** infrastructure (Firestore, Vercel). Designed for solo developer efficiency with clear separation of concerns and modular code organization.

**Mission:** Reflect the community's charism of compassion and service through digital tools, inspired by Matthew 18:33 - "Should you not have had mercy on your fellow servant, as I had mercy on you?"

---

## Recent Updates

### 2025-10-06: Firestore Migration ✅
- Migrated from Realtime Database to Firestore
- Implemented RBAC security rules
- Created compound query indexes
- Removed migration scripts for security
- Admin user configured
- Full documentation in `MIGRATION_GUIDE.md`
