# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Development (all apps)
pnpm dev

# Development (specific app)
pnpm dev --filter=web    # Main app on port 3000
pnpm dev --filter=docs   # Docs app on port 3001

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

## Architecture

This is a **Turborepo monorepo** with pnpm workspaces.

### Apps
- `apps/web` - Main Next.js 16 application (React 19)
- `apps/docs` - Documentation Next.js 16 application

### Packages
- `packages/ui` (`@repo/ui`) - Shared React component library, exports via `@repo/ui/*` pattern (e.g., `@repo/ui/button`)
- `packages/eslint-config` (`@repo/eslint-config`) - ESLint configs: `base`, `next-js`, `react-internal`
- `packages/typescript-config` (`@repo/typescript-config`) - Shared tsconfig files

### Next.js App Router Structure
```
app/
├── layout.tsx, page.tsx, loading.tsx, error.tsx, not-found.tsx
├── (auth)/              # Route group for auth pages
├── (features)/          # Route group for feature modules
│   └── [featureName]/
│       ├── _components/ # Feature-specific components
│       ├── _hooks/      # Feature-specific hooks
│       └── _stores/     # Feature-specific Zustand stores
├── api/                 # Route handlers
├── _actions/            # Server actions
└── _commons/            # Shared code
    ├── components/      # Shared components (React Aria + Tailwind)
    ├── hooks/
    ├── utils/
    └── stores/          # Global Zustand stores
```

## Tech Stack & Patterns (see skills/ for detailed guidance)

### TypeScript (skills/typescript/)
- Use const objects + extracted types instead of union types
- Flat interfaces (no inline nested objects)
- Never use `any`, prefer `unknown` + type guards
- Use `import type` for type-only imports

### React 19 (skills/react-19/)
- No manual memoization (React Compiler handles it)
- Named imports: `import { useState } from "react"` (never `import React`)
- Server Components by default, `"use client"` only when needed
- `ref` is a prop (no forwardRef needed)

### Tailwind CSS 4 (skills/tailwind-4/)
- Never use `var()` in className or hex colors
- Use `cn()` only for conditional classes, not static
- Use `style` prop for truly dynamic values

### Zustand 5 (skills/zustand-5/)
- Use selectors to prevent re-renders: `useStore((state) => state.field)`
- Use `useShallow` for multiple fields

### Zod 4 (skills/zod-4/)
- Top-level validators: `z.email()`, `z.uuid()`, `z.url()`
- Use `{ error: "message" }` instead of `{ message: "message" }`

## Code Style

- 2 spaces, no tabs
- Double quotes, semicolons
- LF line endings
- Arrow function parens avoided when possible (`x => x`)
- Trailing commas in ES5 contexts
