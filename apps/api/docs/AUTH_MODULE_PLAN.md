# Authentication Module - Implementation Plan

This document outlines the implementation plan for the Authentication module.

---

## Overview

### Features

- Email/password registration and login
- Google OAuth (full redirect flow)
- JWT access tokens (short-lived)
- Refresh tokens stored in DB (revocable)
- Auto-create workspace on registration
- Session management (logout, logout all)

### Supported Providers

| Provider | Method | Status |
|----------|--------|--------|
| Local | Email + Password | Phase 1 |
| Google | OAuth 2.0 (redirect flow) | Phase 1 |
| Apple | OAuth 2.0 | Future |
| GitHub | OAuth 2.0 | Future |

---

## Database Collections

### Users

```typescript
{
  _id: ObjectId,
  email: string,                    // Unique
  name: string,
  picture?: string,

  // Authentication
  passwordHash?: string,            // For local auth
  authProvider: "local" | "google" | "apple" | "github",
  authProviderId?: string,          // External provider user ID

  // Status
  isEmailVerified: boolean,
  isActive: boolean,

  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt?: Date,
}

// Indexes
// - email (unique)
// - authProvider + authProviderId (unique, sparse)
```

### Refresh Tokens

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  token: string,                    // Hashed token
  expiresAt: Date,
  createdAt: Date,
  revokedAt?: Date,
  userAgent?: string,
  ipAddress?: string,
}

// Indexes
// - token (unique)
// - userId
// - expiresAt (TTL index)
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register with email/password | Public |
| POST | `/auth/login` | Login with email/password | Public |
| GET | `/auth/google` | Redirect to Google consent | Public |
| GET | `/auth/google/callback` | Handle Google callback | Public |
| POST | `/auth/refresh` | Refresh access token | Public |
| POST | `/auth/logout` | Revoke current session | Protected |
| POST | `/auth/logout-all` | Revoke all sessions | Protected |
| GET | `/auth/me` | Get current user | Protected |

---

## Request/Response Contracts

### POST /auth/register

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "authProvider": "local"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "workspace": {
    "id": "...",
    "name": "John Doe's Workspace"
  }
}
```

### POST /auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "authProvider": "local"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### GET /auth/google

**Response:** Redirect to Google consent screen

### GET /auth/google/callback

**Query params:** `?code=xxx&state=xxx`

**Response:** Redirect to frontend with tokens
```
{FRONTEND_URL}/auth/callback?accessToken=xxx&refreshToken=xxx&isNewUser=true
```

### POST /auth/refresh

**Request:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### POST /auth/logout

**Headers:** `Authorization: Bearer <access_token>`

**Request:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### POST /auth/logout-all

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "message": "All sessions revoked",
  "revokedCount": 3
}
```

### GET /auth/me

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "id": "...",
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://...",
  "authProvider": "google",
  "isEmailVerified": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## OAuth Flow

```
┌──────────┐     1. GET /auth/google      ┌──────────┐
│          │ ─────────────────────────────►│          │
│ Frontend │                               │ Backend  │
│          │◄───────────────────────────── │          │
└──────────┘   2. Redirect to Google       └──────────┘
     │                                           │
     │ 3. User consents                          │
     ▼                                           │
┌──────────┐                                     │
│  Google  │ ────────────────────────────────────┘
│          │   4. Redirect to /auth/google/callback
└──────────┘      with ?code=xxx
                       │
                       ▼
              ┌──────────────────┐
              │ Backend:         │
              │ - Exchange code  │
              │ - Get user info  │
              │ - Create/login   │
              │ - Generate tokens│
              └────────┬─────────┘
                       │
                       ▼
              5. Redirect to frontend
                 /auth/callback?accessToken=xxx
```

---

## Token Strategy

| Token | Expiration | Storage | Purpose |
|-------|------------|---------|---------|
| Access Token | 15 min | Frontend memory | API authentication |
| Refresh Token | 7 days | DB (hashed) | Get new access token |

**JWT Access Token Payload:**
```typescript
{
  sub: "user_id",
  email: "user@example.com",
  iat: 1234567890,
  exp: 1234567890
}
```

**Refresh Token Rotation:** On each refresh, the old token is revoked and a new one is issued.

---

## Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (`@$!%*?&`)

**Zod Schema:**
```typescript
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[@$!%*?&]/, "Password must contain a special character");
```

---

## Auto-Create Workspace Flow

When a user registers (local or Google):

