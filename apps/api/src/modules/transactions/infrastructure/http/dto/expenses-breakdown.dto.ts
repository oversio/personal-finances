import { createZodDto } from "nestjs-zod";
import { z } from "zod";

// Re-export application layer types for convenience
// Infrastructure consumers can import from here, maintaining proper dependency direction
export type {
  CategoryBreakdown,
  ExpensesBreakdownResponse,
  MonthlyExpense,
  SubcategoryBreakdown,
} from "../../../application/queries/get-expenses-breakdown/expenses-breakdown.types";

// Request DTO
const expensesBreakdownRequestSchema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(2000, { error: "Year must be at least 2000" })
    .max(2100, { error: "Year must be at most 2100" }),
});

export class ExpensesBreakdownRequestDto extends createZodDto(expensesBreakdownRequestSchema) {}

// Response schemas (for Swagger documentation and runtime validation if needed)
export const monthlyExpenseSchema = z.object({
  month: z.number().int().min(1).max(12),
  total: z.number(),
});

export const subcategoryBreakdownSchema = z.object({
  subcategoryId: z.string(),
  subcategoryName: z.string(),
  months: z.array(monthlyExpenseSchema),
  yearTotal: z.number(),
});

export const categoryBreakdownSchema = z.object({
  categoryId: z.string(),
  categoryName: z.string(),
  categoryColor: z.string(),
  months: z.array(monthlyExpenseSchema),
  yearTotal: z.number(),
  subcategories: z.array(subcategoryBreakdownSchema),
});

export const expensesBreakdownResponseSchema = z.object({
  year: z.number(),
  categories: z.array(categoryBreakdownSchema),
  monthlyTotals: z.array(monthlyExpenseSchema),
  grandTotal: z.number(),
});
