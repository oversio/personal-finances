# State Management

This document describes the state management approach in the web application.

## Overview

The app uses a combination of:

| Tool                | Purpose                                               |
| ------------------- | ----------------------------------------------------- |
| **TanStack Query**  | Server state (API data, caching, synchronization)     |
| **Zustand**         | Client state (UI state, auth state, user preferences) |
| **React Hook Form** | Form state (validation, submission)                   |

## When to Use What

| State Type  | Example                     | Tool                         |
| ----------- | --------------------------- | ---------------------------- |
| Server data | Accounts list, user profile | TanStack Query               |
| Auth state  | Current user, tokens        | Zustand                      |
| UI state    | Sidebar open, selected tab  | Zustand or React state       |
| Form state  | Input values, errors        | React Hook Form              |
| URL state   | Filters, pagination         | URL params (useSearchParams) |

## Zustand Stores

### File Organization

```
app/
├── _commons/
│   └── stores/           # Global stores (used across features)
│       └── auth.store.ts
└── (features)/
    └── [featureName]/
        └── _stores/      # Feature-specific stores
            └── feature.store.ts
```

### Store Pattern

```typescript
// _commons/stores/example.store.ts
import { create } from "zustand";

// 1. Define state interface
interface ExampleState {
  count: number;
  items: string[];
}

// 2. Define actions interface
interface ExampleActions {
  increment: () => void;
  addItem: (item: string) => void;
  reset: () => void;
}

// 3. Combine into store type
type ExampleStore = ExampleState & ExampleActions;

// 4. Define initial state
const initialState: ExampleState = {
  count: 0,
  items: [],
};

// 5. Create store
export const useExampleStore = create<ExampleStore>()(set => ({
  ...initialState,

  increment: () => set(state => ({ count: state.count + 1 })),

  addItem: item =>
    set(state => ({
      items: [...state.items, item],
    })),

  reset: () => set(initialState),
}));

// 6. Export selectors
export const selectCount = (state: ExampleStore) => state.count;
export const selectItems = (state: ExampleStore) => state.items;
```

### Using Stores in Components

**Always use selectors** to prevent unnecessary re-renders:

```typescript
// Good - only re-renders when count changes
const count = useExampleStore(selectCount);

// Good - inline selector
const count = useExampleStore(state => state.count);

// Bad - re-renders on ANY store change
const { count, items, increment } = useExampleStore();
```

### Multiple Selectors

Use `useShallow` when selecting multiple fields:

```typescript
import { useShallow } from "zustand/react/shallow";

// Good - only re-renders when count OR items change (shallow compare)
const { count, items } = useExampleStore(
  useShallow(state => ({ count: state.count, items: state.items })),
);
```

## Auth Store

The auth store manages authentication state globally.

Location: `app/_commons/stores/auth.store.ts`

### State

```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}
```

### Actions

```typescript
interface AuthActions {
  setAuth: (user: User, tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  setLoading: (isLoading: boolean) => void;
  initializeFromCookies: () => boolean;
  logout: () => void;
}
```

### Usage

```typescript
import {
  useAuthStore,
  selectUser,
  selectIsAuthenticated,
} from "@/_commons/stores/auth.store";

function UserMenu() {
  const user = useAuthStore(selectUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const logout = useAuthStore(state => state.logout);

  if (!isAuthenticated) {
    return <LoginButton />;
  }

  return (
    <div>
      <span>{user?.name}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## TanStack Query for Server State

For data from the API, use TanStack Query hooks instead of Zustand:

```typescript
// Don't do this - duplicating server state in Zustand
const useAccountsStore = create(set => ({
  accounts: [],
  setAccounts: accounts => set({ accounts }),
  fetchAccounts: async () => {
    const data = await getAccounts();
    set({ accounts: data });
  },
}));

// Do this - let TanStack Query manage server state
function AccountsList() {
  const { data: accounts, isLoading } = useGetAccounts();
  // accounts are cached, deduplicated, and auto-refreshed
}
```

## Feature-Specific Stores

For complex features that need local UI state:

```typescript
// (features)/dashboard/_stores/dashboard.store.ts
import { create } from "zustand";

interface DashboardState {
  selectedAccountId: string | null;
  dateRange: { start: Date; end: Date };
  chartType: "bar" | "line" | "pie";
}

interface DashboardActions {
  setSelectedAccount: (id: string | null) => void;
  setDateRange: (range: { start: Date; end: Date }) => void;
  setChartType: (type: "bar" | "line" | "pie") => void;
}

type DashboardStore = DashboardState & DashboardActions;

export const useDashboardStore = create<DashboardStore>()(set => ({
  selectedAccountId: null,
  dateRange: { start: new Date(), end: new Date() },
  chartType: "bar",

  setSelectedAccount: id => set({ selectedAccountId: id }),
  setDateRange: range => set({ dateRange: range }),
  setChartType: type => set({ chartType: type }),
}));
```

## Persistence (Optional)

For state that should persist across sessions, use the persist middleware:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    set => ({
      theme: "light",
      setTheme: theme => set({ theme }),
    }),
    {
      name: "preferences", // localStorage key
    },
  ),
);
```

## Best Practices

1. **Use selectors** - Always select specific fields to prevent re-renders
2. **Keep stores small** - One responsibility per store
3. **Server state in TanStack Query** - Don't duplicate API data in Zustand
4. **Avoid computed state** - Compute in components or use derived selectors
5. **Type everything** - Use interfaces for state and actions
6. **Export selectors** - Makes testing easier and ensures consistency
