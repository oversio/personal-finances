---
name: nestjs-api
description: >
  NestJS API architecture with Hexagonal/Clean Architecture, DDD, and CQRS patterns.
  Trigger: When working in apps/api with NestJS modules, use cases, repositories, domain entities, or API endpoints.
license: Apache-2.0
metadata:
  author: oma-solutions
  version: "1.0"
  scope: [api]
  auto_invoke: "Working with NestJS API code"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## Architecture Overview

This API follows **Hexagonal Architecture** (Ports & Adapters) with **DDD** (Domain-Driven Design) and **CQRS** (Command Query Responsibility Segregation).

```
┌─────────────────────────────────────────────────────────────┐
│                      Infrastructure                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Controllers │  │  Mongoose   │  │  External Services  │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│         ▼                ▼                     ▼             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    Ports (Interfaces)                │    │
│  └─────────────────────────┬───────────────────────────┘    │
└────────────────────────────┼────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│                      Application                             │
│         ┌──────────────────┴──────────────────┐             │
│         │         Commands & Queries          │             │
│         │     (Use Cases / Handlers)          │             │
│         └──────────────────┬──────────────────┘             │
│                            │                                 │
│         ┌──────────────────┴──────────────────┐             │
│         │          Domain Events              │             │
│         └─────────────────────────────────────┘             │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│                        Domain                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Entities   │  │Value Objects│  │  Domain Exceptions  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── main.ts                          # Bootstrap + Swagger setup
├── app/
│   ├── app.module.ts                # Root module
│   └── health/                      # Health check endpoint
│       └── api/
├── modules/
│   ├── shared/                      # Cross-cutting concerns
│   │   ├── domain/
│   │   │   ├── value-objects/       # EntityId, etc.
│   │   │   └── exceptions/          # Base domain exceptions
│   │   └── infrastructure/
│   │       ├── exceptions/          # Global exception filters
│   │       ├── pipes/               # Zod validation pipe
│   │       └── helpers/
│   │
│   └── [feature]/                   # Feature module (e.g., transactions)
│       ├── [feature].module.ts      # NestJS module definition
│       ├── application/
│       │   ├── commands/            # Write operations
│       │   │   └── create-[entity]/
│       │   │       ├── create-[entity].command.ts
│       │   │       └── create-[entity].handler.ts
│       │   ├── queries/             # Read operations
│       │   │   └── find-[entity]-by-id/
│       │   │       ├── find-[entity]-by-id.query.ts
│       │   │       └── find-[entity]-by-id.handler.ts
│       │   ├── dtos/                # Zod schemas + DTOs
│       │   ├── ports/               # Repository interfaces
│       │   ├── event-handlers/      # Domain event listeners
│       │   └── constants.ts         # DI tokens
│       ├── domain/
│       │   ├── entities/            # Aggregate roots
│       │   ├── value-objects/       # Type-safe primitives
│       │   ├── events/              # Domain events
│       │   └── exceptions/          # Domain-specific errors
│       └── infrastructure/
│           ├── controllers/         # HTTP endpoints
│           └── persistence/
│               └── mongoose/        # MongoDB implementation
│                   ├── mongo-[entity].repository.ts
│                   ├── [entity].model.ts
│                   └── [entity].schema.ts
```

## Layer Responsibilities

### Domain Layer (Core Business Logic)

**No framework dependencies. Pure TypeScript.**

- **Entities**: Aggregate roots with business behavior
- **Value Objects**: Immutable, validated primitive wrappers
- **Domain Events**: Capture significant domain occurrences
- **Domain Exceptions**: Business rule violations

### Application Layer (Orchestration)

- **Commands**: Write operations that change state
- **Queries**: Read operations that return data
- **Ports**: Interfaces for external dependencies (repositories)
- **Event Handlers**: React to domain events
- **DTOs**: API contracts with Zod validation

### Infrastructure Layer (External Concerns)

- **Controllers**: HTTP request/response handling
- **Repositories**: Database implementations
- **External Services**: Third-party API clients

## CQRS Pattern

### Commands (Write Operations)

