# Web Feature Implementation Guide

This guide documents the patterns and structure for implementing new feature modules in the Next.js web application.

## Table of Contents

1. [Feature Structure](#feature-structure)
2. [API Layer](#api-layer)
3. [Schemas](#schemas)
4. [Components](#components)
5. [Pages](#pages)
6. [Implementation Checklist](#implementation-checklist)

---

## Feature Structure

Each feature follows a co-location pattern with API endpoints **grouped by action** in subfolders:

```
apps/web/app/(features)/ws/[workspaceId]/[feature]/
├── page.tsx                              # List page
├── new/page.tsx                          # Create page
├── [id]/edit/page.tsx                    # Edit page
├── _api/
│   ├── _support/
│   │   └── [feature]-query-keys.ts       # Query key constants
│   ├── [feature].types.ts                # Shared Zod schemas
│   ├── get-[entity]-list/                # Grouped by action
│   │   ├── get-[entity]-list.ts          # Fetcher function
│   │   └── use-get-[entity]-list.ts      # TanStack Query hook
│   ├── get-[entity]/
│   │   ├── get-[entity].ts
│   │   └── use-get-[entity].ts
│   ├── create-[entity]/
│   │   ├── create-[entity].ts
│   │   └── use-create-[entity].ts
│   ├── update-[entity]/
│   │   ├── update-[entity].ts
│   │   └── use-update-[entity].ts
│   └── delete-[entity]/
│       ├── delete-[entity].ts
│       └── use-delete-[entity].ts
├── _schemas/
│   └── [feature].schema.ts               # Form validation schemas
└── _components/
    ├── [feature]-form.tsx
    ├── [feature]-list.tsx
    └── [feature]-card.tsx
```

**Why grouped folders?**

- Better organization as the feature grows
- Easier to find related files (fetcher + hook together)
- Cleaner imports
- Consistent with API module structure (commands/queries in folders)

---

## API Layer

### Query Keys

Use const objects (not enums) for query keys:

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

### Types (Zod Schemas)

Shared response schemas go in `[feature].types.ts`:

```typescript
// _api/account.types.ts
import { z } from "zod";

export const AccountSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  type: z.enum(["checking", "savings", "credit", "cash", "investment"]),
  currency: z.string(),
  balance: z.number(),
  color: z.string(),
  isArchived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Account = z.infer<typeof AccountSchema>;

export const AccountListSchema = z.array(AccountSchema);
```

### Fetcher Function

```typescript
// _api/get-accounts/get-accounts.ts
import { fetcher } from "@/_commons/api";
import { AccountListSchema } from "../account.types";

export interface GetAccountsParams {
  workspaceId: string;
}

export async function getAccounts({ workspaceId }: GetAccountsParams) {
  return fetcher(`/ws/${workspaceId}/accounts`, {
    method: "GET",
    schema: AccountListSchema,
  });
}
```

### Query Hook

```typescript
// _api/get-accounts/use-get-accounts.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { ACCOUNT_QUERY_KEYS } from "../_support/account-query-keys";
import { getAccounts, type GetAccountsParams } from "./get-accounts";

export function useGetAccounts(params: GetAccountsParams) {
  return useQuery({
    queryKey: [ACCOUNT_QUERY_KEYS.list, params.workspaceId],
    queryFn: () => getAccounts(params),
  });
}
```

### Mutation Fetcher

```typescript
// _api/create-account/create-account.ts
import { fetcher } from "@/_commons/api";
import { AccountSchema } from "../account.types";

export interface CreateAccountParams {
  workspaceId: string;
  data: {
    name: string;
    type: string;
    currency: string;
    color: string;
  };
}

export async function createAccount({ workspaceId, data }: CreateAccountParams) {
  return fetcher(`/ws/${workspaceId}/accounts`, {
    method: "POST",
    body: data,
    schema: AccountSchema,
  });
}
```

### Mutation Hook

```typescript
// _api/create-account/use-create-account.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ACCOUNT_QUERY_KEYS } from "../_support/account-query-keys";
import { createAccount } from "./create-account";

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [ACCOUNT_QUERY_KEYS.create],
    mutationFn: createAccount,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [ACCOUNT_QUERY_KEYS.list, variables.workspaceId],
      });
    },
  });
}
```

---

## Schemas

Form validation schemas go in `_schemas/`:

```typescript
// _schemas/account.schema.ts
import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
  type: z.enum(["checking", "savings", "credit", "cash", "investment"], {
    error: "Invalid account type",
  }),
  currency: z.string().min(1, { error: "Currency is required" }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { error: "Invalid color format" }),
});

export type CreateAccountFormData = z.infer<typeof createAccountSchema>;
```

---

## Components

### Form Component

```tsx
// _components/account-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Select, SelectItem } from "@heroui/react";
import { useForm } from "react-hook-form";
import { useServerFormValidationErrors } from "@/_commons/api";
import { createAccountSchema, type CreateAccountFormData } from "../_schemas/account.schema";

interface AccountFormProps {
  onSubmit: (data: CreateAccountFormData) => Promise<void>;
  isPending: boolean;
  error: Error | null;
  submitLabel: string;
  defaultValues?: Partial<CreateAccountFormData>;
}

export function AccountForm({ onSubmit, isPending, error, submitLabel, defaultValues }: AccountFormProps) {
  const form = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues,
  });

  const generalError = useServerFormValidationErrors(form, error);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {generalError && <div className="text-danger text-sm">{generalError}</div>}

      <Input
        label="Name"
        {...form.register("name")}
        isInvalid={!!form.formState.errors.name}
        errorMessage={form.formState.errors.name?.message}
      />

      {/* Other fields... */}

      <Button type="submit" color="primary" isLoading={isPending}>
        {submitLabel}
      </Button>
    </form>
  );
}
```

### List Component

```tsx
// _components/account-list.tsx
"use client";

import { Spinner } from "@heroui/react";
import { useGetAccounts } from "../_api/get-accounts/use-get-accounts";
import { AccountCard } from "./account-card";

interface AccountListProps {
  workspaceId: string;
}

export function AccountList({ workspaceId }: AccountListProps) {
  const { data: accounts, isLoading } = useGetAccounts({ workspaceId });

  if (isLoading) {
    return <Spinner />;
  }

  if (!accounts?.length) {
    return <p>No accounts found.</p>;
  }

  return (
    <div className="grid gap-4">
      {accounts.map(account => (
        <AccountCard key={account.id} account={account} />
      ))}
    </div>
  );
}
```

---

## Pages

### List Page

```tsx
// page.tsx
"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AccountList } from "./_components/account-list";

export default function AccountsPage() {
  const params = useParams<{ workspaceId: string }>();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <Button as={Link} href={`/ws/${params.workspaceId}/accounts/new`} color="primary">
          New Account
        </Button>
      </div>

      <AccountList workspaceId={params.workspaceId} />
    </div>
  );
}
```

### Create Page

```tsx
// new/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useCreateAccount } from "../_api/create-account/use-create-account";
import { AccountForm } from "../_components/account-form";
import type { CreateAccountFormData } from "../_schemas/account.schema";

export default function NewAccountPage() {
  const params = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const createMutation = useCreateAccount();

  const handleSubmit = async (data: CreateAccountFormData) => {
    await createMutation.mutateAsync({
      workspaceId: params.workspaceId,
      data,
    });
    router.push(`/ws/${params.workspaceId}/accounts`);
  };

  return (
    <AccountForm
      onSubmit={handleSubmit}
      isPending={createMutation.isPending}
      error={createMutation.error}
      submitLabel="Create Account"
    />
  );
}
```

---

## Implementation Checklist

### API Layer

- [ ] Create `_api/_support/[feature]-query-keys.ts`
- [ ] Create `_api/[feature].types.ts` with Zod schemas
- [ ] Create grouped folders for each endpoint:
  - [ ] `get-[entity]-list/` with fetcher + hook
  - [ ] `get-[entity]/` with fetcher + hook
  - [ ] `create-[entity]/` with fetcher + hook
  - [ ] `update-[entity]/` with fetcher + hook
  - [ ] `delete-[entity]/` with fetcher + hook

### Schemas

- [ ] Create `_schemas/[feature].schema.ts` for form validation

### Components

- [ ] Create `_components/[feature]-form.tsx`
- [ ] Create `_components/[feature]-list.tsx`
- [ ] Create `_components/[feature]-card.tsx` (optional)

### Pages

- [ ] Create `page.tsx` (list page)
- [ ] Create `new/page.tsx` (create page)
- [ ] Create `[id]/edit/page.tsx` (edit page)

### Navigation

- [ ] Add navigation link to sidebar (`app/(features)/_components/app-sidebar.tsx`)

### Verification

- [ ] Run `pnpm check-types --filter=web`
- [ ] Run `pnpm lint --filter=web`
- [ ] Test all CRUD operations in browser
