# Transaction Import Module

This document describes the implementation of the bulk transaction import feature via CSV file upload.

## Overview

The import feature allows users to upload a CSV file with multiple transactions, preview validation results, and confirm the import. It uses the **Port/Adapter pattern** for file parsing, making it easy to add support for Excel, OFX, or other formats.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        HTTP Layer                                │
│  TransactionImportController                                     │
│  - GET  /import/template  → Download CSV template                │
│  - POST /import/preview   → Upload & validate file               │
│  - POST /import/confirm   → Create transactions                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                            │
│  ┌─────────────────────┐    ┌─────────────────────┐             │
│  │ PreviewImportHandler│    │ ConfirmImportHandler│             │
│  │ - Parse file        │    │ - Retrieve session  │             │
│  │ - Match names       │    │ - Create transactions│            │
│  │ - Validate rows     │    │ - Emit events       │             │
│  │ - Store session     │    │ - Delete session    │             │
│  └─────────────────────┘    └─────────────────────┘             │
│                                                                  │
│  Ports (Interfaces):                                             │
│  - FileParserService     → Abstraction for file parsing         │
│  - ImportSessionRepository → Session storage                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                           │
│  Adapters:                                                       │
│  - CsvParserService        → CSV parsing with papaparse         │
│  - MongooseImportSessionRepository → MongoDB session storage     │
│                                                                  │
│  Schemas:                                                        │
│  - ImportSessionModel      → Session with 15-min TTL            │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
src/modules/transactions/
├── application/
│   ├── commands/
│   │   ├── preview-import/
│   │   │   ├── preview-import.command.ts
│   │   │   ├── preview-import.handler.ts
│   │   │   └── index.ts
│   │   └── confirm-import/
│   │       ├── confirm-import.command.ts
│   │       ├── confirm-import.handler.ts
│   │       └── index.ts
│   └── ports/
│       ├── file-parser.service.ts      # Parser port
│       ├── import-session.repository.ts # Session port
│       └── index.ts
├── infrastructure/
│   ├── http/
│   │   ├── controllers/
│   │   │   └── transaction-import.controller.ts
│   │   └── dto/
│   │       └── confirm-import.dto.ts
│   ├── persistence/
│   │   ├── schemas/
│   │   │   └── import-session.schema.ts
│   │   └── repositories/
│   │       └── mongoose-import-session.repository.ts
│   └── services/
│       ├── csv-parser.service.ts       # CSV adapter
│       └── index.ts
└── transactions.module.ts              # Module registration
```

## Ports (Interfaces)

### FileParserService

```typescript
// application/ports/file-parser.service.ts
export const FILE_PARSER_SERVICE = Symbol("FILE_PARSER_SERVICE");

export interface ParsedRow {
  rowNumber: number;
  raw: Record<string, string>; // Original CSV values
}

export interface ParsedFile {
  headers: string[];
  rows: ParsedRow[];
}

export interface FileParserService {
  supports(mimeType: string): boolean;
  parse(buffer: Buffer): Promise<ParsedFile>;
}
```

### ImportSessionRepository

```typescript
// application/ports/import-session.repository.ts
export const IMPORT_SESSION_REPOSITORY = Symbol("IMPORT_SESSION_REPOSITORY");

export interface ImportSession {
  id: string;
  workspaceId: string;
  userId: string;
  fileName: string;
  rows: ImportRow[];
  summary: { total: number; valid: number; invalid: number; warnings: number };
  createdAt: Date;
}