```typescript
// application/commands/create-transaction/create-transaction.command.ts
export class CreateTransactionCommand {
  constructor(
    public readonly accountId: string,
    public readonly amount: number,
    public readonly description: string,
    public readonly category: string,
  ) {}
}

// application/commands/create-transaction/create-transaction.handler.ts
import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { INJECTION_TOKENS } from "../../constants";
import type { ITransactionsRepository } from "../../ports/transactions-repository.interface";
import { Transaction } from "../../../domain/entities/transaction.entity";
import { TransactionCreatedEvent } from "../../../domain/events/transaction-created.event";
import { CreateTransactionCommand } from "./create-transaction.command";

@Injectable()
export class CreateTransactionHandler {
  constructor(
    @Inject(INJECTION_TOKENS.TRANSACTIONS_REPOSITORY)
    private readonly repository: ITransactionsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: CreateTransactionCommand): Promise<Transaction> {
    const transaction = Transaction.create(
      undefined,
      command.accountId,
      command.amount,
      command.description,
      command.category,
    );

    const saved = await this.repository.create(transaction);

    this.eventEmitter.emit(
      "transaction.created",
      new TransactionCreatedEvent(saved.id!.value, saved.accountId.value, saved.amount.value),
    );

    return saved;
  }
}
```

### Queries (Read Operations)

```typescript
// application/queries/find-transaction-by-id/find-transaction-by-id.query.ts
export class FindTransactionByIdQuery {
  constructor(public readonly id: string) {}
}

// application/queries/find-transaction-by-id/find-transaction-by-id.handler.ts
import { Inject, Injectable } from "@nestjs/common";
import { INJECTION_TOKENS } from "../../constants";
import type { ITransactionsRepository } from "../../ports/transactions-repository.interface";
import { EntityId } from "../../../../shared/domain/value-objects/entity-id";
import { TransactionNotFoundError } from "../../../domain/exceptions/transaction-not-found.error";
import { FindTransactionByIdQuery } from "./find-transaction-by-id.query";

@Injectable()
export class FindTransactionByIdHandler {
  constructor(
    @Inject(INJECTION_TOKENS.TRANSACTIONS_REPOSITORY)
    private readonly repository: ITransactionsRepository,
  ) {}

  async execute(query: FindTransactionByIdQuery) {
    const transaction = await this.repository.findById(new EntityId(query.id));

    if (!transaction) {
      throw new TransactionNotFoundError(query.id);
    }

    return transaction;
  }
}
```

## Domain Events

### Event Definition

```typescript
// domain/events/transaction-created.event.ts
export class TransactionCreatedEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly transactionId: string,
    public readonly accountId: string,
    public readonly amount: number,
  ) {
    this.occurredAt = new Date();
  }
}
```

### Event Handler

```typescript
// application/event-handlers/on-transaction-created.handler.ts
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { TransactionCreatedEvent } from "../../domain/events/transaction-created.event";

@Injectable()
export class OnTransactionCreatedHandler {
  @OnEvent("transaction.created")
  async handle(event: TransactionCreatedEvent) {
    // Update account balance
    // Check budget alerts
    // Send notification
    console.log(`Transaction ${event.transactionId} created for $${event.amount}`);
  }
}
```

### Module Setup

```typescript
// app.module.ts
import { EventEmitterModule } from "@nestjs/event-emitter";

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    // ... other modules
  ],
})
export class AppModule {}
```

## Zod Validation (DTOs)

### Schema Definition

```typescript
// application/dtos/create-transaction.dto.ts
import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string().min(1).max(255),
  category: z.string().min(1).max(50),
});

export class CreateTransactionDto extends createZodDto(createTransactionSchema) {}

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
```

### Global Validation Pipe

```typescript
// main.ts
import { ZodValidationPipe } from "nestjs-zod";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe());
  // ...
}
```

### Swagger Integration

```typescript
// main.ts
import { cleanupOpenApiDoc } from "nestjs-zod";

const config = new DocumentBuilder()
  .setTitle("Personal Finances API")
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup("docs", app, cleanupOpenApiDoc(document));
```

## Value Objects

```typescript
// domain/value-objects/transaction-amount.ts
import { z } from "zod";

const schema = z.number().positive({ message: "Amount must be positive" });

export class TransactionAmount {
  readonly value: number;

  constructor(value: number) {
    this.value = schema.parse(value);
  }
}

// domain/value-objects/transaction-description.ts
import { z } from "zod";

const schema = z.string().min(1).max(255);

export class TransactionDescription {
  readonly value: string;

  constructor(value: string) {
    this.value = schema.parse(value);
  }
}
```

