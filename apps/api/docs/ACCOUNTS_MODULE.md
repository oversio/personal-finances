# Accounts Module

Technical documentation for the Accounts module.

---

## Overview

The Accounts module manages financial accounts within workspaces. Each account represents a financial instrument (checking, savings, credit card, etc.) and tracks balances.

### Features

- CRUD operations for accounts
- Workspace-scoped (accounts belong to a workspace)
- Multiple account types supported
- Color customization for UI
- Soft delete (archive) instead of hard delete
- Balance tracking (initial and current)

---

## API Endpoints

All endpoints require authentication and workspace membership.

| Method | Endpoint                        | Description                    |
| ------ | ------------------------------- | ------------------------------ |
| GET    | `/ws/:workspaceId/accounts`     | List all accounts in workspace |
| GET    | `/ws/:workspaceId/accounts/:id` | Get single account             |
| POST   | `/ws/:workspaceId/accounts`     | Create new account             |
| PUT    | `/ws/:workspaceId/accounts/:id` | Update account                 |
| DELETE | `/ws/:workspaceId/accounts/:id` | Archive account (soft delete)  |

---

## Request/Response Contracts

### GET /ws/:workspaceId/accounts

**Query params:**

- `includeArchived` (optional): Include archived accounts (default: false)

**Response (200):**

```json
[
  {
    "id": "...",
    "workspaceId": "...",
    "name": "Main Checking",
    "type": "checking",
    "currency": "USD",
    "initialBalance": 1000,
    "currentBalance": 1500.5,
    "color": "#6366F1",
    "icon": null,
    "isArchived": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
]
```

### GET /ws/:workspaceId/accounts/:id

**Response (200):**

```json
{
  "id": "...",
  "workspaceId": "...",
  "name": "Main Checking",
  "type": "checking",
  "currency": "USD",
  "initialBalance": 1000,
  "currentBalance": 1500.5,
  "color": "#6366F1",
  "icon": null,
  "isArchived": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
```

### POST /ws/:workspaceId/accounts

**Request:**

```json
{
  "name": "Main Checking",
  "type": "checking",
  "currency": "USD",
  "initialBalance": 1000,
  "color": "#6366F1",
  "icon": "bank"
}
```

**Response (201):** Same as GET single account

### PUT /ws/:workspaceId/accounts/:id

**Request:**

```json
{
  "name": "Updated Name",
  "type": "savings",
  "color": "#22C55E",
  "icon": "piggy-bank"
}
```

Note: `currency` and `initialBalance` cannot be changed after creation.

**Response (200):** Same as GET single account

### DELETE /ws/:workspaceId/accounts/:id

Archives the account (soft delete). Sets `isArchived: true`.

**Response (204):** No content

---

## Account Types

| Type          | Description                      |
| ------------- | -------------------------------- |
| `checking`    | Regular checking/current account |
| `savings`     | Savings account                  |
| `credit_card` | Credit card                      |
| `cash`        | Physical cash                    |
| `investment`  | Investment/brokerage account     |

---

## Validation Rules

| Field            | Rules                                            |
| ---------------- | ------------------------------------------------ |
| `name`           | Required, 1-100 characters, unique per workspace |
| `type`           | Required, one of the account types               |
| `currency`       | Required, ISO 4217 code (USD, EUR, MXN, etc.)    |
| `initialBalance` | Required, finite number                          |
| `color`          | Required, hex color (#RRGGBB format)             |
| `icon`           | Optional, max 50 characters                      |

---

## Domain Model

### Account Entity

```typescript
class Account {
  id?: EntityId;
  workspaceId: EntityId;
  name: AccountName;
  type: AccountType;
  currency: Currency;
  initialBalance: Money;
  currentBalance: Money;
  color: HexColor;
  icon?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  static create(props): Account;
  archive(): void;
  updateBalance(amount: Money): void;
  update(props): void;
}
```

### Value Objects

| Value Object  | Validation                                             |
| ------------- | ------------------------------------------------------ |
| `AccountType` | Enum: checking, savings, credit_card, cash, investment |
| `AccountName` | 1-100 characters                                       |
| `Money`       | Finite number, supports add/subtract operations        |
| `HexColor`    | Regex: `^#[0-9A-Fa-f]{6}$`                             |

---

## Error Codes

| Error                  | Code                            | HTTP Status |
| ---------------------- | ------------------------------- | ----------- |
| Account not found      | `accounts.not_found`            | 404         |
| Account already exists | `accounts.already_exists`       | 409         |
| Insufficient balance   | `accounts.insufficient_balance` | 400         |

---

## Directory Structure

```
src/modules/accounts/
├── accounts.module.ts
├── index.ts
├── application/
│   ├── commands/
│   │   ├── create-account/
│   │   │   ├── create-account.command.ts
│   │   │   ├── create-account.handler.ts
│   │   │   └── index.ts
│   │   ├── update-account/
│   │   ├── archive-account/
│   │   └── index.ts
│   ├── queries/
│   │   ├── get-account/
│   │   ├── get-accounts/
│   │   └── index.ts
│   ├── ports/
│   │   └── account.repository.ts
│   └── index.ts
├── domain/
│   ├── entities/
│   │   └── account.entity.ts
│   ├── value-objects/
│   │   ├── account-type.ts
│   │   ├── account-name.ts
│   │   ├── money.ts
│   │   └── hex-color.ts
│   ├── exceptions/
│   │   └── account.exceptions.ts
│   └── index.ts
└── infrastructure/
    ├── http/
    │   ├── controllers/
    │   │   └── accounts.controller.ts
    │   └── dto/
    │       ├── create-account.dto.ts
    │       └── update-account.dto.ts
    └── persistence/
        ├── schemas/
        │   └── account.schema.ts
        └── repositories/
            └── mongoose-account.repository.ts
```

---

## Balance Updates

The `currentBalance` field is a denormalized value that starts equal to `initialBalance` on account creation.

When the Transactions module is implemented, it will update `currentBalance` through domain events:

```typescript
// Future implementation
@OnEvent("transaction.created")
async handleTransactionCreated(event: TransactionCreatedEvent) {
  const account = await this.accountRepository.findById(event.accountId);

  if (event.type === "income") {
    account.updateBalance(account.currentBalance.add(event.amount));
  } else if (event.type === "expense") {
    account.updateBalance(account.currentBalance.subtract(event.amount));
  }

  await this.accountRepository.update(account);
}
```

---

## Database Indexes

```typescript
// Mongoose schema indexes
@Schema({ timestamps: true })
class AccountModel {
  // ...
}

// Indexes
// - workspaceId (for listing accounts)
// - workspaceId + name (unique, prevents duplicate names)
```
