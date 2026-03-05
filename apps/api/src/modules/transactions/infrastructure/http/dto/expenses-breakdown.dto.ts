import { createZodDto } from "nestjs-zod";
import { z } from "zod";

// Request DTO
const expensesBreakdownRequestSchema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(2000, { error: "Year must be at least 2000" })
    .max(2100, { error: "Year must be at most 2100" }),
});

export class ExpensesBreakdownRequestDto extends createZodDto(expensesBreakdownRequestSchema) {}

// Response schemas (for documentation/typing purposes)
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

// Types extracted from schemas
export type MonthlyExpense = z.infer<typeof monthlyExpenseSchema>;
export type SubcategoryBreakdown = z.infer<typeof subcategoryBreakdownSchema>;
export type CategoryBreakdown = z.infer<typeof categoryBreakdownSchema>;
export type ExpensesBreakdownResponse = z.infer<typeof expensesBreakdownResponseSchema>;