```typescript
// 1. Create user
const user = await usersRepository.create({ ... });

// 2. Emit UserRegisteredEvent
eventEmitter.emit("user.registered", new UserRegisteredEvent(user));

// 3. Event handler creates workspace
@OnEvent("user.registered")
async handleUserRegistered(event: UserRegisteredEvent) {
  // Create default workspace
  const workspace = await workspacesRepository.create({
    name: `${event.userName}'s Workspace`,
    ownerId: event.userId,
    currency: "USD",
  });

  // Add user as owner
  await workspaceMembersRepository.create({
    workspaceId: workspace.id,
    userId: event.userId,
    role: "owner",
    joinedAt: new Date(),
  });

  // Seed default categories
  await categoriesSeeder.seed(workspace.id);
}
```

---

## Directory Structure

```
src/modules/
├── auth/
│   ├── auth.module.ts
│   ├── application/
│   │   ├── commands/
│   │   │   ├── register/
│   │   │   │   ├── register.command.ts
│   │   │   │   └── register.handler.ts
│   │   │   ├── login/
│   │   │   │   ├── login.command.ts
│   │   │   │   └── login.handler.ts
│   │   │   ├── google-auth/
│   │   │   │   ├── google-auth.command.ts
│   │   │   │   └── google-auth.handler.ts
│   │   │   ├── refresh-token/
│   │   │   │   ├── refresh-token.command.ts
│   │   │   │   └── refresh-token.handler.ts
│   │   │   ├── logout/
│   │   │   │   ├── logout.command.ts
│   │   │   │   └── logout.handler.ts
│   │   │   └── logout-all/
│   │   │       ├── logout-all.command.ts
│   │   │       └── logout-all.handler.ts
│   │   ├── queries/
│   │   │   └── get-current-user/
│   │   │       ├── get-current-user.query.ts
│   │   │       └── get-current-user.handler.ts
│   │   ├── dtos/
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   ├── logout.dto.ts
│   │   │   └── auth-response.dto.ts
│   │   ├── ports/
│   │   │   ├── users-repository.interface.ts
│   │   │   └── refresh-tokens-repository.interface.ts
│   │   ├── services/
│   │   │   ├── token.service.ts
│   │   │   ├── password.service.ts
│   │   │   └── google-oauth.service.ts
│   │   ├── event-handlers/
│   │   │   └── on-user-registered.handler.ts
│   │   └── constants.ts
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   └── refresh-token.entity.ts
│   │   ├── value-objects/
│   │   │   ├── user-email.ts
│   │   │   ├── user-password.ts
│   │   │   └── auth-provider.ts
│   │   ├── events/
│   │   │   ├── user-registered.event.ts
│   │   │   └── user-logged-in.event.ts
│   │   └── exceptions/
│   │       ├── invalid-credentials.error.ts
│   │       ├── email-already-exists.error.ts
│   │       └── invalid-token.error.ts
│   └── infrastructure/
│       ├── controllers/
│       │   └── auth.controller.ts
│       ├── guards/
│       │   ├── jwt-auth.guard.ts
│       │   └── optional-jwt.guard.ts
│       ├── strategies/
│       │   └── jwt.strategy.ts
│       ├── decorators/
│       │   ├── current-user.decorator.ts
│       │   └── public.decorator.ts
│       └── persistence/
│           └── mongoose/
│               ├── mongo-users.repository.ts
│               ├── mongo-refresh-tokens.repository.ts
│               ├── user.model.ts
│               ├── user.schema.ts
│               ├── refresh-token.model.ts
│               └── refresh-token.schema.ts
│
└── workspaces/
    ├── workspaces.module.ts
    ├── application/
    │   ├── commands/
    │   │   └── create-workspace/
    │   │       ├── create-workspace.command.ts
    │   │       └── create-workspace.handler.ts
    │   ├── ports/
    │   │   ├── workspaces-repository.interface.ts
    │   │   └── workspace-members-repository.interface.ts
    │   └── constants.ts
    ├── domain/
    │   ├── entities/
    │   │   ├── workspace.entity.ts
    │   │   └── workspace-member.entity.ts
    │   ├── value-objects/
    │   │   ├── workspace-name.ts
    │   │   ├── currency.ts
    │   │   └── member-role.ts
    │   └── exceptions/
    │       └── workspace-not-found.error.ts
    └── infrastructure/
        └── persistence/
            └── mongoose/
                ├── mongo-workspaces.repository.ts
                ├── mongo-workspace-members.repository.ts
                ├── workspace.model.ts
                ├── workspace.schema.ts
                ├── workspace-member.model.ts
                └── workspace-member.schema.ts
```

---

## Dependencies

```bash
# Auth & Security
pnpm --filter=api add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt

# Types
pnpm --filter=api add -D @types/passport-jwt @types/bcrypt

# Google OAuth
pnpm --filter=api add google-auth-library

# MongoDB
pnpm --filter=api add @nestjs/mongoose mongoose

# Config
pnpm --filter=api add @nestjs/config
```

---

## Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/personal-finances

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:9000/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:3000

# App
PORT=9000
NODE_ENV=development
```

---

## Implementation Order

### Step 1: Install Dependencies
```bash
pnpm --filter=api add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt google-auth-library @nestjs/mongoose mongoose @nestjs/config
pnpm --filter=api add -D @types/passport-jwt @types/bcrypt
```

### Step 2: Setup Configuration
- Create `.env` file
- Setup ConfigModule

### Step 3: Setup MongoDB
- Configure MongooseModule
- Create connection

### Step 4: Create Shared Value Objects
- Update EntityId if needed

### Step 5: Create Workspaces Module (Basic)
- Workspace entity & value objects
- WorkspaceMember entity
- Repositories (interface + Mongoose)
- CreateWorkspace command

### Step 6: Create Auth Module
1. Domain layer:
   - User entity
   - RefreshToken entity
   - Value objects (email, password, authProvider)
   - Exceptions
   - Events

2. Application layer:
   - Ports (repository interfaces)
   - Services (token, password, google-oauth)
   - DTOs
   - Commands (register, login, google-auth, refresh, logout, logout-all)
   - Queries (get-current-user)
   - Event handlers (on-user-registered)

3. Infrastructure layer:
   - Mongoose models & schemas
   - Repository implementations
   - JWT strategy
   - Guards & decorators
   - Controller

### Step 7: Update App Module
- Import AuthModule
- Import WorkspacesModule

### Step 8: Test Endpoints
- Test register
- Test login
- Test Google OAuth
- Test refresh
- Test logout
- Test me

---

## Security Considerations

1. **Password hashing**: bcrypt with 12 salt rounds
2. **Refresh token hashing**: SHA-256 before storing in DB
3. **Token rotation**: New refresh token on each refresh
4. **Rate limiting**: Consider adding for login/register (future)
5. **CORS**: Restrict to known frontend origins
6. **HTTPS**: Required in production
