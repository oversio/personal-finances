# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⛔ MANDATORY RULES (Check Before Every Implementation)

**STOP and verify these rules before writing any code:**

### 1. Icons MUST go in `packages/ui`

- ❌ **NEVER** create icons directly in `apps/web` or `apps/api`
- ✅ **ALWAYS** create icons in `packages/ui/src/icons/` first
- ✅ Then import via `@repo/ui/icons`
- 📖 See [packages/ui/CLAUDE.md](packages/ui/CLAUDE.md) for icon creation guide

**Before creating an icon, check if it already exists:**

```bash
ls packages/ui/src/icons/
```

### 2. Reusable Code MUST be Abstracted

Before implementing any logic, ask yourself:

- Does similar logic already exist in the codebase?
- Will this logic be needed in more than one place?
- Can this be a shared utility, hook, or component?

**Where to put shared code:**
| Type | Location (Web) | Location (API) |
|------|----------------|----------------|
| UI Components | `packages/ui/src/` | — |
| React Hooks | `apps/web/app/_commons/hooks/` | — |
| Utilities | `apps/web/app/_commons/utils/` | `apps/api/src/modules/shared/` |
| Zustand Stores | `apps/web/app/_commons/stores/` | — |
| Types/Schemas | `apps/web/app/_commons/types/` or feature's `*.types.ts` | Module's `domain/` |
| API Fetchers | `apps/web/app/_commons/api/` or `(features)/_api/` | — |

### 3. Self-Check Before Completing

Before marking any task as complete, verify:

- [ ] No icons created outside `packages/ui`
- [ ] No duplicated logic that should be abstracted
- [ ] Imports use correct package aliases (`@repo/ui/*`)

---

## Documentation Maintenance Rule

**After completing major implementations or refactoring tasks, proactively check and update (if needed) relevant documentation without being asked.**

When to update:

- After refactoring code structure or patterns
- After implementing new features with reusable patterns
- After changing naming conventions or architectural decisions
- After completing multi-step implementation tasks

What to update:

- This file (CLAUDE.md) - architecture, patterns, structure
- `apps/web/docs/MODULE_IMPLEMENTATION_GUIDE.md` - web implementation patterns
- `apps/api/docs/MODULE_IMPLEMENTATION_GUIDE.md` - API implementation patterns
- Feature-specific documentation
- Code examples to match new patterns
- File structure diagrams
- Remove obsolete task-tracking documents

Always mention documentation updates in the final summary.

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Development (all apps)
pnpm dev

# Development (specific app)
pnpm dev --filter=web    # Next.js app on port 3000
pnpm dev --filter=docs   # Docs app on port 3001
pnpm dev --filter=api    # NestJS API on port 9000

# Build
pnpm build
pnpm build --filter=web

# Lint
pnpm lint

# Type check
pnpm check-types

# Format code
pnpm format

