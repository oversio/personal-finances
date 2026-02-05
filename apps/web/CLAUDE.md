# Web Application (Next.js 16)

This document provides AI-specific instructions for working with the web application.

## Quick Reference

| Topic            | Documentation                                        |
| ---------------- | ---------------------------------------------------- |
| Data Fetching    | [docs/DATA_FETCHING.md](docs/DATA_FETCHING.md)       |
| Error Handling   | [docs/ERROR_HANDLING.md](docs/ERROR_HANDLING.md)     |
| Auth Flow        | [docs/AUTH_FLOW.md](docs/AUTH_FLOW.md)               |
| State Management | [docs/STATE_MANAGEMENT.md](docs/STATE_MANAGEMENT.md) |

## Folder Structure Conventions

### Feature Co-location Pattern

Each feature owns its API code, components, schemas, and hooks:

```
app/(auth)/login/
├── page.tsx              # Route page
├── _api/                 # Data fetching for this feature
│   ├── login.ts          # Fetcher function
│   └── use-login.ts      # TanStack Query hook
├── _components/          # Feature-specific components
│   └── login-form.tsx
└── _schemas/             # Form validation schemas
    └── login.schema.ts
```

### Shared API Code in Route Groups

Route groups like `(auth)` can have shared `_api/` folders:

```
(auth)/
├── _api/                 # Shared across auth module
│   ├── _support/         # Query keys, constants
│   ├── auth.types.ts     # Shared schemas
│   └── auth-user/        # Shared endpoint
└── login/_api/           # Feature-specific
```

### Global Shared Code

```
_commons/
├── api/                  # Data fetching infrastructure
│   ├── fetcher.ts        # Core fetcher (use this, not raw axios)
│   ├── errors/           # Error classes
│   └── hooks/            # useServerFormValidationErrors
├── stores/               # Global Zustand stores
├── types/                # Shared type definitions
└── utils/                # Shared utilities
```

## Coding Patterns

### Data Fetching

**Always use the `fetcher` function** from `@/_commons/api` - never raw axios:

```typescript
// _api/get-accounts.ts
import { fetcher } from "@/_commons/api";

export async function getAccounts() {
  return fetcher("/accounts", {
    method: "GET",
    schema: AccountListSchema,
  });
}
```

### Query Keys

**Use const objects**, not enums:

```typescript
// _api/_support/account-query-keys.ts
export const ACCOUNT_QUERY_KEYS = {
  list: "accounts-list",
  detail: "accounts-detail",
  create: "accounts-create",
} as const;
```

### Form Validation Errors

**Use `useServerFormValidationErrors`** to auto-apply server errors to forms:

```typescript
const form = useForm<FormData>();
const { mutate, error } = useCreateAccount();

// Auto-applies field errors, returns general error message
const generalError = useServerFormValidationErrors(form, error);
```

### Zustand Stores

**Use selectors** to prevent re-renders:

```typescript
// Good - only re-renders when user changes
const user = useAuthStore(state => state.user);

// Bad - re-renders on any store change
const { user, isLoading } = useAuthStore();
```

## Import Aliases

| Alias            | Path               |
| ---------------- | ------------------ |
| `@/_commons/*`   | `app/_commons/*`   |
| `@/(auth)/*`     | `app/(auth)/*`     |
| `@/(features)/*` | `app/(features)/*` |

## When Creating New Features

1. Create folder under appropriate route group
2. Add `_api/` folder with fetcher function + hook
3. Add `_schemas/` folder for form validation
4. Add `_components/` folder for UI components
5. Use `useServerFormValidationErrors` for forms with mutations
6. Add query keys to `_support/` folder if shared within module

## API Communication

- All API calls go through Next.js rewrites to `/api/*` → backend
- The `fetcher` function handles:
  - Zod schema parsing for responses
  - 422 errors → `ValidationErrors` (field + general errors)
  - Other errors → `ApiError` (401, 403, 404, 500, etc.)
- See [API_STANDARDS.md](../api/docs/API_STANDARDS.md) for backend error formats