## Entities

```typescript
// domain/entities/transaction.entity.ts
import { EntityId } from "../../../shared/domain/value-objects/entity-id";
import { TransactionAmount } from "../value-objects/transaction-amount";
import { TransactionDescription } from "../value-objects/transaction-description";

export class Transaction {
  constructor(
    public readonly id: EntityId | undefined,
    public readonly accountId: EntityId,
    public readonly amount: TransactionAmount,
    public readonly description: TransactionDescription,
    public readonly category: string,
    public readonly createdAt: Date,
  ) {}

  static create(
    id: string | undefined,
    accountId: string,
    amount: number,
    description: string,
    category: string,
    createdAt?: Date,
  ): Transaction {
    return new Transaction(
      id ? new EntityId(id) : undefined,
      new EntityId(accountId),
      new TransactionAmount(amount),
      new TransactionDescription(description),
      category,
      createdAt ?? new Date(),
    );
  }

  toPrimitives() {
    return {
      id: this.id?.value,
      accountId: this.accountId.value,
      amount: this.amount.value,
      description: this.description.value,
      category: this.category,
      createdAt: this.createdAt,
    };
  }
}
```

## Repository Pattern

### Port (Interface)

```typescript
// application/ports/transactions-repository.interface.ts
import type { EntityId } from "../../../shared/domain/value-objects/entity-id";
import type { Transaction } from "../../domain/entities/transaction.entity";

export interface ITransactionsRepository {
  create(transaction: Transaction): Promise<Transaction>;
  findById(id: EntityId): Promise<Transaction | null>;
  findByAccountId(accountId: EntityId): Promise<Transaction[]>;
  update(transaction: Transaction): Promise<Transaction>;
  delete(id: EntityId): Promise<void>;
}
```

### Adapter (Implementation)

```typescript
// infrastructure/persistence/mongoose/mongo-transactions.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import type { ITransactionsRepository } from "../../../application/ports/transactions-repository.interface";
import { Transaction } from "../../../domain/entities/transaction.entity";
import { EntityId } from "../../../../shared/domain/value-objects/entity-id";
import { MongooseTransaction, TransactionDocument } from "./transaction.model";

@Injectable()
export class MongoTransactionsRepository implements ITransactionsRepository {
  constructor(
    @InjectModel(MongooseTransaction.name)
    private readonly model: Model<TransactionDocument>,
  ) {}

  async create(transaction: Transaction): Promise<Transaction> {
    const created = await this.model.create(transaction.toPrimitives());
    return this.toDomain(created);
  }

  async findById(id: EntityId): Promise<Transaction | null> {
    const doc = await this.model.findById(id.value).exec();
    return doc ? this.toDomain(doc) : null;
  }

  private toDomain(doc: TransactionDocument): Transaction {
    return Transaction.create(
      doc._id.toString(),
      doc.accountId,
      doc.amount,
      doc.description,
      doc.category,
      doc.createdAt,
    );
  }
}
```

## Error Handling

### Domain Exceptions

```typescript
// domain/exceptions/transaction-not-found.error.ts
export class TransactionNotFoundError extends Error {
  constructor(id: string) {
    super(`Transaction with id ${id} not found`);
    this.name = "TransactionNotFoundError";
  }
}

// domain/exceptions/insufficient-balance.error.ts
export class InsufficientBalanceError extends Error {
  constructor(accountId: string, required: number, available: number) {
    super(
      `Insufficient balance in account ${accountId}. Required: ${required}, Available: ${available}`,
    );
    this.name = "InsufficientBalanceError";
  }
}
```

### Global Exception Filter

```typescript
// shared/infrastructure/exceptions/domain-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { ZodError } from "zod";

const EXCEPTION_STATUS_MAP: Record<string, HttpStatus> = {
  TransactionNotFoundError: HttpStatus.NOT_FOUND,
  AccountNotFoundError: HttpStatus.NOT_FOUND,
  UserNotFoundError: HttpStatus.NOT_FOUND,
  InsufficientBalanceError: HttpStatus.UNPROCESSABLE_ENTITY,
  InvalidEntityIdError: HttpStatus.BAD_REQUEST,
  AlreadyExistsError: HttpStatus.CONFLICT,
};

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Zod validation errors
    if (exception instanceof ZodError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: "Validation Error",
        message: exception.issues.map(issue => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // Domain exceptions
    if (exception instanceof Error) {
      const status = EXCEPTION_STATUS_MAP[exception.name] ?? HttpStatus.INTERNAL_SERVER_ERROR;

      return response.status(status).json({
        statusCode: status,
        error: exception.name,
        message: exception.message,
      });
    }

    // Unknown errors
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}
```

