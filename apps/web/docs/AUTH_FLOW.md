# Authentication Flow

This document describes the authentication architecture in the web application.

## Overview

The app supports two authentication methods:

1. **Local authentication** - Email/password login and registration
2. **OAuth authentication** - Google (extensible to Apple, GitHub)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Components                               │
│  LoginForm, RegisterForm, LogoutButton                          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                     TanStack Query Hooks                        │
│  useLogin(), useRegister(), useLogout(), useGetAuthUser()       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                      Zustand Store                              │
│  useAuthStore: user, tokens, isAuthenticated                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                    Cookies (HttpOnly)                           │
│  accessToken, refreshToken                                      │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
app/(auth)/
├── layout.tsx                    # Auth pages layout
├── _api/
│   ├── _support/
│   │   └── auth-query-keys.ts    # Query key constants
│   ├── auth.types.ts             # AuthTokens, AuthResponse schemas
│   ├── auth.constants.ts         # getGoogleAuthUrl()
│   └── auth-user/
│       ├── get-auth-user.ts      # GET /auth/me
│       └── use-get-auth-user.ts  # useQuery hook
├── login/
│   ├── page.tsx
│   ├── _api/
│   │   ├── login.ts              # POST /auth/login
│   │   └── use-login.ts          # useMutation hook
│   ├── _components/
│   │   └── login-form.tsx
│   └── _schemas/
│       └── login.schema.ts       # Form validation
├── register/
│   ├── page.tsx
│   ├── _api/
│   │   ├── register.ts           # POST /auth/register
│   │   └── use-register.ts       # useMutation hook
│   ├── _components/
│   │   └── register-form.tsx
│   └── _schemas/
│       └── register.schema.ts
├── logout/
│   └── _api/
│       ├── logout.ts             # POST /auth/logout
│       └── use-logout.ts         # useMutation hook
└── oauth/
    └── callback/
        └── page.tsx              # OAuth callback handler
```

## Local Authentication Flow

### Login

```
User → LoginForm → useLogin() → POST /auth/login
                                      │
                                      ▼
                              Backend sets cookies
                              Returns { user, tokens }
                                      │
                                      ▼
                        useAuthStore.setAuth(user, tokens)
                                      │
                                      ▼
                              router.push("/dashboard")
```

### Registration

```
User → RegisterForm → useRegister() → POST /auth/register
                                            │
                                            ▼
                                    Backend sets cookies
                                    Returns { user, tokens }
                                            │
                                            ▼
                          useAuthStore.setAuth(user, tokens)
                                            │
                                            ▼
                                    router.push("/dashboard")
```

## OAuth Flow (Google)

### Step 1: Initiate OAuth

```typescript
// login-form.tsx
const handleGoogleLogin = () => {
  // Store intended destination
  sessionStorage.setItem("redirectAfterAuth", "/dashboard");
  // Redirect to Google OAuth
  window.location.href = getGoogleAuthUrl();
};
```

### Step 2: OAuth Callback

```
Google → /oauth/callback → Backend exchanges code for tokens
                                   │
                                   ▼
                           Sets cookies, redirects to /oauth/callback
                                   │
                                   ▼
                           AuthCallbackPage component
                           1. Gets tokens from cookies
                           2. Fetches user via getAuthUser()
                           3. Stores in Zustand
                           4. Redirects to intended destination
```

### OAuth Callback Page

```typescript
// oauth/callback/page.tsx
export default function AuthCallbackPage() {
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);

  useEffect(() => {
    async function handleCallback() {
      try {
        const tokens = getAuthTokensFromCookies();

        if (!tokens.accessToken || !tokens.refreshToken) {
          throw new Error("No tokens found");
        }

        const user = await getAuthUser();

        setAuth(user, {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });

        const redirectTo = sessionStorage.getItem("redirectAfterAuth") || "/dashboard";
        sessionStorage.removeItem("redirectAfterAuth");
        router.push(redirectTo);
      } catch {
        router.push("/login?error=oauth_failed");
      }
    }

    handleCallback();
  }, [router, setAuth]);

  return <Spinner />;
}
```

## Auth Store

Location: `app/_commons/stores/auth.store.ts`

### State

| Field             | Type             | Description                             |
| ----------------- | ---------------- | --------------------------------------- |
| `user`            | `User \| null`   | Current user object                     |
| `accessToken`     | `string \| null` | JWT access token                        |
| `refreshToken`    | `string \| null` | JWT refresh token                       |
| `isAuthenticated` | `boolean`        | Whether user is authenticated           |
| `isLoading`       | `boolean`        | Loading state                           |
| `isInitialized`   | `boolean`        | Whether auth state has been initialized |

### Actions

| Action                    | Description                                |
| ------------------------- | ------------------------------------------ |
| `setAuth(user, tokens)`   | Set user and tokens after login            |
| `setUser(user)`           | Update user only                           |
| `setTokens(tokens)`       | Update tokens only                         |
| `initializeFromCookies()` | Initialize tokens from cookies on app load |
| `logout()`                | Clear auth state and cookies               |

### Selectors

```typescript
import { useAuthStore, selectUser, selectIsAuthenticated } from "@/_commons/stores/auth.store";

// Use selectors to prevent unnecessary re-renders
const user = useAuthStore(selectUser);
const isAuthenticated = useAuthStore(selectIsAuthenticated);
```

## Token Management

### Storage

- **Cookies**: HttpOnly cookies set by backend (secure, cross-request)
- **Zustand Store**: In-memory for client-side access

### Token Refresh

The `apiClient` (axios) has an interceptor that:

1. Attaches `Authorization: Bearer {accessToken}` to requests
2. On 401 response, attempts to refresh token
3. Retries original request with new token

## Protected Routes

Route protection uses a two-layer approach:

### Layer 1: Next.js Middleware (Server-side)

The middleware runs before any page renders and provides fast redirects based on cookie presence:

```typescript
// middleware.ts
const PUBLIC_ROUTES = ["/", "/login", "/register", "/oauth/callback"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.has("accessToken");

  // Redirect authenticated users away from auth pages
  if (hasToken && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login for protected routes
  if (!hasToken && !isPublicRoute(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
```

### Layer 2: Protected Layout (Client-side)

The `(features)/layout.tsx` handles auth state initialization and user fetching:

```typescript
// (features)/layout.tsx
export default function FeaturesLayout({ children }) {
  // 1. Initialize tokens from cookies
  // 2. Fetch user if tokens exist but no user in store
  // 3. Handle loading state
  // 4. Redirect if not authenticated
}
```

### Redirect After Login

When middleware redirects to `/login`, it passes a `redirect` query param:
- `/login?redirect=/dashboard/settings`

Both `LoginForm` and `RegisterForm` read this param and redirect back after successful authentication.

## Query Keys

```typescript
// _api/_support/auth-query-keys.ts
export const AUTH_QUERY_KEYS = {
  authUser: "auth-user",
  login: "login",
  register: "register",
  logout: "logout",
} as const;
```
