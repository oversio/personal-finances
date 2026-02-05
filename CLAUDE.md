# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

- `packages/ui` (`@repo/ui`) - Shared React component library, exports via `@repo/ui/*` pattern (e.g., `@repo/ui/button`)
- `packages/eslint-config` (`@repo/eslint-config`) - ESLint configs: `base`, `next-js`, `react-internal`
- `packages/typescript-config` (`@repo/typescript-config`) - Shared tsconfig files

## Tech Stack & Patterns (Shared)

### TypeScript (skills/typescript/)

- Use const objects + extracted types instead of union types
- Flat interfaces (no inline nested objects)
- Never use `any`, prefer `unknown` + type guards
- Use `import type` for type-only imports

### Zod 4 (skills/zod-4/)

- Top-level validators: `z.email()`, `z.uuid()`, `z.url()`
- Use `{ error: "message" }` instead of `{ message: "message" }`

---

## API Application (`apps/api`)

### Structure

```
src/
├── main.ts
├── app/
│   └── app.module.ts
└── modules/
    ├── shared/                      # Cross-cutting concerns
    │   ├── domain/value-objects/    # EntityId, etc.
    │   └── infrastructure/exceptions/
    └── [feature]/                   # e.g., transactions, accounts
        ├── [feature].module.ts
        ├── application/
        │   ├── commands/[action]/   # Write operations
        │   ├── queries/[action]/    # Read operations
        │   ├── dtos/                # Zod schemas
        │   ├── ports/               # Repository interfaces
        │   └── event-handlers/      # Domain event listeners
        ├── domain/
        │   ├── entities/
        │   ├── value-objects/
        │   ├── events/
        │   └── exceptions/
        └── infrastructure/
            ├── controllers/
            └── persistence/mongoose/
```

### Patterns (apps/api/skills/nestjs-api/)

- Hexagonal Architecture: domain, application, infrastructure layers
- CQRS: explicit `commands/` and `queries/` folders
- Domain Events with `@nestjs/event-emitter`
- Zod everywhere with `nestjs-zod` for validation
- Repository pattern with ports (interfaces) and adapters (implementations)
- Global exception filter maps domain errors to HTTP responses

### Documentation

- [Authentication Module](apps/api/docs/AUTH_MODULE.md) - JWT auth, OAuth, token strategy, API contracts
- [Database Model](apps/api/docs/DATABASE_MODEL.md) - MongoDB collections and schemas
- [API Standards](apps/api/docs/API_STANDARDS.md) - Error formats, HTTP status codes, pagination, versioning

---

## Web Application (`apps/web`)

### Structure

```
app/
├── layout.tsx, page.tsx, loading.tsx, error.tsx, not-found.tsx
├── (auth)/                   # Route group for auth pages
│   ├── _api/                 # Shared API code for auth module
│   │   ├── _support/         # Query keys, constants
│   │   └── auth-user/        # Shared endpoint
│   ├── login/
│   │   ├── _api/             # Feature-specific (login.ts, use-login.ts)
│   │   ├── _components/
│   │   └── _schemas/         # Form validation schemas
│   └── register/...
├── (features)/               # Route group for feature modules
│   └── [featureName]/
│       ├── _api/             # Feature-specific API
│       │   ├── _support/     # Query keys
│       │   ├── get-*.ts      # Fetcher functions
│       │   └── use-*.ts      # TanStack Query hooks
│       ├── _components/
│       ├── _schemas/
│       └── _stores/          # Feature-specific Zustand stores
├── _actions/                 # Server actions
└── _commons/                 # Shared code
    ├── api/                  # Fetcher, React Query, error handling
    │   ├── fetcher.ts
    │   ├── errors/
    │   └── hooks/
    ├── components/
    ├── stores/               # Global Zustand stores
    ├── types/
    └── utils/
```

### Patterns

#### React 19 (skills/react-19/)

- No manual memoization (React Compiler handles it)
- Named imports: `import { useState } from "react"` (never `import React`)
- Server Components by default, `"use client"` only when needed
- `ref` is a prop (no forwardRef needed)

#### Tailwind CSS 4 (skills/tailwind-4/)

- Never use `var()` in className or hex colors
- Use `cn()` only for conditional classes, not static
- Use `style` prop for truly dynamic values

#### Zustand 5 (skills/zustand-5/)

- Use selectors to prevent re-renders: `useStore((state) => state.field)`
- Use `useShallow` for multiple fields

#### Data Fetching (TanStack Query + Zod)

- Feature APIs co-located in `_api/` folders with separate files per endpoint
- File naming: `get-accounts.ts` (fetcher), `use-get-accounts.ts` (hook)
- Query keys: const objects in `_api/_support/` (not enums)
- Server components: call API functions directly (`getAccounts()`)
- Client components: use hooks (`useGetAccounts()`)
- Form validation errors: `useServerFormValidationErrors(form, mutation.error)`

### Documentation

See [apps/web/CLAUDE.md](apps/web/CLAUDE.md) for AI-specific instructions when working in the web app.

| Document                                              | Description                                     |
| ----------------------------------------------------- | ----------------------------------------------- |
| [Data Fetching](apps/web/docs/DATA_FETCHING.md)       | Fetcher, React Query hooks, schema parsing      |
| [Error Handling](apps/web/docs/ERROR_HANDLING.md)     | ValidationErrors, ApiError, form error handling |
| [Auth Flow](apps/web/docs/AUTH_FLOW.md)               | Login, registration, OAuth, token management    |
| [State Management](apps/web/docs/STATE_MANAGEMENT.md) | Zustand stores, selectors, best practices       |

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
