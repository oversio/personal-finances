# API Module Implementation Guide

This guide documents the patterns and structure for implementing new feature modules in the NestJS API application. It follows Hexagonal Architecture with CQRS patterns.

## Table of Contents

1. [Module Structure](#module-structure)
2. [Domain Layer](#domain-layer)
3. [Application Layer](#application-layer)
4. [Infrastructure Layer](#infrastructure-layer)
5. [Module Registration](#module-registration)
6. [Implementation Checklist](#implementation-checklist)

---

## Module Structure

Each feature module follows this directory structure:

```
src/modules/[feature]/
├── [feature].module.ts          # NestJS module definition
├── index.ts                     # Public exports
├── domain/
│   ├── entities/
│   │   ├── [entity].entity.ts   # Domain entity
│   │   └── index.ts
│   ├── value-objects/
│   │   ├── [value-object].ts    # Value objects with validation
│   │   └── index.ts
│   ├── exceptions/
│   │   ├── [entity].exceptions.ts
│   │   └── index.ts
│   └── index.ts
├── application/
│   ├── commands/
│   │   ├── create-[entity]/
│   │   │   ├── create-[entity].command.ts
│   │   │   ├── create-[entity].handler.ts
│   │   │   └── index.ts
│   │   ├── update-[entity]/
│   │   ├── archive-[entity]/
│   │   └── index.ts
│   ├── queries/
│   │   ├── get-[entity]/
│   │   ├── get-[entities]/
│   │   └── index.ts
│   ├── event-handlers/          # Optional: for domain events
│   │   ├── [event].handler.ts
│   │   └── index.ts
│   ├── ports/
│   │   ├── [entity].repository.ts
│   │   └── index.ts
│   └── index.ts
└── infrastructure/
    ├── persistence/
    │   ├── schemas/
    │   │   ├── [entity].schema.ts
    │   │   └── index.ts
    │   ├── repositories/
    │   │   ├── mongoose-[entity].repository.ts
    │   │   └── index.ts
    │   └── index.ts
    ├── http/
    │   ├── controllers/
    │   │   ├── [entities].controller.ts
    │   │   └── index.ts
    │   ├── dto/
    │   │   ├── create-[entity].dto.ts
    │   │   ├── update-[entity].dto.ts
    │   │   └── index.ts
    │   └── index.ts
    └── index.ts
```

---

## Domain Layer

The domain layer contains the core business logic and is completely independent of infrastructure.

### Value Objects

Value objects encapsulate validation and domain rules for primitive values.

```typescript
// domain/value-objects/transaction-type.ts
import { z } from "zod";

export const TRANSACTION_TYPES = ["income", "expense", "transfer"] as const;

const schema = z.enum(TRANSACTION_TYPES, {
  error: "Invalid transaction type. Must be income, expense, or transfer",
});

export type TransactionTypeValue = (typeof TRANSACTION_TYPES)[number];

export class TransactionType {
  readonly value: TransactionTypeValue;

  constructor(value: string) {
    this.value = schema.parse(value);
  }

  isIncome(): boolean {
    return this.value === "income";
  }

  isExpense(): boolean {
    return this.value === "expense";
  }

  isTransfer(): boolean {
    return this.value === "transfer";
  }

  static values(): readonly TransactionTypeValue[] {
    return TRANSACTION_TYPES;
  }

  equals(other: TransactionType): boolean {
    return this.value === other.value;
  }
}
```

**Key Patterns:**

- Use Zod for validation in constructor
- Single `readonly value` property
- Static factory methods for defaults (e.g., `HexColor.default()`)
- Business logic methods (e.g., `isIncome()`, `requiresCategory()`)
- Use `{ error: "message" }` for Zod 4 error messages

### Entities

Entities are immutable and contain business logic.

```typescript
// domain/entities/transaction.entity.ts
import { EntityId } from "@/modules/shared/domain/value-objects";
import { TransactionAmount, TransactionDate, TransactionType } from "../value-objects";

export interface TransactionPrimitives {
  id: string | undefined;
  workspaceId: string;
  type: string;
  // ... other primitive fields
}

export class Transaction {
  constructor(
    public readonly id: EntityId | undefined,
    public readonly workspaceId: EntityId,
    public readonly type: TransactionType,
    // ... other value objects
  ) {}

  // Factory method with validation
  static create(params: {
    id?: string;
    workspaceId: string;
    type: string;
    // ... primitive params
  }): Transaction {
    const now = new Date();
    const transactionType = new TransactionType(params.type);

    // Business rule validations
    if (transactionType.requiresCategory() && !params.categoryId) {
      throw new CategoryRequiredError(transactionType.value);
    }

    return new Transaction(
      params.id ? new EntityId(params.id) : undefined,
      new EntityId(params.workspaceId),
      transactionType,
      // ... convert primitives to value objects
    );
  }

  // Immutable update - returns new instance
  update(params: { type?: string; amount?: number }): Transaction {
    return new Transaction(
      this.id,
      this.workspaceId,
      params.type ? new TransactionType(params.type) : this.type,
      // ... other fields
    );
  }

  // Soft delete
  archive(): Transaction {
    return new Transaction(
      // ... existing fields,
      true, // isArchived
      new Date(), // updatedAt
    );
  }

  // Convert to primitives for serialization
  toPrimitives(): TransactionPrimitives {
    return {
      id: this.id?.value,
      workspaceId: this.workspaceId.value,
      type: this.type.value,
      // ... other fields
    };
  }
}
```

**Key Patterns:**

- All properties are `readonly` (immutability)
- Factory method `create()` for construction with validation
- Business methods return new instances (`update()`, `archive()`)
- `toPrimitives()` for serialization
- Validation in factory method, not constructor

### Domain Exceptions

```typescript
// domain/exceptions/transaction.exceptions.ts
import { DomainException } from "@/modules/shared/domain/exceptions";
import { ErrorCodes } from "@/modules/shared/domain/exceptions/error-codes";

export class TransactionNotFoundError extends DomainException {
  constructor(id: string) {
    super(`Transaction with id ${id} not found`, {
      errorCode: ErrorCodes.transactions.notFound,
      fieldName: null,
      handler: "user",
    });
  }
}

export class CategoryRequiredError extends DomainException {
  constructor(type: string) {
    super(`${type} transactions require a category`, {
      errorCode: ErrorCodes.transactions.categoryRequired,
      fieldName: "categoryId",
      handler: "user",
    });
  }
}
```

**Key Patterns:**

- Extend `DomainException` base class
- Use `ErrorCodes` from centralized registry
- Include `fieldName` for form validation mapping
- Use `handler: "user"` for client-displayable errors

### Adding Error Codes

Add new error codes to the centralized registry:

```typescript
// src/modules/shared/domain/exceptions/error-codes.ts
export const ErrorCodes = {
  // ... existing codes

  transactions: {
    notFound: "transactions.not_found",
    invalidAmount: "transactions.invalid_amount",
    invalidDate: "transactions.invalid_date",
    transferRequiresToAccount: "transactions.transfer_requires_to_account",
    categoryRequired: "transactions.category_required",
    sameAccountTransfer: "transactions.same_account_transfer",
  },
} as const;
```

---

## Application Layer

The application layer orchestrates use cases and coordinates domain objects.

### Repository Port (Interface)

```typescript
// application/ports/transaction.repository.ts
import { Transaction } from "../../domain/entities";

export const TRANSACTION_REPOSITORY = Symbol("TRANSACTION_REPOSITORY");

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  includeArchived?: boolean;
}

export interface TransactionRepository {
  save(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findByWorkspaceId(workspaceId: string, filters?: TransactionFilters): Promise<Transaction[]>;
  update(transaction: Transaction): Promise<Transaction>;
  delete(id: string): Promise<void>;
}
```

**Key Patterns:**

- Symbol-based DI token
- Domain entity-based interface (not DTOs)
- Null return for not-found cases
- Filter objects for complex queries

### Commands

Commands represent write operations.

```typescript
// application/commands/create-transaction/create-transaction.command.ts
export class CreateTransactionCommand {
  constructor(
    public readonly workspaceId: string,
    public readonly type: string,
    public readonly accountId: string,
    public readonly amount: number,
    // ... other primitive params
  ) {}
}
```

```typescript
// application/commands/create-transaction/create-transaction.handler.ts
import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Transaction, type TransactionPrimitives } from "../../../domain/entities";
import { TRANSACTION_REPOSITORY, type TransactionRepository } from "../../ports";
import { CreateTransactionCommand } from "./create-transaction.command";

export type CreateTransactionResult = TransactionPrimitives;

@Injectable()
export class CreateTransactionHandler {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: CreateTransactionCommand): Promise<CreateTransactionResult> {
    // 1. Create domain entity (validates business rules)
    const transaction = Transaction.create({
      workspaceId: command.workspaceId,
      type: command.type,
      // ... map command to create params
    });

    // 2. Persist
    const savedTransaction = await this.transactionRepository.save(transaction);

    // 3. Emit domain event
    this.eventEmitter.emit("transaction.created", {
      transactionId: savedTransaction.id!.value,
      workspaceId: command.workspaceId,
      type: savedTransaction.type.value,
      amount: savedTransaction.amount.value,
    });

    // 4. Return primitives
    return savedTransaction.toPrimitives();
  }
}
```

**Key Patterns:**

- Command is a simple DTO with readonly properties
- Handler is `@Injectable()` with repository injected via symbol
- Business logic in entity, not handler
- Emit domain events after successful persistence
- Return `toPrimitives()` for serialization

### Queries

Queries represent read operations.

```typescript
// application/queries/get-transactions/get-transactions.query.ts
export class GetTransactionsQuery {
  constructor(
    public readonly workspaceId: string,
    public readonly accountId?: string,
    public readonly includeArchived: boolean = false,
  ) {}
}
```

```typescript
// application/queries/get-transactions/get-transactions.handler.ts
@Injectable()
export class GetTransactionsHandler {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(query: GetTransactionsQuery): Promise<TransactionPrimitives[]> {
    const transactions = await this.transactionRepository.findByWorkspaceId(query.workspaceId, {
      accountId: query.accountId,
      includeArchived: query.includeArchived,
    });
    return transactions.map(t => t.toPrimitives());
  }
}
```

### Event Handlers

Handle domain events from other modules or within the same module.

```typescript
// application/event-handlers/update-account-balance.handler.ts
import { Inject, Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ACCOUNT_REPOSITORY, type AccountRepository } from "@/modules/accounts";

export interface TransactionCreatedEvent {
  transactionId: string;
  workspaceId: string;
  type: "income" | "expense" | "transfer";
  accountId: string;
  toAccountId?: string;
  amount: number;
}

@Injectable()
export class UpdateAccountBalanceHandler {
  private readonly logger = new Logger(UpdateAccountBalanceHandler.name);

  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
  ) {}

  @OnEvent("transaction.created")
  async handleTransactionCreated(event: TransactionCreatedEvent): Promise<void> {
    this.logger.log(`Updating balances for transaction ${event.transactionId}`);

    switch (event.type) {
      case "income":
        await this.accountRepository.updateBalance(event.accountId, event.amount);
        break;
      case "expense":
        await this.accountRepository.updateBalance(event.accountId, -event.amount);
        break;
      case "transfer":
        await this.accountRepository.updateBalance(event.accountId, -event.amount);
        if (event.toAccountId) {
          await this.accountRepository.updateBalance(event.toAccountId, event.amount);
        }
        break;
    }
  }
}
```

**Key Patterns:**

- Use `@OnEvent("event.name")` decorator
- Define typed event interface
- Inject dependencies from other modules via symbols
- Use Logger for observability

---

## Infrastructure Layer

The infrastructure layer contains implementations and adapters.

### Mongoose Schema

```typescript
// infrastructure/persistence/schemas/transaction.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { type HydratedDocument, Types } from "mongoose";

export type TransactionDocument = HydratedDocument<TransactionModel>;

@Schema({ collection: "transactions", timestamps: true })
export class TransactionModel {
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true, enum: ["income", "expense", "transfer"] })
  type!: string;

  @Prop({ type: Types.ObjectId, required: true })
  accountId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  toAccountId?: Types.ObjectId;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true, default: false })
  isArchived!: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(TransactionModel);

// Indexes for efficient querying
TransactionSchema.index({ workspaceId: 1 });
TransactionSchema.index({ workspaceId: 1, isArchived: 1 });
TransactionSchema.index({ workspaceId: 1, accountId: 1 });
TransactionSchema.index({ workspaceId: 1, date: -1 });
```

**Key Patterns:**

- Use `@nestjs/mongoose` decorators
- Enable `timestamps: true` for auto createdAt/updatedAt
- Add strategic indexes for common queries
- Use `Types.ObjectId` for references

### Repository Implementation

```typescript
// infrastructure/persistence/repositories/mongoose-transaction.repository.ts
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { TransactionRepository, TransactionFilters } from "../../../application/ports";
import { Transaction } from "../../../domain/entities";
import { TransactionDocument, TransactionModel } from "../schemas";

@Injectable()
export class MongooseTransactionRepository implements TransactionRepository {
  constructor(
    @InjectModel(TransactionModel.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  async save(transaction: Transaction): Promise<Transaction> {
    const doc = new this.transactionModel({
      workspaceId: new Types.ObjectId(transaction.workspaceId.value),
      type: transaction.type.value,
      accountId: new Types.ObjectId(transaction.accountId.value),
      // ... map entity to document
    });
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Transaction | null> {
    try {
      const doc = await this.transactionModel.findById(id).exec();
      return doc ? this.toDomain(doc) : null;
    } catch {
      return null; // Invalid ObjectId
    }
  }

  async findByWorkspaceId(
    workspaceId: string,
    filters?: TransactionFilters,
  ): Promise<Transaction[]> {
    const filter: Record<string, unknown> = {
      workspaceId: new Types.ObjectId(workspaceId),
    };

    if (!filters?.includeArchived) {
      filter.isArchived = false;
    }

    if (filters?.type) {
      filter.type = filters.type;
    }

    const docs = await this.transactionModel.find(filter).sort({ date: -1, createdAt: -1 }).exec();

    return docs.map(doc => this.toDomain(doc));
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const doc = await this.transactionModel
      .findByIdAndUpdate(
        transaction.id!.value,
        {
          type: transaction.type.value,
          amount: transaction.amount.value,
          isArchived: transaction.isArchived,
          // ... map entity to update fields
        },
        { new: true },
      )
      .exec();

    if (!doc) {
      throw new Error(`Transaction with id ${transaction.id!.value} not found`);
    }

    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await this.transactionModel.findByIdAndDelete(id).exec();
  }

  private toDomain(doc: TransactionDocument): Transaction {
    return Transaction.create({
      id: doc._id.toString(),
      workspaceId: doc.workspaceId.toString(),
      type: doc.type,
      accountId: doc.accountId.toString(),
      // ... map document to entity params
    });
  }
}
```

**Key Patterns:**

- Implements the port interface
- Private `toDomain()` helper for mapping
- Handle invalid ObjectId gracefully
- Use `{ new: true }` to return updated document

### DTOs

```typescript
// infrastructure/http/dto/create-transaction.dto.ts
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const TRANSACTION_TYPES = ["income", "expense", "transfer"] as const;
const CURRENCIES = ["USD", "EUR", "MXN" /* ... */] as const;

const createTransactionSchema = z
  .object({
    type: z.enum(TRANSACTION_TYPES, { error: "Invalid transaction type" }),
    accountId: z.string().min(1, { error: "Account is required" }),
    toAccountId: z.string().optional(),
    categoryId: z.string().optional(),
    amount: z
      .number()
      .positive({ error: "Amount must be positive" })
      .finite({ error: "Amount must be finite" }),
    currency: z.enum(CURRENCIES, { error: "Invalid currency" }),
    description: z
      .string()
      .min(1, { error: "Description is required" })
      .max(500, { error: "Description too long" }),
    date: z.coerce.date({ error: "Invalid date" }),
  })
  .superRefine((data, ctx) => {
    // Conditional validation
    if (data.type === "transfer" && !data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Transfers require destination account",
        path: ["toAccountId"],
      });
    }
  });

export class CreateTransactionDto extends createZodDto(createTransactionSchema) {}
```

**Key Patterns:**

- Use `nestjs-zod` `createZodDto()`
- Use `z.coerce.date()` for date parsing
- Use `superRefine()` for conditional validation
- Use `{ error: "message" }` for Zod 4

### Controller

```typescript
// infrastructure/http/controllers/transactions.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser, type AuthenticatedUser } from "@/modules/shared/infrastructure/decorators";
import {
  CurrentWorkspace,
  WorkspaceAccessGuard,
  type WorkspaceContext,
} from "@/modules/workspaces";
import {
  CreateTransactionCommand,
  CreateTransactionHandler,
  GetTransactionsHandler,
  GetTransactionsQuery,
  // ... other handlers
} from "../../../application";
import { CreateTransactionDto, TransactionFiltersDto } from "../dto";

@ApiTags("transactions")
@Controller("ws/:workspaceId/transactions")
@UseGuards(WorkspaceAccessGuard)
export class TransactionsController {
  constructor(
    private readonly createTransactionHandler: CreateTransactionHandler,
    private readonly getTransactionsHandler: GetTransactionsHandler,
    // ... other handlers
  ) {}

  @Get()
  @ApiOperation({ summary: "List all transactions in workspace" })
  @ApiQuery({ name: "type", required: false, enum: ["income", "expense", "transfer"] })
  async getTransactions(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Query() filters: TransactionFiltersDto,
  ) {
    const query = new GetTransactionsQuery(
      workspace.id,
      filters.accountId,
      filters.categoryId,
      filters.type,
    );
    return this.getTransactionsHandler.execute(query);
  }

  @Post()
  @ApiOperation({ summary: "Create a new transaction" })
  async createTransaction(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTransactionDto,
  ) {
    const command = new CreateTransactionCommand(
      workspace.id,
      dto.type,
      dto.accountId,
      dto.amount,
      dto.currency,
      dto.description,
      dto.date,
      user.id, // createdBy
      dto.toAccountId,
      dto.categoryId,
    );
    return this.createTransactionHandler.execute(command);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async archiveTransaction(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") id: string,
  ) {
    const command = new ArchiveTransactionCommand(id, workspace.id);
    await this.archiveTransactionHandler.execute(command);
  }
}
```

**Key Patterns:**

- Controllers delegate to handlers immediately
- Use `@CurrentWorkspace()` and `@CurrentUser()` decorators
- Use `@UseGuards(WorkspaceAccessGuard)` for authorization
- Use Swagger decorators for documentation
- Map DTO → Command/Query in controller

---

## Module Registration

```typescript
// transactions.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AccountsModule } from "@/modules/accounts";
import { WorkspacesModule } from "@/modules/workspaces";
import {
  CreateTransactionHandler,
  UpdateTransactionHandler,
  ArchiveTransactionHandler,
  GetTransactionHandler,
  GetTransactionsHandler,
  UpdateAccountBalanceHandler,
  TRANSACTION_REPOSITORY,
} from "./application";
import {
  MongooseTransactionRepository,
  TransactionModel,
  TransactionSchema,
  TransactionsController,
} from "./infrastructure";

const commandHandlers = [
  CreateTransactionHandler,
  UpdateTransactionHandler,
  ArchiveTransactionHandler,
];

const queryHandlers = [GetTransactionHandler, GetTransactionsHandler];

const eventHandlers = [UpdateAccountBalanceHandler];

const repositories = [
  {
    provide: TRANSACTION_REPOSITORY,
    useClass: MongooseTransactionRepository,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TransactionModel.name, schema: TransactionSchema }]),
    WorkspacesModule,
    AccountsModule,
  ],
  controllers: [TransactionsController],
  providers: [...commandHandlers, ...queryHandlers, ...eventHandlers, ...repositories],
  exports: [...commandHandlers, ...queryHandlers, ...repositories],
})
export class TransactionsModule {}
```

Then register in `app.module.ts`:

```typescript
import { TransactionsModule } from "@/modules/transactions";

@Module({
  imports: [
    // ... existing imports
    TransactionsModule,
  ],
})
export class AppModule {}
```

---

## Implementation Checklist

### Domain Layer

- [ ] Create value objects with Zod validation
- [ ] Create entity with `create()`, `update()`, `archive()`, `toPrimitives()`
- [ ] Create domain exceptions extending `DomainException`
- [ ] Add error codes to `error-codes.ts`
- [ ] Create barrel exports (`index.ts`)

### Application Layer

- [ ] Create repository port (interface)
- [ ] Create commands with handlers
- [ ] Create queries with handlers
- [ ] Create event handlers (if needed)
- [ ] Create barrel exports

### Infrastructure Layer

- [ ] Create Mongoose schema with indexes
- [ ] Create repository implementation
- [ ] Create DTOs with Zod validation
- [ ] Create controller with Swagger docs
- [ ] Create barrel exports

### Module Registration

- [ ] Create `[feature].module.ts`
- [ ] Create root `index.ts` with exports
- [ ] Register module in `app.module.ts`

### Verification

- [ ] Run `pnpm check-types` to verify TypeScript
- [ ] Test API endpoints via Swagger UI (`/docs`)
- [ ] Verify domain events are emitted
- [ ] Verify error handling works correctly
