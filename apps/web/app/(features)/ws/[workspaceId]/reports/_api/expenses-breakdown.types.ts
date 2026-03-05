import { z } from "zod";

// Monthly expense for a specific month
export const MonthlyExpenseSchema = z.object({
  month: z.number().int().min(1).max(12),
  total: z.number(),
});

export type MonthlyExpense = z.infer<typeof MonthlyExpenseSchema>;

// Subcategory breakdown within a category
export const SubcategoryBreakdownSchema = z.object({
  subcategoryId: z.string(),
  subcategoryName: z.string(),
  months: z.array(MonthlyExpenseSchema),
  yearTotal: z.number(),
});

export type SubcategoryBreakdown = z.infer<typeof SubcategoryBreakdownSchema>;

// Category breakdown with subcategories
export const CategoryBreakdownSchema = z.object({
  categoryId: z.string(),
  categoryName: z.string(),
  categoryColor: z.string(),
  months: z.array(MonthlyExpenseSchema),
  yearTotal: z.number(),
  subcategories: z.array(SubcategoryBreakdownSchema),
});

export type CategoryBreakdown = z.infer<typeof CategoryBreakdownSchema>;

// Full expenses breakdown response
export const ExpensesBreakdownSchema = z.object({
  year: z.number(),
  categories: z.array(CategoryBreakdownSchema),
  monthlyTotals: z.array(MonthlyExpenseSchema),
  grandTotal: z.number(),
});

export type ExpensesBreakdown = z.infer<typeof ExpensesBreakdownSchema>;
