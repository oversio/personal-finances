# Personal Finances API - Database Model

This document defines the MongoDB collections for the Personal Finances application.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           USERS                                 │
│  _id, email, name, picture, passwordHash?, authProvider         │
└─────────────────────────────────────────────────────────────────┘
        │
        │ (many-to-many via workspace_members)
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                        WORKSPACES                               │
│  _id, name, ownerId, currency, isDefault, createdAt             │
└─────────────────────────────────────────────────────────────────┘
        │
        ├──► WORKSPACE_MEMBERS (userId, workspaceId, role)
        │
        ├──► ACCOUNTS
        │       │
        │       └──► TRANSACTIONS ◄─── CATEGORIES
        │                                    │
        │                                    ▼
        ├──► BUDGETS ◄────────────────── (by category)
        │
        └──► RECURRING_TRANSACTIONS
```

---

## Collections

### 1. Users

```typescript
{
  _id: ObjectId,
  email: string,                    // Unique
  name: string,
  picture?: string,

  // Authentication
  passwordHash?: string,            // For email/password auth
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

---

### 2. Workspaces

```typescript
{
  _id: ObjectId,
  name: string,                     // "My Finances", "Family Budget"
  ownerId: ObjectId,                // ref: Users
  currency: string,                 // ISO 4217: "USD", "EUR", "MXN"
  timezone?: string,                // "America/Mexico_City"
  isDefault: boolean,               // true = user's default workspace

  createdAt: Date,
  updatedAt: Date,
}

// Indexes
// - ownerId
```

**Default Workspace:**

- Each user gets a default workspace created on registration
- The `isDefault` flag identifies which workspace to redirect to after login
- Only one workspace per user should be marked as default

---

### 3. Workspace Members

```typescript
{
  _id: ObjectId,
  workspaceId: ObjectId,
  userId: ObjectId,
  role: "owner" | "admin" | "member",

  // Invitation flow
  invitedBy?: ObjectId,             // ref: Users
  invitedAt: Date,
  joinedAt?: Date,                  // null until accepted

  isActive: boolean,
}

// Indexes
// - workspaceId + userId (unique)
// - userId
```

---

### 4. Accounts

```typescript
{
  _id: ObjectId,
  workspaceId: ObjectId,
  name: string,                     // "BBVA Checking", "Wallet"
  type: "checking" | "savings" | "credit_card" | "cash" | "investment",

  // Balance
  initialBalance: number,
  currentBalance: number,           // Denormalized, updated via transactions

  // Display
  currency: string,                 // ISO 4217: "USD", "EUR", "MXN"
  color: string,                    // Hex color: "#6366F1"
  icon?: string,

  // Soft delete
  isArchived: boolean,              // false = active, true = archived

  createdAt: Date,
  updatedAt: Date,
}

// Indexes
// - workspaceId (for listing accounts by workspace)
// - workspaceId + name (unique, prevents duplicate names per workspace)
```

---

### 5. Categories

```typescript
{
  _id: ObjectId,
  workspaceId: ObjectId,
  name: string,                     // "Food", "Salary"
  type: "income" | "expense",

  // Subcategories (embedded array)
  subcategories: [
    { id: string, name: string, icon?: string }
  ],

  // Display
  icon?: string,
  color?: string,

  isSystem: boolean,                // Default categories, can't delete
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date,
}

// Indexes
// - workspaceId + type
// - workspaceId + isActive
```

**Default Categories (seeded per workspace):**

| Type    | Category       | Subcategories                           |
| ------- | -------------- | --------------------------------------- |
| Income  | Salary         | Main Job, Side Job, Bonus               |
| Income  | Freelance      | Projects, Consulting                    |
| Income  | Investments    | Dividends, Interest, Capital Gains      |
| Income  | Other Income   | Gifts, Refunds, Other                   |
| Expense | Food           | Groceries, Restaurants, Coffee          |
| Expense | Transportation | Gas, Public Transit, Uber/Taxi, Parking |
| Expense | Housing        | Rent, Utilities, Maintenance            |
| Expense | Entertainment  | Streaming, Movies, Games                |
| Expense | Shopping       | Clothing, Electronics, Home             |
| Expense | Health         | Doctor, Pharmacy, Gym                   |
| Expense | Education      | Courses, Books, Subscriptions           |
| Expense | Other Expenses | Gifts, Donations, Other                 |

---

### 6. Transactions

```typescript
{
  _id: ObjectId,
  workspaceId: ObjectId,

  // Type and accounts
  type: "income" | "expense" | "transfer",
  accountId: ObjectId,              // Source account
  toAccountId?: ObjectId,           // Destination (transfers only)

  // Category (not required for transfers)
  categoryId?: ObjectId,
  subcategoryId?: string,           // ref to Category.subcategories[].id

  // Amount
  amount: number,                   // Always positive

  // Details
  description?: string,
  notes?: string,
  date: Date,                       // User-defined transaction date

  // Recurring reference
  recurringTransactionId?: ObjectId,

  // Audit
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date,
}

// Indexes
// - workspaceId + date
// - workspaceId + accountId + date
// - workspaceId + categoryId + date
// - workspaceId + type + date
```

**Transaction Types:**

- `income`: Money coming in (salary, freelance, etc.)
- `expense`: Money going out (food, bills, etc.)
- `transfer`: Money moving between accounts (not income/expense)

---

### 7. Recurring Transactions

```typescript
{
  _id: ObjectId,
  workspaceId: ObjectId,

  // Transaction template
  accountId: ObjectId,
  categoryId: ObjectId,
  subcategoryId?: string,
  type: "income" | "expense",       // No transfers
  amount: number,
  description: string,              // "Netflix", "Salary"

  // Recurrence
  frequency: "daily" | "weekly" | "monthly" | "yearly",
  interval: number,                 // Every X periods (default: 1)
  dayOfMonth?: number,              // 1-31 (monthly/yearly)
  dayOfWeek?: number,               // 0-6, Sunday=0 (weekly)
  monthOfYear?: number,             // 1-12 (yearly)

  // Schedule
  startDate: Date,
  endDate?: Date,
  nextRunDate: Date,
  lastRunDate?: Date,

  isActive: boolean,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date,
}

// Indexes
// - workspaceId
// - nextRunDate + isActive
```

**Examples:**

- Netflix ($15/month on day 15): `{ frequency: "monthly", dayOfMonth: 15 }`
- Salary ($3000/month on day 1): `{ frequency: "monthly", dayOfMonth: 1, type: "income" }`
- Weekly groceries (Saturdays): `{ frequency: "weekly", dayOfWeek: 6 }`

---

### 8. Budgets

```typescript
{
  _id: ObjectId,
  workspaceId: ObjectId,
  categoryId: ObjectId,

  amount: number,                   // Budget limit
  period: "weekly" | "monthly" | "yearly",
  startDate: Date,
  alertThreshold?: number,          // Notify at X% (e.g., 80)

  isActive: boolean,
  createdAt: Date,
  updatedAt: Date,
}

// Indexes
// - workspaceId + categoryId (unique when isActive)
// - workspaceId + isActive
```

---

## Summary

| Collection               | Purpose                                   |
| ------------------------ | ----------------------------------------- |
| `users`                  | User authentication and profile           |
| `workspaces`             | Multi-tenant container                    |
| `workspace_members`      | User ↔ Workspace membership               |
| `accounts`               | Financial accounts (bank, cash, etc.)     |
| `categories`             | Income/expense categories + subcategories |
| `transactions`           | All money movements                       |
| `recurring_transactions` | Scheduled transaction templates           |
| `budgets`                | Spending limits per category              |
