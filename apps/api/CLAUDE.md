# API Application (NestJS 11)

This document provides AI-specific instructions for working with the API application.

## Quick Reference

| Topic                 | Documentation                                                              |
| --------------------- | -------------------------------------------------------------------------- |
| Module Implementation | [docs/MODULE_IMPLEMENTATION_GUIDE.md](docs/MODULE_IMPLEMENTATION_GUIDE.md) |
| Authentication        | [docs/AUTH_MODULE.md](docs/AUTH_MODULE.md)                                 |
| Database Model        | [docs/DATABASE_MODEL.md](docs/DATABASE_MODEL.md)                           |
| API Standards         | [docs/API_STANDARDS.md](docs/API_STANDARDS.md)                             |
| Transaction Import    | [docs/TRANSACTION_IMPORT.md](docs/TRANSACTION_IMPORT.md)                   |

## Folder Structure

```
src/
├── main.ts                    # Application bootstrap
├── config/                    # Environment configuration
└── modules/
    ├── shared/                # Cross-module utilities & decorators
    │   ├── decorators/        # @CurrentUser, @Public, etc.
    │   ├── guards/            # JwtAuthGuard, etc.
    │   └── filters/           # Exception filters
    └── [module-name]/         # Feature module
        ├── [module].module.ts
        ├── application/       # Use cases, handlers, ports
        │   ├── handlers/      # Command/Query handlers
        │   └── ports/         # Input/Output port interfaces
        ├── domain/            # Business logic (framework-agnostic)
        │   ├── entities/
        │   ├── value-objects/
        │   └── events/
        └── infrastructure/    # External concerns
            ├── controllers/   # HTTP endpoints
            ├── repositories/  # Database implementations
            └── adapters/      # External service adapters
```

## ⛔ Critical Rules

### Layer Dependencies (MUST FOLLOW)

```
Infrastructure → Application → Domain → (nothing)
```

| Layer              | Can Import From     | CANNOT Import From          |
| ------------------ | ------------------- | --------------------------- |
| **Domain**         | Only shared domain  | Application, Infrastructure |
| **Application**    | Domain              | Infrastructure              |
| **Infrastructure** | Domain, Application | —                           |

**Anti-patterns to AVOID:**

- ❌ Application importing from infrastructure (e.g., ports importing schema types)
- ❌ Direct handler calls between modules
- ❌ Domain importing from any other layer

### Cross-Module Communication

**ALWAYS use domain events**, never direct handler calls:

```typescript
// ✅ CORRECT: Emit event
this.eventEmitter.emit("user.registered", { userId, email });

// ❌ WRONG: Direct import
import { CreateWorkspaceHandler } from "@/modules/workspaces/application";
await this.createWorkspaceHandler.execute(...);
```

### Validation with Zod

```typescript
// ✅ Use Zod 4 syntax
const { data, error } = CreateUserSchema.safeParse(input);
if (error) throw new ValidationException(error);

// ❌ Don't use try/catch for validation
try { schema.parse(input); } catch (e) { ... }
```

## Import Aliases

| Alias       | Path          |
| ----------- | ------------- |
| `@/`        | `src/`        |
| `@/modules` | `src/modules` |
| `@/config`  | `src/config`  |

## Testing

```bash
pnpm --filter=api test          # Run tests
pnpm --filter=api test:watch    # Watch mode
pnpm --filter=api test:cov      # Coverage
pnpm --filter=api test:e2e      # E2E tests
```

See `skills/nestjs-testing/` for testing patterns.

## Swagger Documentation

API docs available at: `http://localhost:9000/docs`