export interface ImportSessionRepository {
  create(data: CreateImportSessionData): Promise<ImportSession>;
  findById(id: string): Promise<ImportSession | null>;
  delete(id: string): Promise<void>;
}
```

## API Endpoints

### GET /ws/:workspaceId/transactions/import/template

Downloads a CSV template with example data.

**Response:** `text/csv` file

```csv
type,account,toAccount,category,subcategory,amount,currency,notes,date
expense,Cuenta Corriente,,Alimentación,Supermercado,150.00,USD,Compras semanales,2024-01-15
income,Cuenta Corriente,,Salario,,2500.00,USD,Salario enero,2024-01-01
transfer,Cuenta Corriente,Ahorros,,,500.00,USD,Ahorro mensual,2024-01-10
```

### POST /ws/:workspaceId/transactions/import/preview

Uploads a file and returns validation results.

**Request:** `multipart/form-data` with `file` field

**Response:**

```json
{
  "sessionId": "session_abc123",
  "rows": [
    {
      "rowNumber": 1,
      "status": "valid",
      "data": {
        "type": "expense",
        "accountName": "Cuenta Corriente",
        "categoryName": "Alimentación",
        "amount": 150.0,
        "currency": "USD",
        "date": "2024-01-15"
      },
      "resolvedIds": {
        "accountId": "acc_123",
        "categoryId": "cat_456"
      },
      "errors": []
    },
    {
      "rowNumber": 2,
      "status": "warning",
      "data": {
        "type": "expense",
        "accountName": "Cuenta Corriente",
        "categoryName": "Nueva Categoría",
        "amount": 50.0,
        "currency": "USD",
        "date": "2024-01-16"
      },
      "resolvedIds": {
        "accountId": "acc_123"
      },
      "errors": [
        {
          "field": "category",
          "message": "Categoría 'Nueva Categoría' será creada como gasto",
          "code": "CATEGORY_WILL_BE_CREATED"
        }
      ]
    }
  ],
  "summary": {
    "total": 10,
    "valid": 6,
    "invalid": 2,
    "warnings": 2
  },
  "categoriesToCreate": [
    {
      "name": "Nueva Categoría",
      "type": "expense",
      "subcategories": []
    }
  ]
}
```

**Row Status:**

- `valid`: Row is ready to import
- `warning`: Row has missing categories that can be auto-created
- `invalid`: Row has errors that cannot be auto-corrected (e.g., missing account)

### POST /ws/:workspaceId/transactions/import/confirm

Confirms the import and creates transactions.

**Request:**

```json
{
  "sessionId": "session_abc123",
  "skipInvalid": true,
  "createMissingCategories": true
}
```

| Field                     | Type    | Description                                     |
| ------------------------- | ------- | ----------------------------------------------- |
| `sessionId`               | string  | The session ID from preview response            |
| `skipInvalid`             | boolean | Skip rows with errors (status: invalid)         |
| `createMissingCategories` | boolean | Auto-create missing categories for warning rows |

**Response:**

```json
{
  "imported": 8,
  "skipped": 2,
  "transactions": [
    { "id": "txn_1", "rowNumber": 1 },
    { "id": "txn_3", "rowNumber": 3 }
  ],
  "createdCategories": [
    {
      "id": "cat_789",
      "name": "Nueva Categoría",
      "type": "expense",
      "subcategoriesCreated": []
    }
  ]
}
```

## Auto-Create Missing Categories

When a CSV contains category/subcategory names that don't exist in the workspace:

1. **Preview phase**: Rows are marked as `warning` (not `invalid`)
2. **Confirm phase**: If `createMissingCategories: true`:
   - New categories are created with the correct type (income/expense)
   - New subcategories are added to existing or new categories
   - Warning rows are then imported as normal transactions

This allows users to import transactions with new categories without manually creating them first.

## Name Matching Logic

The import uses **flexible matching** for account/category names:

```typescript
// shared/utils/normalize-for-match.ts
export function normalizeForMatch(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove diacritics
}

// "Alimentación" matches "alimentacion", " ALIMENTACIÓN ", "Alimentacion"
```

## Validation Rules

The handler reuses existing constants and utilities:

- `TRANSACTION_TYPES` from `@/modules/transactions/domain/value-objects`
- `CURRENCIES` from `@/modules/workspaces`
- `normalizeForMatch` and `matchesFlexibly` from `@/modules/shared/utils`

| Field       | Required           | Validation                                 |
| ----------- | ------------------ | ------------------------------------------ |
| type        | Yes                | Must be `income`, `expense`, or `transfer` |
| account     | Yes                | Must match existing account name           |
| toAccount   | For transfers      | Must match existing account name           |
| category    | For income/expense | Must match category name of same type      |
| subcategory | No                 | Must belong to the matched category        |
| amount      | Yes                | Positive number                            |
| currency    | Yes                | Valid currency code (USD, EUR, CLP, etc.)  |
| date        | Yes                | YYYY-MM-DD format                          |
| notes       | No                 | Optional description                       |

## Session Storage

Import sessions are stored in MongoDB with a **15-minute TTL**:

```typescript
// infrastructure/persistence/schemas/import-session.schema.ts
@Schema({ collection: "import_sessions", timestamps: true })
export class ImportSessionModel {
  @Prop({ type: Types.ObjectId, required: true })
  workspaceId!: Types.ObjectId;

