# Transaction Import Feature (Web)

This document describes the web implementation of the bulk transaction import feature.

## Overview

The import feature provides a 4-step wizard for uploading CSV files with multiple transactions:

1. **Upload** - Select or drag-and-drop a CSV file
2. **Preview** - Review validation results per row, see categories that will be created
3. **Confirm** - Choose to skip invalid rows, auto-create missing categories
4. **Result** - View import summary including created categories

## User Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Upload    │────▶│   Preview    │────▶│   Confirm    │────▶│   Result     │
│              │     │              │     │              │     │              │
│ - Download   │     │ - Summary    │     │ - Skip/Abort │     │ - Imported   │
│   template   │     │ - Row table  │     │   options    │     │   count      │
│ - Drag/drop  │     │ - Errors     │     │ - Final      │     │ - View txns  │
│   file       │     │   expandable │     │   count      │     │ - Import     │
│              │     │ - Pagination │     │              │     │   more       │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

## File Structure

```
app/(features)/ws/[workspaceId]/transactions/
├── import/
│   └── page.tsx                    # Import page route
├── _api/
│   ├── import.types.ts             # Zod schemas for import
│   ├── _support/
│   │   └── transaction-query-keys.ts  # Added import keys
│   ├── preview-import/
│   │   ├── preview-import.ts       # Fetcher (FormData upload)
│   │   └── use-preview-import.ts   # React Query mutation
│   ├── confirm-import/
│   │   ├── confirm-import.ts       # Fetcher
│   │   └── use-confirm-import.ts   # React Query mutation
│   └── get-import-template/
│       └── get-import-template.ts  # Template URL helper
└── _components/
    ├── import-wizard.tsx           # Main wizard component
    ├── import-upload-step.tsx      # File upload step
    ├── import-preview-step.tsx     # Validation preview
    ├── import-confirm-step.tsx     # Confirm options
    └── import-result-step.tsx      # Success summary
```

## Type Definitions

```typescript
// _api/import.types.ts
import { z } from "zod";

// Categories that will be auto-created during import
export const CategoryToCreateSchema = z.object({
  name: z.string(),
  type: z.enum(["income", "expense"]),
  subcategories: z.array(z.string()),
});

// Categories that were created during confirm
export const CreatedCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  subcategoriesCreated: z.array(z.string()),
});

export const ImportRowDataSchema = z.object({
  type: z.string(),
  accountName: z.string(),
  toAccountName: z.string().optional(),
  categoryName: z.string().optional(),
  subcategoryName: z.string().optional(),
  amount: z.number(),
  currency: z.string(),
  notes: z.string().optional(),
  date: z.string(),
});

export const ImportRowErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string(),
});

export const ImportRowSchema = z.object({
  rowNumber: z.number(),
  status: z.enum(["valid", "invalid", "warning"]),
  data: ImportRowDataSchema,
  resolvedIds: z.object({
    accountId: z.string().optional(),
    toAccountId: z.string().optional(),
    categoryId: z.string().optional(),
    subcategoryId: z.string().optional(),
  }),
  errors: z.array(ImportRowErrorSchema),
});

export const PreviewImportResponseSchema = z.object({
  sessionId: z.string(),
  rows: z.array(ImportRowSchema),
  summary: z.object({
    total: z.number(),
    valid: z.number(),
    invalid: z.number(),
    warnings: z.number(),
  }),
  categoriesToCreate: z.array(CategoryToCreateSchema),
});

export const ConfirmImportResponseSchema = z.object({
  imported: z.number(),
  skipped: z.number(),
  transactions: z.array(
    z.object({
      id: z.string(),
      rowNumber: z.number(),
    }),
  ),
  createdCategories: z.array(CreatedCategorySchema),
});

export interface ConfirmImportInput {
  sessionId: string;
  skipInvalid: boolean;
  createMissingCategories: boolean;
}
```

## API Layer

### Preview Import (File Upload)

The preview endpoint requires `multipart/form-data`, so we use `fetch` directly instead of the standard fetcher:

