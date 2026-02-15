# Data Fetching Pattern

This document describes the data fetching architecture for the web application.

## Overview

The app uses a combination of:

- **axios** - HTTP client with auth interceptors
- **TanStack Query** - Caching, deduplication, background refetching
- **Zod** - Response parsing and validation

## File Structure

```
_commons/api/
├── index.ts                    # Barrel exports
├── fetcher.ts                  # Core fetch function
├── query-client-provider.tsx   # React Query setup
├── errors/
│   ├── validation-errors.ts    # ValidationErrors class for 422s
│   ├── api-error.ts            # ApiError class for standard errors
│   ├── parse-api-error.ts      # Error parsing logic
│   └── api-validation-errors-schema.ts
├── hooks/
│   └── use-server-form-validation-errors.ts
├── get-pagination-response.ts  # Paginated response schema
├── get-many-response.ts        # Array response schema
├── get-one-item-response.ts    # Single item response schema
└── list-of.ts                  # Array helper
```

## The Fetcher

Core function for all API requests. You typically don't use this directly - instead, create feature-specific API functions that use it internally.

```typescript
import { fetcher, apiPaginationResponseTransformer } from "@/_commons/api";

// GET with schema parsing
const accounts = await fetcher("/accounts", {
  schema: apiPaginationResponseTransformer(AccountSchema),
});

// POST
const newAccount = await fetcher("/accounts", {
  method: "POST",
  body: { name: "Savings" },
  schema: apiOneItemResponseTransformer(AccountSchema),
});

// DELETE
await fetcher(`/accounts/${id}`, { method: "DELETE" });
```

### Error Handling

The fetcher throws different error types:

| Status             | Error Type         | Handling                        |
| ------------------ | ------------------ | ------------------------------- |
| 422                | `ValidationErrors` | Form fields via hook            |
| 401, 403, 404, 500 | `ApiError`         | Global handler / Error boundary |

## Feature-Specific API Code

Each feature has its own `_api/` folder with endpoints **grouped by action** in subfolders:

```
(features)/accounts/
├── _api/
│   ├── _support/
│   │   └── account-query-keys.ts    # Query key constants
│   ├── account.types.ts             # Zod schemas (shared types)
│   ├── get-accounts/                # Grouped by action
│   │   ├── get-accounts.ts          # Fetcher function
│   │   └── use-get-accounts.ts      # Query hook
│   ├── get-account/
│   │   ├── get-account.ts
│   │   └── use-get-account.ts
│   ├── create-account/
│   │   ├── create-account.ts
│   │   └── use-create-account.ts
│   ├── update-account/
│   │   ├── update-account.ts
│   │   └── use-update-account.ts
│   └── delete-account/
│       ├── delete-account.ts
│       └── use-delete-account.ts
├── _schemas/
│   └── account-form.schema.ts       # Form validation schemas
├── _components/
└── page.tsx
```

**Why grouped folders?**
- Better organization as the feature grows
- Easier to find related files (fetcher + hook together)
- Cleaner imports
- Consistent with API module structure (commands/queries in folders)

### Query Keys (const object pattern)

```typescript
// _api/_support/account-query-keys.ts
export const ACCOUNT_QUERY_KEYS = {
  list: "accounts-list",
  detail: "accounts-detail",
  create: "accounts-create",
  update: "accounts-update",
  delete: "accounts-delete",
} as const;
```

### Example: account.schema.ts

```typescript
import { z } from "zod";

export const AccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  balance: z.number(),
  createdAt: z.string().transform(s => new Date(s)),
});

export type Account = z.infer<typeof AccountSchema>;
```

### Example: get-accounts/get-accounts.ts

```typescript
import { fetcher, apiPaginationResponseTransformer } from "@/_commons/api";
import { AccountSchema } from "../account.types";

export async function getAccounts(params?: { page?: number; limit?: number }) {
  return fetcher("/accounts", {
    method: "GET",
    params,
    schema: apiPaginationResponseTransformer(AccountSchema),
  });
}
```