### Register Global Filter

```typescript
// main.ts
import { DomainExceptionFilter } from "./modules/shared/infrastructure/exceptions/domain-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new DomainExceptionFilter());
  // ...
}
```

## Controllers

```typescript
// infrastructure/controllers/transactions.controller.ts
import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateTransactionDto } from "../../application/dtos/create-transaction.dto";
import { CreateTransactionHandler } from "../../application/commands/create-transaction/create-transaction.handler";
import { CreateTransactionCommand } from "../../application/commands/create-transaction/create-transaction.command";
import { FindTransactionByIdHandler } from "../../application/queries/find-transaction-by-id/find-transaction-by-id.handler";
import { FindTransactionByIdQuery } from "../../application/queries/find-transaction-by-id/find-transaction-by-id.query";

@ApiTags("transactions")
@Controller("transactions")
export class TransactionsController {
  constructor(
    private readonly createHandler: CreateTransactionHandler,
    private readonly findByIdHandler: FindTransactionByIdHandler,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new transaction" })
  async create(@Body() dto: CreateTransactionDto) {
    const command = new CreateTransactionCommand(
      dto.accountId,
      dto.amount,
      dto.description,
      dto.category,
    );
    const transaction = await this.createHandler.execute(command);
    return transaction.toPrimitives();
  }

  @Get(":id")
  @ApiOperation({ summary: "Find transaction by ID" })
  async findById(@Param("id") id: string) {
    const query = new FindTransactionByIdQuery(id);
    const transaction = await this.findByIdHandler.execute(query);
    return transaction.toPrimitives();
  }
}
```

## Dependency Injection

### Constants

```typescript
// application/constants.ts
export const INJECTION_TOKENS = {
  TRANSACTIONS_REPOSITORY: "ITransactionsRepository",
} as const;
```

### Module Configuration

```typescript
// transactions.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { INJECTION_TOKENS } from "./application/constants";
import { CreateTransactionHandler } from "./application/commands/create-transaction/create-transaction.handler";
import { FindTransactionByIdHandler } from "./application/queries/find-transaction-by-id/find-transaction-by-id.handler";
import { OnTransactionCreatedHandler } from "./application/event-handlers/on-transaction-created.handler";
import { TransactionsController } from "./infrastructure/controllers/transactions.controller";
import { MongoTransactionsRepository } from "./infrastructure/persistence/mongoose/mongo-transactions.repository";
import { MongooseTransaction, TransactionSchema } from "./infrastructure/persistence/mongoose/transaction.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MongooseTransaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [
    // Commands
    CreateTransactionHandler,
    // Queries
    FindTransactionByIdHandler,
    // Event Handlers
    OnTransactionCreatedHandler,
    // Repositories
    {
      provide: INJECTION_TOKENS.TRANSACTIONS_REPOSITORY,
      useClass: MongoTransactionsRepository,
    },
  ],
  exports: [INJECTION_TOKENS.TRANSACTIONS_REPOSITORY],
})
export class TransactionsModule {}
```

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | `kebab-case` | `create-transaction.handler.ts` |
| Classes | `PascalCase` | `CreateTransactionHandler` |
| Interfaces | `I` prefix | `ITransactionsRepository` |
| Constants | `UPPER_SNAKE_CASE` | `INJECTION_TOKENS` |
| Methods | `camelCase` | `execute()`, `toPrimitives()` |
| Value Objects | Domain concept | `TransactionAmount` |
| Exceptions | `Error` suffix | `TransactionNotFoundError` |
| Events | `Event` suffix | `TransactionCreatedEvent` |
| Commands | `Command` suffix | `CreateTransactionCommand` |
| Queries | `Query` suffix | `FindTransactionByIdQuery` |
| Handlers | `Handler` suffix | `CreateTransactionHandler` |

## Required Dependencies

```bash
pnpm add @nestjs/event-emitter nestjs-zod zod
```
