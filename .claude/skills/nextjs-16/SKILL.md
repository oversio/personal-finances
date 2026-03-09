---
name: nextjs-16
description: >
  Next.js 16 App Router patterns with TanStack Query data fetching.
  Trigger: When working in Next.js App Router (app/), Server Components vs Client Components, Server Actions, Route Handlers, data fetching, and streaming/Suspense.
license: Apache-2.0
metadata:
  author: prowler-cloud
  version: "2.0"
  scope: [root, ui]
  auto_invoke: "App Router / Server Actions / Data Fetching"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## App Router File Conventions

### Main Directory Structure

```
app/
├── layout.tsx          # Root layout (required)
├── page.tsx            # Home page (/)
├── loading.tsx         # Loading UI (Suspense)
├── error.tsx           # Error boundary
├── not-found.tsx       # 404 page
├── (auth)/             # Route group (no URL impact)
│   ├── layout.tsx      # Auth layout
│   ├── _api/           # Shared API code for auth module
│   │   ├── _support/   # Query keys, shared constants
│   │   ├── auth.types.ts
│   │   ├── auth.constants.ts
│   │   └── auth-user/  # Shared endpoint (get-auth-user.ts, use-get-auth-user.ts)
│   ├── login/
│   │   ├── page.tsx
│   │   ├── _api/       # Feature-specific API (login.ts, use-login.ts)
│   │   ├── _components/
│   │   └── _schemas/   # Form validation schemas
│   └── register/
│       ├── page.tsx
│       ├── _api/
│       ├── _components/
│       └── _schemas/
├── (features)/         # Route group (no URL impact)
│   ├── layout.tsx      # Features layout
│   └── [featureName]/  # Feature folder
├── api/                # Next.js Route Handlers (if needed)
│   └── route.ts
├── _actions/           # Server Actions folder
└── _commons/           # Shared code across the app
    ├── api/            # Data fetching infrastructure
    │   ├── fetcher.ts  # Core fetcher function
    │   ├── errors/     # ApiError, ValidationErrors, parseApiError
    │   └── hooks/      # useServerFormValidationErrors
    ├── components/     # Shared UI components
    ├── hooks/          # Shared hooks
    ├── utils/          # Shared utils
    ├── stores/         # Global Zustand stores
    └── types/          # Shared type definitions
```

### Feature Directory Structure (Co-location Pattern)

Each feature folder contains its own `_api/`, `_components/`, `_schemas/`, etc.

```
app/(features)/[featureName]/
├── page.tsx            # Feature page
├── _api/               # API layer for this feature
│   ├── [entity].ts     # Fetcher function (e.g., get-accounts.ts)
│   └── use-[entity].ts # TanStack Query hook (e.g., use-get-accounts.ts)
├── _components/        # Feature-specific components
├── _schemas/           # Form validation schemas (Zod)
├── _hooks/             # Feature-specific hooks (if needed)
└── _stores/            # Feature-specific Zustand stores (if needed)
```

### Route Group `_api/` Structure

For route groups with shared API code (like `(auth)`):

```
(auth)/
├── _api/                           # Shared across auth module
│   ├── _support/
│   │   └── auth-query-keys.ts      # Query key constants
│   ├── auth.types.ts               # Shared types/schemas
│   ├── auth.constants.ts           # Constants like OAuth URLs
│   └── auth-user/                  # Shared endpoint
│       ├── get-auth-user.ts        # Fetcher function
│       └── use-get-auth-user.ts    # Query hook
├── login/
│   └── _api/                       # Feature-specific
│       ├── login.ts                # POST /auth/login
│       └── use-login.ts            # useMutation hook
└── register/
    └── _api/
        ├── register.ts
        └── use-register.ts
```

## Server Components (Default)

```typescript
// No directive needed - async by default
export default async function Page() {
  const data = await db.query();
  return <Component data={data} />;
}
```

## Client-Side Data Fetching (TanStack Query)

### Query Keys (const object pattern)

```typescript
// _api/_support/feature-query-keys.ts
export const FEATURE_QUERY_KEYS = {
  list: "feature-list",
  detail: "feature-detail",
  create: "feature-create",
} as const;
```

### Fetcher Function

```typescript
// _api/get-accounts.ts
import { fetcher } from "@/_commons/api";
import { AccountSchema } from "./account.schema";

export async function getAccounts() {
  return fetcher("/accounts", {
    method: "GET",
    schema: z.array(AccountSchema),
  });
}
```

### Query Hook

```typescript
// _api/use-get-accounts.ts
import { useQuery } from "@tanstack/react-query";
import { ACCOUNT_QUERY_KEYS } from "./_support/account-query-keys";
import { getAccounts } from "./get-accounts";

export function useGetAccounts() {
  return useQuery({
    queryKey: [ACCOUNT_QUERY_KEYS.list],
    queryFn: getAccounts,
  });
}
```

### Mutation Hook

```typescript
// _api/use-create-account.ts
import { useMutation } from "@tanstack/react-query";
import { ACCOUNT_QUERY_KEYS } from "./_support/account-query-keys";
import { createAccount } from "./create-account";

export function useCreateAccount() {
  return useMutation({
    mutationKey: [ACCOUNT_QUERY_KEYS.create],
    mutationFn: createAccount,
  });
}
```

### Form with Server Validation Errors

```typescript
// _components/create-account-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useServerFormValidationErrors } from "@/_commons/api";
import { useCreateAccount } from "../_api/use-create-account";
import { AccountFormData, accountSchema } from "../_schemas/account.schema";

export function CreateAccountForm() {
  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
  });

  const { mutate, isPending, error } = useCreateAccount();

  // Auto-apply server validation errors to form fields
  const generalError = useServerFormValidationErrors(form, error);

  const onSubmit = (data: AccountFormData) => {
    mutate(data, {
      onSuccess: () => router.push("/accounts"),
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {generalError && <Alert variant="error">{generalError}</Alert>}
      <Input {...form.register("name")} error={form.formState.errors.name?.message} />
      <Button type="submit" isLoading={isPending}>Create</Button>
    </form>
  );
}
```

## Server Actions

```typescript
// app/_actions/create-user.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;

  await db.users.create({ data: { name } });

  revalidatePath("/users");
  redirect("/users");
}

// Usage in component
<form action={createUser}>
  <input name="name" required />
  <button type="submit">Create</button>
</form>
```

## Server-Side Data Fetching

```typescript
// Parallel fetching in Server Components
async function Page() {
  const [users, posts] = await Promise.all([
    getUsers(),
    getPosts(),
  ]);
  return <Dashboard users={users} posts={posts} />;
}

// Streaming with Suspense
<Suspense fallback={<Loading />}>
  <SlowComponent />
</Suspense>
```

## Route Handlers (API)

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const users = await db.users.findMany();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.users.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

## Middleware

```typescript
// middleware.ts (root level)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

## Metadata

```typescript
// Static
export const metadata = {
  title: "My App",
  description: "Description",
};

// Dynamic
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);
  return { title: product.name };
}
```

## server-only Package

```typescript
import "server-only";

// This will error if imported in client component
export async function getSecretData() {
  return db.secrets.findMany();
}
```
