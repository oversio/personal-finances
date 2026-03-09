---
name: nestjs-testing
description: >
  Testing patterns for NestJS apps with Hexagonal Architecture, CQRS, Zod, and Jest.
  Trigger: When writing tests in apps/api (*.spec.ts), setting up test modules, mocking repositories, or testing domain logic.
license: Apache-2.0
metadata:
  author: oma-solutions
  version: "1.0"
  scope: [api]
  auto_invoke: "Writing or modifying NestJS tests"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Task
---

## Testing Pyramid

```
┌─────────────────────────────────────────────────────────────────┐
│                         E2E Tests                               │
│     HTTP endpoints with supertest (test/*.e2e-spec.ts)         │
├─────────────────────────────────────────────────────────────────┤
│                    Integration Tests                            │
│     Handlers with real domain logic, mocked infrastructure     │
├─────────────────────────────────────────────────────────────────┤
│                       Unit Tests                                │
│     Value Objects, Entities, pure domain logic                 │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
src/modules/[feature]/
├── domain/
│   ├── entities/
│   │   └── [entity].entity.spec.ts       # Entity tests
│   └── value-objects/
│       └── [vo].spec.ts                  # Value object tests
└── application/
    ├── commands/[action]/
    │   └── [action].handler.spec.ts      # Command handler tests
    └── queries/[action]/
        └── [action].handler.spec.ts      # Query handler tests

test/
└── [feature].e2e-spec.ts                 # E2E tests
```

## Jest Configuration

**package.json:**

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": { "^.+\\.(t|j)s$": "ts-jest" },
    "moduleNameMapper": { "^@/(.*)$": "<rootDir>/$1" }
  }
}
```

**Run tests:**

```bash
pnpm --filter=api test           # Run all tests
pnpm --filter=api test:watch     # Watch mode
pnpm --filter=api test:cov       # Coverage
pnpm --filter=api test:e2e       # E2E tests
```

---

## Value Object Tests

Value objects are immutable, validated primitives. Test construction, validation, and behavior.

```typescript
// domain/value-objects/money.spec.ts
import { ZodError } from "zod";
import { Money } from "./money";

describe("Money", () => {
  describe("construction", () => {
    it("should create with valid amount", () => {
      const money = new Money(100.5);
      expect(money.value).toBe(100.5);
    });

    it("should handle zero", () => {
      const money = new Money(0);
      expect(money.value).toBe(0);
    });

    it("should handle negative amounts", () => {
      const money = new Money(-50);
      expect(money.value).toBe(-50);
    });
  });

  describe("validation", () => {
    it("should throw ZodError for Infinity", () => {
      expect(() => new Money(Infinity)).toThrow(ZodError);
    });

    it("should throw ZodError for NaN", () => {
      expect(() => new Money(NaN)).toThrow(ZodError);
    });

    it("should include correct error message", () => {
      try {
        new Money(Infinity);
        fail("Expected ZodError");
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        expect((error as ZodError).issues[0].message).toBe("Amount must be a finite number");
      }
    });
  });

  describe("behavior", () => {
    it("should detect zero value", () => {
      expect(new Money(0).isZero()).toBe(true);
      expect(new Money(100).isZero()).toBe(false);
    });

    it("should detect negative value", () => {
      expect(new Money(-50).isNegative()).toBe(true);
      expect(new Money(50).isNegative()).toBe(false);
    });

    it("should add amounts immutably", () => {
      const original = new Money(100);
      const result = original.add(new Money(50));

      expect(result.value).toBe(150);
      expect(result).not.toBe(original); // New instance
      expect(original.value).toBe(100); // Unchanged
    });

    it("should check equality", () => {
      const a = new Money(100);
      const b = new Money(100);
      const c = new Money(200);

      expect(a.equals(b)).toBe(true);
      expect(a.equals(c)).toBe(false);
    });
  });

  describe("static factories", () => {
    it("should create zero money", () => {
      expect(Money.zero().value).toBe(0);
    });
  });
});
```

---

## Entity Tests

Entities have identity, behavior, and validate on creation. Test factory methods, business logic, and serialization.

```typescript
// domain/entities/account.entity.spec.ts
import { ZodError } from "zod";
import { Account } from "./account.entity";

