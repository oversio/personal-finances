# Reports Module

This document describes the implementation patterns for the reports module, using the Expenses Breakdown report as the reference implementation.

## Overview

The reports module provides analytical views of financial data. Reports follow a pattern of:

1. **Aggregated data endpoint** - Backend computes summaries for efficient initial load
2. **On-demand detail fetching** - Drill-down into specific data points without leaving the page
3. **Interactive table UI** - Google Sheets-like experience with expand/collapse, sticky headers, and popovers

## Route Structure

```
/ws/[workspaceId]/reports/
└── expenses/       # Expenses breakdown by category/subcategory and month
```

Future reports (same patterns apply):

- `/reports/income` - Income breakdown
- `/reports/cash-flow` - Income vs Expenses
- `/reports/budget-vs-actual` - Budget comparison

## Expenses Breakdown Report

### Visual Design

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│  Gastos por Categoría                              [2026 ▼]  [Expandir] [Colapsar] │
├──────────────────────────────────────────────────────────────────────────────────┤
│                    │  Ene    Feb    Mar    ...    Dic   │  TOTAL   │
├────────────────────┼────────────────────────────────────┼──────────┤
│ ▼ Alimentación     │  450k   420k   480k   ...     -    │  2.6M    │  ← Expanded
│   ├─ Supermercado  │  320k   300k   350k   ...     -    │  1.86M   │
│   ├─ Restaurantes  │  100k    90k   100k   ...     -    │   560k   │
│   └─ Delivery      │   30k    30k    30k   ...     -    │   180k   │
├────────────────────┼────────────────────────────────────┼──────────┤
│ ▶ Transporte       │  280k   250k   300k   ...     -    │  1.64M   │  ← Collapsed
├────────────────────┴────────────────────────────────────┴──────────┤
│  TOTAL             │ 1.08M  970k   1.18M   ...     -    │  6.31M   │
└────────────────────────────────────────────────────────────────────┘
```

### Key Features

| Feature                   | Description                                                    |
| ------------------------- | -------------------------------------------------------------- |
| Collapsible categories    | ▼/▶ to expand/collapse subcategories                           |
| Sticky headers            | Category column stays visible when scrolling horizontally      |
| Color coding              | Category color displayed as dot next to name                   |
| Clickable cells + Popover | Click amount → popover with transaction list (on-demand fetch) |
| Year selector             | Dropdown to switch years                                       |
| Formatted numbers         | Abbreviated (450k, 2.6M) with full amount on hover             |

### Transaction Details Popover

Clicking any amount cell opens a popover with transaction details:

```
┌────────────────────────────────┐
│  Supermercado - Marzo 2026     │
│  Total: $350,000               │
├────────────────────────────────┤
│  01/03  $85,000   Compras sem. │
│  08/03  $92,000   Compras sem. │
│  15/03  $78,000   Compras sem. │
│  22/03  $95,000   Compras sem. │
├────────────────────────────────┤
│  4 transacciones    [Ver todas →] │
└────────────────────────────────┘
```

**On-demand fetching approach:**

- Initial load: Just aggregated totals (fast)
- Click cell → Fetch transactions for that category/subcategory + month
- React Query caches results so re-opening is instant

---

## Backend Implementation

### API Endpoint

```
GET /api/workspaces/:workspaceId/transactions/expenses-breakdown?year=2026
```

### Response Structure

```typescript
interface ExpensesBreakdownResponse {
  year: number;
  categories: CategoryBreakdown[];
  monthlyTotals: MonthlyExpense[];
  grandTotal: number;
}

interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  months: MonthlyExpense[]; // Sparse array - only months with data
  yearTotal: number;
  subcategories: SubcategoryBreakdown[];
}

interface SubcategoryBreakdown {
  subcategoryId: string;
  subcategoryName: string;
  months: MonthlyExpense[];
  yearTotal: number;
}