```typescript
// _api/preview-import/preview-import.ts
export async function previewImport({
  workspaceId,
  file,
}: PreviewImportParams): Promise<PreviewImportResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/ws/${workspaceId}/transactions/import/preview`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al procesar el archivo");
  }

  const data = await response.json();
  return PreviewImportResponseSchema.parse(data);
}
```

### Confirm Import

```typescript
// _api/confirm-import/confirm-import.ts
import { fetcher } from "@/_commons/api";

export async function confirmImport({
  workspaceId,
  data,
}: ConfirmImportParams): Promise<ConfirmImportResponse> {
  return fetcher(`/ws/${workspaceId}/transactions/import/confirm`, {
    method: "POST",
    body: data,
    schema: ConfirmImportResponseSchema,
  });
}
```

### Hooks

```typescript
// _api/preview-import/use-preview-import.ts
export function usePreviewImport() {
  return useMutation({
    mutationKey: [TRANSACTION_QUERY_KEYS.importPreview],
    mutationFn: previewImport,
  });
}

// _api/confirm-import/use-confirm-import.ts
export function useConfirmImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [TRANSACTION_QUERY_KEYS.importConfirm],
    mutationFn: confirmImport,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: [TRANSACTION_QUERY_KEYS.list, variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: [ACCOUNT_QUERY_KEYS.list, variables.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: [BUDGET_QUERY_KEYS.list, variables.workspaceId],
      });
      // Invalidate category queries if categories were created
      if (data.createdCategories && data.createdCategories.length > 0) {
        queryClient.invalidateQueries({
          queryKey: [CATEGORY_QUERY_KEYS.list, variables.workspaceId],
        });
      }
    },
  });
}
```

## Components

### ImportWizard (Main Component)

Manages wizard state and coordinates between steps:

```typescript
// _components/import-wizard.tsx
type WizardStep = "upload" | "preview" | "confirm" | "result";

export function ImportWizard({ workspaceId }: ImportWizardProps) {
  const [step, setStep] = useState<WizardStep>("upload");
  const [previewData, setPreviewData] = useState<PreviewImportResponse | null>(null);
  const [resultData, setResultData] = useState<ConfirmImportResponse | null>(null);
  const [skipInvalid, setSkipInvalid] = useState(true);
  const [createMissingCategories, setCreateMissingCategories] = useState(true);

  const previewMutation = usePreviewImport();
  const confirmMutation = useConfirmImport();

  const handleFileSelect = async (file: File) => {
    previewMutation.mutate(
      { workspaceId, file },
      {
        onSuccess: data => {
          setPreviewData(data);
          setStep("preview");
        },
      },
    );
  };

  const handleConfirm = async () => {
    confirmMutation.mutate(
      {
        workspaceId,
        data: {
          sessionId: previewData!.sessionId,
          skipInvalid,
          createMissingCategories,
        },
      },
      {
        onSuccess: data => {
          setResultData(data);
          setStep("result");
        },
      },
    );
  };

  // Render step components based on current step...
}
```

### ImportUploadStep

File upload with drag-and-drop:

```typescript
// _components/import-upload-step.tsx
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["text/csv", "application/csv"];