  @Prop({ type: [Object], required: true })
  rows!: ImportRow[];

  @Prop({ type: Object, required: true })
  summary!: { total: number; valid: number; invalid: number; warnings: number };
}

// TTL index: sessions expire after 15 minutes
ImportSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });
```

## Module Registration

```typescript
// transactions.module.ts
const repositories = [
  { provide: TRANSACTION_REPOSITORY, useClass: MongooseTransactionRepository },
  { provide: IMPORT_SESSION_REPOSITORY, useClass: MongooseImportSessionRepository },
];

const services = [{ provide: FILE_PARSER_SERVICE, useClass: CsvParserService }];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TransactionModel.name, schema: TransactionSchema },
      { name: ImportSessionModel.name, schema: ImportSessionSchema },
    ]),
    AccountsModule,
    CategoriesModule,
  ],
  controllers: [TransactionsController, TransactionImportController],
  providers: [...commandHandlers, ...repositories, ...services],
})
export class TransactionsModule {}
```

## Adding New File Formats

To add support for Excel files:

1. **Create the adapter:**

```typescript
// infrastructure/services/xlsx-parser.service.ts
import { Injectable } from "@nestjs/common";
import * as XLSX from "xlsx";
import type { FileParserService, ParsedFile } from "../../application/ports";

@Injectable()
export class XlsxParserService implements FileParserService {
  supports(mimeType: string): boolean {
    return [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ].includes(mimeType);
  }

  async parse(buffer: Buffer): Promise<ParsedFile> {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { header: 1 });

    // Transform to ParsedFile format...
  }
}
```

2. **Register as a composite service:**

```typescript
// Use a factory to combine parsers
const services = [
  {
    provide: FILE_PARSER_SERVICE,
    useFactory: (csv: CsvParserService, xlsx: XlsxParserService) => ({
      supports: (mime: string) => csv.supports(mime) || xlsx.supports(mime),
      parse: (buffer: Buffer, mime: string) =>
        csv.supports(mime) ? csv.parse(buffer) : xlsx.parse(buffer),
    }),
    inject: [CsvParserService, XlsxParserService],
  },
];
```

## Error Codes

### Hard Errors (status: invalid)

| Code                   | Message (Spanish)                                  |
| ---------------------- | -------------------------------------------------- |
| `TYPE_REQUIRED`        | El tipo de transacción es requerido                |
| `INVALID_TYPE`         | Tipo '{type}' inválido                             |
| `ACCOUNT_REQUIRED`     | La cuenta es requerida                             |
| `ACCOUNT_NOT_FOUND`    | Cuenta '{name}' no encontrada                      |
| `TO_ACCOUNT_REQUIRED`  | La cuenta destino es requerida para transferencias |
| `TO_ACCOUNT_NOT_FOUND` | Cuenta destino '{name}' no encontrada              |
| `CATEGORY_REQUIRED`    | La categoría es requerida para ingresos y gastos   |
| `AMOUNT_REQUIRED`      | El monto es requerido                              |
| `INVALID_AMOUNT`       | Monto '{value}' inválido                           |
| `CURRENCY_REQUIRED`    | La moneda es requerida                             |
| `INVALID_CURRENCY`     | Moneda '{code}' inválida                           |
| `DATE_REQUIRED`        | La fecha es requerida                              |
| `INVALID_DATE`         | Fecha '{value}' inválida                           |

### Soft Errors / Warnings (status: warning)

These can be auto-resolved by setting `createMissingCategories: true`:

| Code                          | Message (Spanish)                                 |
| ----------------------------- | ------------------------------------------------- |
| `CATEGORY_WILL_BE_CREATED`    | Categoría '{name}' será creada como {type}        |
| `SUBCATEGORY_WILL_BE_CREATED` | Subcategoría '{name}' será creada en '{category}' |

## Testing

```bash
# Download template
curl http://localhost:9000/ws/{workspaceId}/transactions/import/template \
  -H "Authorization: Bearer {token}" \
  -o template.csv

# Preview import
curl -X POST http://localhost:9000/ws/{workspaceId}/transactions/import/preview \
  -H "Authorization: Bearer {token}" \
  -F "file=@transactions.csv"

# Confirm import
curl -X POST http://localhost:9000/ws/{workspaceId}/transactions/import/confirm \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "...", "skipInvalid": true}'
```