### Example: get-accounts/use-get-accounts.ts

```typescript
import { useQuery } from "@tanstack/react-query";
import { ACCOUNT_QUERY_KEYS } from "../_support/account-query-keys";
import { getAccounts } from "./get-accounts";

export function useGetAccounts(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [ACCOUNT_QUERY_KEYS.list, params],
    queryFn: () => getAccounts(params),
  });
}
```

### Example: create-account/create-account.ts

```typescript
import { fetcher, apiOneItemResponseTransformer } from "@/_commons/api";
import { AccountSchema } from "../account.types";

export interface CreateAccountInput {
  name: string;
  type: "checking" | "savings" | "credit";
}

export async function createAccount(data: CreateAccountInput) {
  return fetcher("/accounts", {
    method: "POST",
    body: data,
    schema: apiOneItemResponseTransformer(AccountSchema),
  });
}
```

### Example: create-account/use-create-account.ts

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ACCOUNT_QUERY_KEYS } from "../_support/account-query-keys";
import { createAccount } from "./create-account";

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [ACCOUNT_QUERY_KEYS.create],
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACCOUNT_QUERY_KEYS.list] });
    },
  });
}
```

## Usage

### Client Components (with React Query)

```tsx
"use client";

import { useGetAccounts } from "./_api/get-accounts/use-get-accounts";

function AccountsList() {
  const { data, isLoading, error } = useGetAccounts({ page: 1, limit: 10 });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <ul>
      {data?.data.map(account => (
        <li key={account.id}>{account.name}</li>
      ))}
    </ul>
  );
}
```

### Server Components (direct API call)

```tsx
// Server component - no "use client" directive
import { getAccounts } from "./_api/get-accounts/get-accounts";

async function AccountsPage() {
  const { data: accounts } = await getAccounts({ page: 1, limit: 10 });

  return <AccountsList accounts={accounts} />;
}
```

### Summary

| Context              | What to use                           |
| -------------------- | ------------------------------------- |
| **Client component** | `useGetAccounts()` hook (React Query) |
| **Server component** | `getAccounts()` function directly     |

Both use the same underlying fetcher and Zod parsing - the hooks just add React Query's caching/state management on top.

## Handling Form Validation Errors

Use the `useServerFormValidationErrors` hook to automatically apply server validation errors to forms:

```tsx
"use client";

import { useForm } from "react-hook-form";
import { useServerFormValidationErrors } from "@/_commons/api";
import { useCreateAccount } from "./_api/accounts.hooks";

function CreateAccountForm() {
  const form = useForm<{ name: string }>();
  const mutation = useCreateAccount();

  // Automatically applies field errors, returns general errors
  const generalError = useServerFormValidationErrors(form, mutation.error);

  return (
    <form onSubmit={form.handleSubmit(data => mutation.mutate(data))}>
      {generalError && <Alert variant="error">{generalError}</Alert>}

      <Input {...form.register("name")} error={form.formState.errors.name?.message} />

      <Button type="submit" isLoading={mutation.isPending}>
        Create Account
      </Button>
    </form>
  );
}
```

## Error Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                       API Request                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         fetcher()                            │
│  - Makes request via axios                                   │
│  - Parses response with Zod schema                          │
│  - On error: throws ValidationErrors or ApiError            │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
     ┌────────────────┐              ┌────────────────┐
     │ ValidationErrors│              │    ApiError    │
     │    (422)       │              │ (401,404,500)  │
     └────────────────┘              └────────────────┘
              │                               │
              ▼                               ▼
     ┌────────────────┐              ┌────────────────┐
     │ useServerForm- │              │ Global handler │
     │ ValidationErrors│              │ (console.error)│
     │ - Sets form    │              │ Future: toast  │
     │   field errors │              └────────────────┘
     │ - Returns      │
     │   general msg  │
     └────────────────┘
```