interface MonthlyExpense {
  month: number; // 1-12
  total: number;
}
```

### Implementation Pattern

The handler follows a three-step process:

1. **Aggregate raw data** - MongoDB aggregation groups by categoryId, subcategoryId, month
2. **Enrich with metadata** - Join with categories to get names and colors
3. **Structure response** - Transform into hierarchical format for frontend

```typescript
// Handler structure (simplified)
async execute(query: GetExpensesBreakdownQuery): Promise<ExpensesBreakdownResponse> {
  // 1. Get raw aggregation data
  const rawData = await this.transactionRepo.aggregateExpensesByMonth(
    query.workspaceId,
    query.year,
  );

  // 2. Get all categories for the workspace (to get names and colors)
  const categories = await this.categoryRepo.findByWorkspaceId(query.workspaceId);
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  // 3. Transform raw data into structured response
  // Group by categoryId, then by subcategoryId, aggregate months
  // Calculate totals (per category, per month, grand total)

  return structuredResponse;
}
```

### MongoDB Aggregation

The repository method groups by `categoryId`, `subcategoryId`, `month` and sums `amount`. Filters:

- `type: "expense"` only
- `isArchived: false`
- Transactions within the specified year
- Transactions with a category assigned

### Hexagonal Architecture Note

Types are defined in the **application layer** (`application/queries/get-expenses-breakdown/expenses-breakdown.types.ts`) and re-exported from infrastructure for external consumers. This maintains the correct dependency direction: domain → application → infrastructure.

---

## Frontend Implementation

### Folder Structure

```
app/(features)/ws/[workspaceId]/reports/
├── _api/
│   ├── _support/
│   │   └── reports-query-keys.ts
│   └── get-expenses-breakdown/
│       ├── get-expenses-breakdown.ts
│       └── use-get-expenses-breakdown.ts
└── expenses/
    ├── page.tsx
    └── _components/
        ├── expenses-breakdown-table.tsx   # Main table (Client Component)
        ├── category-row.tsx               # Expandable category row
        ├── subcategory-row.tsx            # Subcategory row (child)
        ├── total-row.tsx                  # Footer totals row
        ├── amount-cell.tsx                # Clickable cell with popover
        └── transaction-popover.tsx        # Popover with transaction list
```

### Component Hierarchy

```
ExpensesPage (Server Component)
└── ExpensesBreakdownTable (Client Component)
    ├── Controls
    │   ├── YearSelector (Select)
    │   └── Expand/Collapse All buttons
    ├── TableHeader (sticky)
    │   └── MonthHeaders (Ene, Feb, Mar, ...)
    ├── TableBody
    │   ├── CategoryRow (for each category)
    │   │   ├── Collapse toggle (▼/▶)
    │   │   ├── Category name + color dot
    │   │   ├── AmountCell × 12 months
    │   │   └── Total cell
    │   └── SubcategoryRow (when expanded)
    │       ├── Subcategory name (indented)
    │       ├── AmountCell × 12 months
    │       └── Total cell
    └── TotalRow (footer)
        └── Grand totals per month + year total
```

### State Management

```typescript
// Local state for UI interactions
const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

const toggleCategory = (categoryId: string) => {
  setExpandedCategories(prev => {
    const next = new Set(prev);
    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
    }
    return next;
  });
};
```

### Number Formatting

Chilean locale with abbreviated format for readability:

```typescript
function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000)}k`;
  }
  return amount.toLocaleString("es-CL");
}

function formatFullCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(amount);
}
```

### AmountCell Component

Handles click → popover with transaction details:

```typescript
export function AmountCell(props: AmountCellProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (props.amount === 0) {
    return <td className="text-center text-default-400">-</td>;
  }

  return (
    <td className="text-right">
      <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <button
            className="hover:bg-default-100 rounded px-2 py-1"
            title={formatFullCurrency(props.amount)}
          >
            {formatCompactCurrency(props.amount)}
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <TransactionPopover {...props} />
        </PopoverContent>
      </Popover>
    </td>
  );
}
```

### TransactionPopover Component

Fetches transactions on-demand using existing list endpoint:

```typescript
export function TransactionPopover(props: TransactionPopoverProps) {
  const startDate = new Date(props.year, props.month - 1, 1);
  const endDate = new Date(props.year, props.month, 0);

  const { data, isLoading, error } = useGetTransactionList({
    workspaceId: props.workspaceId,
    filters: {
      categoryId: props.categoryId,
      subcategoryId: props.subcategoryId ?? undefined,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      type: "expense",
    },
    pageSize: 10,
  });

  // Render loading, error, or transaction list
}
```

### Query Invalidation

Reports are invalidated when transactions change:

```typescript
// In transaction mutation hooks (create, update, delete)
onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: [REPORTS_QUERY_KEYS.expensesBreakdown, variables.workspaceId],
  });
};
```

---

## Adding New Reports

To add a new report following this pattern:

### Backend

1. Create aggregation method in repository interface (`application/ports/`)
2. Implement aggregation in MongoDB repository (`infrastructure/persistence/`)
3. Create query class and handler (`application/queries/[report-name]/`)
4. Define types in application layer, re-export from infrastructure DTOs
5. Add endpoint to controller

### Frontend

1. Create API folder (`_api/get-[report-name]/`)
2. Add query key to `_api/_support/reports-query-keys.ts`
3. Create page and components under `reports/[report-name]/`
4. Add to sidebar navigation

### Sidebar Navigation

Reports appear under a collapsible "Reportes" group in the workspace sidebar:

```typescript
// In sidebar-menu-items.ts
{
  type: "group",
  label: "Reportes",
  items: [
    {
      href: `/ws/${workspaceId}/reports/expenses`,
      icon: ChartBarIcon,
      label: "Gastos",
    },
    // Future reports go here
  ],
}
```