# Generate UI component
pnpm --filter=@repo/ui generate:component
```

## Architecture Overview

This is a **Turborepo monorepo** with pnpm workspaces.

### Apps

- `apps/web` - Main Next.js 16 application (React 19)
- `apps/docs` - Documentation Next.js 16 application
- `apps/api` - NestJS 11 backend API (Swagger docs at http://localhost:9000/docs)

### Packages

- `packages/ui` (`@repo/ui`) - Shared React component library, exports via `@repo/ui/*` pattern (e.g., `@repo/ui/icons`). See [packages/ui/CLAUDE.md](packages/ui/CLAUDE.md)
- `packages/eslint-config` (`@repo/eslint-config`) - ESLint configs: `base`, `next-js`, `react-internal`
- `packages/typescript-config` (`@repo/typescript-config`) - Shared tsconfig files

## Tech Stack & Patterns (Shared)

See skills for detailed patterns:

- **TypeScript** (`skills/typescript/`) - const types, flat interfaces, no `any`
- **Zod 4** (`skills/zod-4/`) - top-level validators, `{ error }` syntax

---

## API Application (`apps/api`)

### Patterns

See `skills/nestjs-api/` for full patterns (Hexagonal, CQRS, Domain Events, Zod, Repository pattern).

### Layer Dependencies (CRITICAL)

```
Infrastructure → Application → Domain → (nothing)
```

| Layer              | Can Import From     | Cannot Import From          |
| ------------------ | ------------------- | --------------------------- |
| **Domain**         | Only shared domain  | Application, Infrastructure |
| **Application**    | Domain              | Infrastructure              |
| **Infrastructure** | Domain, Application | -                           |

**Anti-patterns to avoid:**

- Application importing from infrastructure (e.g., ports importing schema types)
- Direct handler calls between modules (use domain events instead)
- Domain importing from any other layer

### Cross-Module Communication

Use **domain events** instead of direct handler calls:

```typescript
// ✅ CORRECT: Emit event, let other modules react
this.eventEmitter.emit("user.registered", { userId, email, provider });

// ❌ WRONG: Direct import and call of another module's handler
import { CreateWorkspaceHandler } from "@/modules/workspaces/application";
await this.createWorkspaceHandler.execute(...);
```

See [MODULE_IMPLEMENTATION_GUIDE.md](apps/api/docs/MODULE_IMPLEMENTATION_GUIDE.md) for detailed rules.

### Testing

See `skills/nestjs-testing/` for patterns. Commands: `pnpm --filter=api test` | `test:watch` | `test:cov` | `test:e2e`

### Documentation

- [Module Implementation Guide](apps/api/docs/MODULE_IMPLEMENTATION_GUIDE.md) - **Layer dependencies, cross-module events, patterns**
- [Authentication Module](apps/api/docs/AUTH_MODULE.md) - JWT auth, OAuth, token strategy, API contracts
- [Database Model](apps/api/docs/DATABASE_MODEL.md) - MongoDB collections and schemas
- [API Standards](apps/api/docs/API_STANDARDS.md) - Error formats, HTTP status codes, pagination, versioning
- [Transaction Import](apps/api/docs/TRANSACTION_IMPORT.md) - CSV import feature with Port/Adapter pattern

---

## Web Application (`apps/web`)

### Patterns

See skills for detailed patterns:

- **React 19** (`skills/react-19/`) - no manual memoization, named imports, Server Components default
- **Tailwind 4** (`skills/tailwind-4/`) - no `var()` in className, `cn()` for conditionals only
- **Zustand 5** (`skills/zustand-5/`) - selectors, `useShallow` for multiple fields

#### Data Fetching (TanStack Query + Zod)

- Feature APIs co-located in `_api/` folders with **endpoints grouped by action in subfolders**
- **List endpoints use `-list` suffix**: `_api/get-account-list/` (not `get-accounts/`)
- Folder structure: `_api/get-account-list/get-account-list.ts` + `use-get-account-list.ts`
- Shared types: `_api/account.types.ts` for Zod schemas used across endpoints
- Query keys: const objects in `_api/_support/` (not enums)
- Server components: call API functions directly (`getAccountList()`)
- Client components: use hooks (`useGetAccountList()`)
- Form validation errors: `useServerFormValidationErrors(form, mutation.error)`

### Documentation

See [apps/web/CLAUDE.md](apps/web/CLAUDE.md) for AI-specific instructions when working in the web app.

| Document                                                  | Description                                       |
| --------------------------------------------------------- | ------------------------------------------------- |
| [Data Fetching](apps/web/docs/DATA_FETCHING.md)           | Fetcher, React Query hooks, schema parsing        |
| [Error Handling](apps/web/docs/ERROR_HANDLING.md)         | ValidationErrors, ApiError, form error handling   |
| [Auth Flow](apps/web/docs/AUTH_FLOW.md)                   | Login, registration, OAuth, token management      |
| [State Management](apps/web/docs/STATE_MANAGEMENT.md)     | Zustand stores, selectors, best practices         |
| [Transaction Import](apps/web/docs/TRANSACTION_IMPORT.md) | CSV import wizard, file upload, validation UI     |
| [Reports Module](apps/web/docs/REPORTS_MODULE.md)         | Aggregation endpoints, on-demand popovers, tables |

---

## Code Style

- 2 spaces, no tabs
- Double quotes, semicolons
- LF line endings
- Arrow function parens avoided when possible (`x => x`)
- Trailing commas in ES5 contexts

## Claude Interaction Guidelines

**IMPORTANT:** If you need to understand some app structure and/or patterns, trust the documentation first, only explore code when:

- docs are missing or unclear.
- docs are outdated (confirm with the user in this case, update the docs).

**Challenge assumptions, don't just comply:**

- When I make a request based on a misunderstanding or incomplete knowledge, **explain what's already in place** before making changes
- Present trade-offs objectively and recommend the best approach
- If I suggest something suboptimal, **question me** and explain why another approach might be better
- Only proceed with my explicit choice if I insist after understanding the alternatives
- Goal: Help me learn and make informed decisions, not just execute commands

**Example behavior:**

- ❌ User: "We need an env file for API URL" → Immediately creates env file
- ✅ User: "We need an env file for API URL" → "We're already using Next.js rewrites to proxy `/api/*` to the backend. Here are the trade-offs between rewrites vs env vars... Which approach do you prefer?"
