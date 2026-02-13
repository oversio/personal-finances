import { z } from "zod";

export const BUDGET_PERIODS = ["weekly", "monthly", "yearly"] as const;

export const BudgetPeriodSchema = z.enum(BUDGET_PERIODS);
export type BudgetPeriod = z.infer<typeof BudgetPeriodSchema>;

export const CategoryInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
});

export const SubcategoryInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const BudgetSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  categoryId: z.string(),
  subcategoryId: z.string().nullable().optional(),
  name: z.string(),
  amount: z.number(),
  period: BudgetPeriodSchema,
  startDate: z.coerce.date(),
  alertThreshold: z.number().nullable().optional(),
  isArchived: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  // Computed progress fields
  spent: z.number(),
  remaining: z.number(),
  percentage: z.number(),
  isExceeded: z.boolean(),
  isWarning: z.boolean(),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  // Populated category info
  category: CategoryInfoSchema,
  subcategory: SubcategoryInfoSchema.optional(),
});

export type Budget = z.infer<typeof BudgetSchema>;

export interface CreateBudgetInput {
  categoryId: string;
  subcategoryId?: string;
  name: string;
  amount: number;
  period: BudgetPeriod;
  startDate: string | Date;
  alertThreshold?: number;
}

export interface UpdateBudgetInput {
  name?: string;
  amount?: number;
  period?: BudgetPeriod;
  alertThreshold?: number | null;
}