describe("Account", () => {
  const validParams = {
    id: "acc-123",
    workspaceId: "ws-123",
    name: "Checking Account",
    currency: "USD",
    initialBalance: 1000,
    createdBy: "user-123",
  };

  describe("create", () => {
    it("should create with all required fields", () => {
      const account = Account.create(validParams);

      expect(account.id?.value).toBe("acc-123");
      expect(account.workspaceId.value).toBe("ws-123");
      expect(account.name).toBe("Checking Account");
      expect(account.currency).toBe("USD");
      expect(account.initialBalance.value).toBe(1000);
    });

    it("should create without id (new entity)", () => {
      const account = Account.create({ ...validParams, id: undefined });
      expect(account.id).toBeUndefined();
    });

    it("should default currentBalance to initialBalance", () => {
      const account = Account.create(validParams);
      expect(account.currentBalance.value).toBe(1000);
    });

    it("should set createdAt and updatedAt to now", () => {
      const before = new Date();
      const account = Account.create(validParams);
      const after = new Date();

      expect(account.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(account.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(account.updatedAt.getTime()).toEqual(account.createdAt.getTime());
    });
  });

  describe("validation", () => {
    it("should throw for empty name", () => {
      expect(() => Account.create({ ...validParams, name: "" })).toThrow(ZodError);
    });

    it("should throw for invalid currency", () => {
      expect(() => Account.create({ ...validParams, currency: "INVALID" })).toThrow(ZodError);
    });
  });

  describe("archive", () => {
    it("should return archived account with updated timestamp", () => {
      const account = Account.create(validParams);
      const before = new Date();
      const archived = account.archive();
      const after = new Date();

      expect(archived.archivedAt).toBeDefined();
      expect(archived.archivedAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(archived.archivedAt!.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(archived).not.toBe(account); // Immutable
    });

    it("should preserve other fields", () => {
      const account = Account.create(validParams);
      const archived = account.archive();

      expect(archived.id?.value).toBe(account.id?.value);
      expect(archived.name).toBe(account.name);
      expect(archived.currentBalance.value).toBe(account.currentBalance.value);
    });
  });

  describe("updateBalance", () => {
    it("should return new account with updated balance", () => {
      const account = Account.create(validParams);
      const updated = account.updateBalance(1500);

      expect(updated.currentBalance.value).toBe(1500);
      expect(updated).not.toBe(account);
      expect(account.currentBalance.value).toBe(1000); // Original unchanged
    });
  });

  describe("toPrimitives", () => {
    it("should serialize all fields", () => {
      const account = Account.create(validParams);
      const primitives = account.toPrimitives();

      expect(primitives).toEqual({
        id: "acc-123",
        workspaceId: "ws-123",
        name: "Checking Account",
        currency: "USD",
        initialBalance: 1000,
        currentBalance: 1000,
        createdBy: "user-123",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        archivedAt: undefined,
      });
    });

    it("should serialize undefined id as undefined", () => {
      const account = Account.create({ ...validParams, id: undefined });
      expect(account.toPrimitives().id).toBeUndefined();
    });
  });
});
```

---

## Command Handler Tests

Commands are write operations. Mock repositories and event emitters, test business logic and side effects.

### Test Setup Pattern

```typescript
// application/commands/create-transaction/create-transaction.handler.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CreateTransactionHandler } from "./create-transaction.handler";
import { CreateTransactionCommand } from "./create-transaction.command";
import { TRANSACTION_REPOSITORY } from "../../ports/transaction.repository";
import type { TransactionRepository } from "../../ports/transaction.repository";
import { Transaction } from "@/modules/transactions/domain/entities/transaction.entity";
import { CategoryRequiredError } from "@/modules/transactions/domain/exceptions/category-required.error";

describe("CreateTransactionHandler", () => {
  let handler: CreateTransactionHandler;
  let transactionRepository: jest.Mocked<TransactionRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    // Create typed mocks for all repository methods
    const mockTransactionRepository: jest.Mocked<TransactionRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByWorkspaceId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      existsByCategory: jest.fn(),
      sumByCategory: jest.fn(),
      aggregateExpensesByMonth: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    } as unknown as jest.Mocked<EventEmitter2>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionHandler,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockTransactionRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    handler = module.get<CreateTransactionHandler>(CreateTransactionHandler);
    transactionRepository = module.get(TRANSACTION_REPOSITORY);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Tests go here...
});
```

### Testing Repository Interactions

```typescript
describe("execute - income transaction", () => {
  const baseParams = {
    workspaceId: "workspace-123",
    type: "income" as const,
    accountId: "account-123",
    categoryId: "category-123",
    amount: 100,
    currency: "USD",
    date: new Date("2024-06-15"),
    createdBy: "user-123",
  };

  it("should save transaction to repository", async () => {
    const command = new CreateTransactionCommand(
      baseParams.workspaceId,
      baseParams.type,
      baseParams.accountId,
      baseParams.categoryId,
      undefined, // subcategoryId
      undefined, // toAccountId
      baseParams.amount,
      baseParams.currency,
      baseParams.date,
      undefined, // description
      baseParams.createdBy,
    );

    const savedTransaction = Transaction.create({
      id: "tx-123",
      ...baseParams,
    });

    transactionRepository.save.mockResolvedValue(savedTransaction);

    await handler.execute(command);

    expect(transactionRepository.save).toHaveBeenCalledTimes(1);

    // Verify saved entity properties
    const savedArg = transactionRepository.save.mock.calls[0][0];
    expect(savedArg).toBeInstanceOf(Transaction);
    expect(savedArg.workspaceId.value).toBe("workspace-123");
    expect(savedArg.type.value).toBe("income");
    expect(savedArg.amount.value).toBe(100);
  });

  it("should return primitives from saved transaction", async () => {
    const command = new CreateTransactionCommand(/* ... */);
    const savedTransaction = Transaction.create({ id: "tx-123", ...baseParams });
    transactionRepository.save.mockResolvedValue(savedTransaction);

    const result = await handler.execute(command);

    expect(result).toEqual({
      id: "tx-123",
      workspaceId: "workspace-123",
      type: "income",
      accountId: "account-123",
      categoryId: "category-123",
      subcategoryId: undefined,
      toAccountId: undefined,
      amount: 100,
      currency: "USD",
      date: expect.any(Date),
      description: undefined,
      createdBy: "user-123",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      archivedAt: undefined,
    });
  });
});
```

### Testing Domain Events

```typescript
describe("execute - event emission", () => {
  it("should emit transaction.created event after save", async () => {
    const command = new CreateTransactionCommand(/* ... */);
    const savedTransaction = Transaction.create({ id: "tx-123", ...baseParams });
    transactionRepository.save.mockResolvedValue(savedTransaction);

    await handler.execute(command);

    expect(eventEmitter.emit).toHaveBeenCalledWith("transaction.created", {
      transactionId: "tx-123",
      workspaceId: "workspace-123",
      type: "income",
      accountId: "account-123",
      toAccountId: undefined,
      amount: 100,
    });
  });

  it("should NOT emit event when validation fails", async () => {
    const command = new CreateTransactionCommand(
      "workspace-123",
      "income",
      "account-123",
      undefined, // Missing required categoryId
      /* ... */
    );

    await expect(handler.execute(command)).rejects.toThrow(CategoryRequiredError);

    expect(eventEmitter.emit).not.toHaveBeenCalled();
    expect(transactionRepository.save).not.toHaveBeenCalled();
  });
});
```

### Testing Domain Exceptions

```typescript
describe("execute - validation errors", () => {
  it("should throw CategoryRequiredError for income without categoryId", async () => {
    const command = new CreateTransactionCommand(
      "workspace-123",
      "income",
      "account-123",
      undefined, // No categoryId
      /* ... */
    );

    await expect(handler.execute(command)).rejects.toThrow(CategoryRequiredError);
    expect(transactionRepository.save).not.toHaveBeenCalled();
  });

  it("should throw SameAccountTransferError when source equals destination", async () => {
    const command = new CreateTransactionCommand(
      "workspace-123",
      "transfer",
      "account-123", // from
      undefined,
      undefined,
      "account-123", // to (same!)
      /* ... */
    );

    await expect(handler.execute(command)).rejects.toThrow(SameAccountTransferError);
  });
});
```

---

## Query Handler Tests

Queries are read operations. Focus on filter passing, data transformation, and edge cases.

```typescript
// application/queries/get-transactions/get-transactions.handler.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { GetTransactionsHandler } from "./get-transactions.handler";
import { GetTransactionsQuery } from "./get-transactions.query";
import { TRANSACTION_REPOSITORY } from "../../ports/transaction.repository";
import type { TransactionRepository } from "../../ports/transaction.repository";
import { Transaction } from "@/modules/transactions/domain/entities/transaction.entity";

describe("GetTransactionsHandler", () => {
  let handler: GetTransactionsHandler;
  let transactionRepository: jest.Mocked<TransactionRepository>;

  // Helper to create test fixtures with overrides
  const createTestTransaction = (overrides?: {
    id?: string;
    type?: "income" | "expense" | "transfer";
    accountId?: string;
    categoryId?: string;
  }) =>
    Transaction.create({
      id: overrides?.id ?? "tx-123",
      workspaceId: "workspace-123",
      type: overrides?.type ?? "expense",
      accountId: overrides?.accountId ?? "account-123",
      categoryId:
        overrides?.type === "transfer" ? undefined : (overrides?.categoryId ?? "category-123"),
      toAccountId: overrides?.type === "transfer" ? "account-456" : undefined,
      amount: 100,
      currency: "USD",
      date: new Date("2024-06-15"),
      createdBy: "user-123",
    });

  beforeEach(async () => {
    const mockTransactionRepository: jest.Mocked<TransactionRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByWorkspaceId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      existsByCategory: jest.fn(),
      sumByCategory: jest.fn(),
      aggregateExpensesByMonth: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionsHandler,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    handler = module.get<GetTransactionsHandler>(GetTransactionsHandler);
    transactionRepository = module.get(TRANSACTION_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should return transactions for workspace", async () => {
      const transactions = [
        createTestTransaction({ id: "tx-1" }),
        createTestTransaction({ id: "tx-2" }),
      ];

      transactionRepository.findByWorkspaceId.mockResolvedValue(transactions);

      const query = new GetTransactionsQuery("workspace-123");
      const result = await handler.execute(query);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("tx-1");
      expect(result[1].id).toBe("tx-2");
    });

    it("should return empty array when no transactions", async () => {
      transactionRepository.findByWorkspaceId.mockResolvedValue([]);

      const query = new GetTransactionsQuery("workspace-123");
      const result = await handler.execute(query);

      expect(result).toEqual([]);
    });

    it("should pass all filters to repository", async () => {
      transactionRepository.findByWorkspaceId.mockResolvedValue([]);

      const query = new GetTransactionsQuery(
        "workspace-123",
        "account-123",
        "category-123",
        new Date("2024-01-01"),
        new Date("2024-12-31"),
        "expense",
      );

      await handler.execute(query);

      expect(transactionRepository.findByWorkspaceId).toHaveBeenCalledWith("workspace-123", {
        accountId: "account-123",
        categoryId: "category-123",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        type: "expense",
      });
    });

    it("should transform entities to primitives", async () => {
      const transaction = createTestTransaction({ id: "tx-123", type: "income" });
      transactionRepository.findByWorkspaceId.mockResolvedValue([transaction]);

      const query = new GetTransactionsQuery("workspace-123");
      const result = await handler.execute(query);

      expect(result[0]).toEqual({
        id: "tx-123",
        workspaceId: "workspace-123",
        type: "income",
        accountId: "account-123",
        categoryId: "category-123",
        subcategoryId: undefined,
        toAccountId: undefined,
        amount: 100,
        currency: "USD",
        date: expect.any(Date),
        description: undefined,
        createdBy: "user-123",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        archivedAt: undefined,
      });
    });
  });
});
```

---

## Complex Query Tests (Aggregations)

For queries that aggregate data from multiple repositories:

```typescript
// application/queries/get-expenses-breakdown/get-expenses-breakdown.handler.spec.ts
describe("GetExpensesBreakdownHandler", () => {
  let handler: GetExpensesBreakdownHandler;
  let transactionRepository: jest.Mocked<TransactionRepository>;
  let categoryRepository: jest.Mocked<CategoryRepository>;

  const createTestCategory = (overrides?: {
    id?: string;
    name?: string;
    subcategories?: Array<{ id: string; name: string }>;
  }) =>
    Category.create({
      id: overrides?.id ?? "cat-123",
      workspaceId: "workspace-123",
      name: overrides?.name ?? "Food",
      subcategories: overrides?.subcategories ?? [],
      createdBy: "user-123",
    });

  beforeEach(async () => {
    // Setup both repositories...
  });

  describe("execute", () => {
    it("should aggregate expenses by category", async () => {
      const category = createTestCategory({ id: "cat-1", name: "Food" });

      transactionRepository.aggregateExpensesByMonth.mockResolvedValue([
        { categoryId: "cat-1", subcategoryId: null, month: 1, total: 100 },
        { categoryId: "cat-1", subcategoryId: null, month: 2, total: 150 },
      ]);
      categoryRepository.findByWorkspaceId.mockResolvedValue([category]);

      const query = new GetExpensesBreakdownQuery("workspace-123", 2024);
      const result = await handler.execute(query);

      expect(result.categories[0].categoryId).toBe("cat-1");
      expect(result.categories[0].categoryName).toBe("Food");
      expect(result.categories[0].yearTotal).toBe(250); // 100 + 150
    });

    it("should aggregate by subcategory when present", async () => {
      const category = createTestCategory({
        id: "cat-1",
        subcategories: [
          { id: "sub-1", name: "Restaurants" },
          { id: "sub-2", name: "Groceries" },
        ],
      });

      transactionRepository.aggregateExpensesByMonth.mockResolvedValue([
        { categoryId: "cat-1", subcategoryId: "sub-1", month: 1, total: 100 },
        { categoryId: "cat-1", subcategoryId: "sub-2", month: 1, total: 200 },
      ]);
      categoryRepository.findByWorkspaceId.mockResolvedValue([category]);

      const query = new GetExpensesBreakdownQuery("workspace-123", 2024);
      const result = await handler.execute(query);

      expect(result.categories[0].subcategories).toHaveLength(2);
      // Subcategories sorted by total descending
      expect(result.categories[0].subcategories[0].subcategoryName).toBe("Groceries");
      expect(result.categories[0].subcategories[0].yearTotal).toBe(200);
    });

    it("should handle categories with no expenses", async () => {
      const category = createTestCategory({ id: "cat-1" });

      transactionRepository.aggregateExpensesByMonth.mockResolvedValue([]);
      categoryRepository.findByWorkspaceId.mockResolvedValue([category]);

      const query = new GetExpensesBreakdownQuery("workspace-123", 2024);
      const result = await handler.execute(query);

      expect(result.categories).toHaveLength(0); // No categories with expenses
    });
  });
});
```

---

## E2E Tests

Full HTTP integration tests with supertest.

```typescript
// test/transactions.e2e-spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "@/app/app.module";

describe("TransactionsController (e2e)", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /transactions", () => {
    it("should create a transaction", () => {
      return request(app.getHttpServer())
        .post("/transactions")
        .send({
          workspaceId: "ws-123",
          type: "expense",
          accountId: "acc-123",
          categoryId: "cat-123",
          amount: 50,
          currency: "USD",
          date: "2024-06-15",
        })
        .expect(201)
        .expect(res => {
          expect(res.body.id).toBeDefined();
          expect(res.body.amount).toBe(50);
        });
    });

    it("should return 400 for invalid payload", () => {
      return request(app.getHttpServer())
        .post("/transactions")
        .send({
          // Missing required fields
          amount: "not-a-number",
        })
        .expect(400)
        .expect(res => {
          expect(res.body.error).toBe("Validation Error");
          expect(res.body.message).toBeInstanceOf(Array);
        });
    });
  });

  describe("GET /transactions/:id", () => {
    it("should return 404 for non-existent transaction", () => {
      return request(app.getHttpServer())
        .get("/transactions/non-existent-id")
        .expect(404)
        .expect(res => {
          expect(res.body.error).toBe("TransactionNotFoundError");
        });
    });
  });
});
```

---

## Mocking Patterns

### Repository Mock Type

```typescript
// Always fully type repository mocks
const mockTransactionRepository: jest.Mocked<TransactionRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByWorkspaceId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  existsByCategory: jest.fn(),
  sumByCategory: jest.fn(),
  aggregateExpensesByMonth: jest.fn(),
};
```

### EventEmitter Mock

```typescript
const mockEventEmitter = {
  emit: jest.fn(),
} as unknown as jest.Mocked<EventEmitter2>;
```

### Providing Mocks with Symbols

```typescript
const module: TestingModule = await Test.createTestingModule({
  providers: [
    CreateTransactionHandler,
    {
      provide: TRANSACTION_REPOSITORY, // Symbol token
      useValue: mockTransactionRepository,
    },
    {
      provide: EventEmitter2,
      useValue: mockEventEmitter,
    },
  ],
}).compile();