export function ImportUploadStep({ workspaceId, onFileSelect, isPending }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) return "El archivo excede el tamaño máximo de 5MB";
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.endsWith(".csv")) {
      return "Solo se aceptan archivos CSV";
    }
    return null;
  };

  return (
    <div>
      {/* Download template link */}
      <Button as="a" href={getImportTemplateUrl(workspaceId)} download>
        Descargar plantilla CSV
      </Button>

      {/* Drag-and-drop zone */}
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={isDragOver ? "border-primary" : "border-default"}
      >
        <input type="file" accept=".csv" onChange={handleInputChange} />
        <p>Haz clic para seleccionar o arrastra tu archivo aquí</p>
      </label>
    </div>
  );
}
```

### ImportPreviewStep

Validation results table with expandable error details and categories to create info box:

```typescript
// _components/import-preview-step.tsx
export function ImportPreviewStep({ rows, summary, categoriesToCreate, onBack, onNext }) {
  const [page, setPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  return (
    <div>
      {/* Summary badges */}
      <div className="flex gap-4">
        <span>Total: {summary.total}</span>
        <span className="text-success">Válidas: {summary.valid}</span>
        <span className="text-warning">Advertencias: {summary.warnings}</span>
        <span className="text-danger">Inválidas: {summary.invalid}</span>
      </div>

      {/* Categories to create info box */}
      {categoriesToCreate.length > 0 && (
        <div className="border-warning-200 bg-warning-50 p-4">
          <p className="font-medium text-warning-700">
            Se crearán {categoriesToCreate.length} categoría(s) faltante(s)
          </p>
          <ul className="text-warning-600">
            {categoriesToCreate.map(cat => (
              <li>
                <span className="font-medium">{cat.name}</span>
                <span> ({cat.type})</span>
                {cat.subcategories.length > 0 && (
                  <span> con subcategorías: {cat.subcategories.join(", ")}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Validation table */}
      <table>
        {/* ... table content ... */}
      </table>

      <Pagination total={totalPages} page={page} onChange={setPage} />
    </div>
  );
}
```

### ImportConfirmStep

Skip/abort selection and auto-create categories checkbox:

```typescript
// _components/import-confirm-step.tsx
export function ImportConfirmStep({
  summary,
  categoriesToCreate,
  skipInvalid,
  onSkipInvalidChange,
  createMissingCategories,
  onCreateMissingCategoriesChange,
  onConfirm,
  isPending,
}) {
  // Calculate import count based on settings
  const importCount = createMissingCategories
    ? summary.valid + summary.warnings
    : summary.valid;

  return (
    <div>
      {/* Auto-create categories checkbox (for warning rows) */}
      {summary.warnings > 0 && categoriesToCreate.length > 0 && (
        <div className="border-warning-200 bg-warning-50 p-4">
          <Checkbox
            isSelected={createMissingCategories}
            onValueChange={onCreateMissingCategoriesChange}
          >
            Crear {categoriesToCreate.length} categoría(s) faltante(s) automáticamente
          </Checkbox>
          <ul className="text-warning-600">
            {categoriesToCreate.map(cat => (
              <li>{cat.name} ({cat.type})</li>
            ))}
          </ul>
        </div>
      )}

      {/* Skip invalid rows selection */}
      {summary.invalid > 0 && (
        <RadioGroup value={skipInvalid ? "skip" : "abort"} onValueChange={...}>
          <Radio value="skip">Omitir filas con errores</Radio>
          <Radio value="abort">Cancelar importación</Radio>
        </RadioGroup>
      )}

      <Button onPress={onConfirm} isLoading={isPending}>
        Importar {importCount} transacciones
      </Button>
    </div>
  );
}
```

### ImportResultStep

Success summary with navigation and created categories:

```typescript
// _components/import-result-step.tsx
export function ImportResultStep({ workspaceId, result, onImportMore }) {
  const hasCreatedCategories = result.createdCategories?.length > 0;

  return (
    <div>
      <CheckCircleIcon className="text-success" />
      <h2>Importación completada</h2>

      <p>Transacciones importadas: {result.imported}</p>
      {result.skipped > 0 && <p>Transacciones omitidas: {result.skipped}</p>}
      {hasCreatedCategories && (
        <p>Categorías creadas: {result.createdCategories.length}</p>
      )}

      {/* Created categories info box */}
      {hasCreatedCategories && (
        <div className="border-warning-200 bg-warning-50 p-4">
          <p className="font-medium">Categorías creadas:</p>
          <ul>
            {result.createdCategories.map(cat => (
              <li>
                {cat.name}
                {cat.subcategoriesCreated.length > 0 && (
                  <span> (subcategorías: {cat.subcategoriesCreated.join(", ")})</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button as={Link} href={`/ws/${workspaceId}/transactions`}>
        Ver transacciones
      </Button>
      {hasCreatedCategories && (
        <Button as={Link} href={`/ws/${workspaceId}/categories`}>
          Ver categorías
        </Button>
      )}
      <Button onPress={onImportMore}>
        Importar más
      </Button>
    </div>
  );
}
```

## Page Integration

### Import Page

```typescript
// import/page.tsx
export default function ImportTransactionsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  return (
    <div className="mx-auto max-w-4xl">
      <Button as={Link} href={`/ws/${workspaceId}/transactions`}>
        Volver a Transacciones
      </Button>

      <Card>
        <CardHeader>
          <h1>Importar Transacciones</h1>
          <p>Carga un archivo CSV con múltiples transacciones</p>
        </CardHeader>
        <CardBody>
          <ImportWizard workspaceId={workspaceId} />
        </CardBody>
      </Card>
    </div>
  );
}
```

### Transactions Page (Import Button)

```typescript
// page.tsx
export default function TransactionsPage() {
  const { workspaceId } = useParams();

  return (
    <div>
      <div className="flex justify-between">
        <h1>Transacciones</h1>
        <div className="flex gap-2">
          <Button
            as={Link}
            href={`/ws/${workspaceId}/transactions/import`}
            variant="flat"
            startContent={<DocumentArrowUpIcon />}
          >
            Importar
          </Button>
          <Button
            as={Link}
            href={`/ws/${workspaceId}/transactions/new`}
            color="primary"
          >
            Nueva Transacción
          </Button>
        </div>
      </div>
      <TransactionList workspaceId={workspaceId} />
    </div>
  );
}
```

## Icons Used

The following icons were added to `@repo/ui/icons`:

| Icon                      | Usage                      |
| ------------------------- | -------------------------- |
| `ArrowLeftIcon`           | Back navigation            |
| `DocumentArrowUpIcon`     | Import button, upload icon |
| `DocumentArrowDownIcon`   | Download template          |
| `CheckCircleIcon`         | Valid rows, success state  |
| `XCircleIcon`             | Invalid rows               |
| `ExclamationTriangleIcon` | Warning rows               |
| `ChevronDownIcon`         | Expand row errors          |

## Styling Patterns

### Status Colors

```typescript
// Row background
row.status === "invalid" ? "bg-danger/5" : row.status === "warning" ? "bg-warning/5" : ""

// Status chips
<Chip color="success" variant="flat">Válida</Chip>
<Chip color="danger" variant="flat">Inválida</Chip>
<Chip color="warning" variant="flat">Advertencia</Chip>
```

### Step Indicator

```typescript
// Active step
"bg-primary text-white";

// Completed step
"bg-success text-white";

// Pending step
"bg-default-200 text-default-500";
```

## Error Handling

Errors are displayed in Spanish and include field-level details:

```typescript
// General error banner
{error && (
  <div className="border-danger-200 bg-danger-50 text-danger-700">
    {error}
  </div>
)}

// Row-level errors (expandable)
{row.errors.map(error => (
  <li className="text-danger-600">{error.message}</li>
))}
```

## Cache Invalidation

On successful import, the following queries are invalidated:

- `transactions-list` - Refresh transaction list
- `accounts-list` - Update account balances
- `budgets-list` - Update budget progress
- `categories-list` - Refresh category list (only if categories were created)

## Auto-Create Missing Categories

When a CSV contains category/subcategory names that don't exist in the workspace:

1. **Preview step**: Rows are marked as `warning` (yellow), not `invalid` (red)
2. **Preview step**: Info box shows which categories will be created
3. **Confirm step**: Checkbox (checked by default) to auto-create categories
4. **Confirm step**: Import count includes warning rows when checkbox is checked
5. **Result step**: Shows list of created categories with their subcategories

If the user unchecks the auto-create checkbox, warning rows are skipped like invalid rows.

## Future Enhancements

1. **Column mapping UI** - Let users map their CSV columns to expected fields
2. **Excel support** - Add .xlsx file upload (requires API extension)
3. **Duplicate detection** - Warn about potential duplicate transactions
4. **Import history** - Show past imports with undo option