// Get typed instances
transactionRepository = module.get(TRANSACTION_REPOSITORY);
eventEmitter = module.get(EventEmitter2);
```

---

## Test Data Fixtures

### Base Parameters Object

```typescript
const baseCommandParams = {
  workspaceId: "workspace-123",
  accountId: "account-123",
  amount: 100,
  currency: "USD",
  date: new Date("2024-06-15"),
  createdBy: "user-123",
};
```

### Factory Helper with Overrides

```typescript
const createTestTransaction = (overrides?: {
  id?: string;
  type?: "income" | "expense" | "transfer";
  accountId?: string;
  categoryId?: string;
}) =>
  Transaction.create({
    id: overrides?.id ?? "tx-123",
    workspaceId: "workspace-123",
    type: overrides?.type ?? "expense",
    accountId: overrides?.accountId ?? "account-123",
    categoryId:
      overrides?.type === "transfer" ? undefined : (overrides?.categoryId ?? "category-123"),
    toAccountId: overrides?.type === "transfer" ? "account-456" : undefined,
    amount: 100,
    currency: "USD",
    date: new Date("2024-06-15"),
    createdBy: "user-123",
  });
```

---

## Zod Validation Testing

### Testing ZodError in Constructors

```typescript
describe("validation", () => {
  it("should throw ZodError for invalid input", () => {
    expect(() => new Money(Infinity)).toThrow(ZodError);
  });

  it("should include correct error message", () => {
    try {
      new Money(Infinity);
      fail("Expected ZodError");
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError);
      const zodError = error as ZodError;
      expect(zodError.issues[0].message).toBe("Amount must be a finite number");
    }
  });
});
```

### Testing Entity Validation

```typescript
describe("create validation", () => {
  it("should throw ZodError for empty name", () => {
    expect(() =>
      Account.create({
        ...validParams,
        name: "", // Invalid
      }),
    ).toThrow(ZodError);
  });

  it("should throw ZodError with field path", () => {
    try {
      Account.create({ ...validParams, name: "" });
      fail("Expected ZodError");
    } catch (error) {
      const zodError = error as ZodError;
      expect(zodError.issues[0].path).toContain("name");
    }
  });
});
```

---

## Best Practices Checklist

### Test Structure

- [ ] Use descriptive `describe` blocks grouped by concern
- [ ] Use `it("should...")` format for test names
- [ ] Follow Arrange-Act-Assert pattern
- [ ] One assertion concept per test (multiple expects OK if related)

### Isolation

- [ ] `beforeEach` creates fresh mocks
- [ ] `afterEach` clears all mocks with `jest.clearAllMocks()`
- [ ] No shared mutable state between tests
- [ ] Each test is independent

### Mocking

- [ ] Mock only external dependencies (repositories, event emitters)
- [ ] Use `jest.Mocked<T>` for type safety
- [ ] Verify mock calls with `toHaveBeenCalledWith`
- [ ] Check call counts with `toHaveBeenCalledTimes`

### Domain Testing

- [ ] Test immutability (operations return new instances)
- [ ] Test edge cases (zero, negative, empty, undefined)
- [ ] Test all type guards and behaviors
- [ ] Test `toPrimitives()` serialization

### Error Testing

- [ ] Test domain exceptions are thrown
- [ ] Verify no side effects on error (no save, no emit)
- [ ] Test error messages when relevant

### Coverage

- [ ] Happy path for each handler
- [ ] All transaction types (income, expense, transfer)
- [ ] Validation errors
- [ ] Not found scenarios
- [ ] Empty results
