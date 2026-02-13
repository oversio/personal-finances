import { z } from "zod";

const BUDGET_PERIODS = ["weekly", "monthly", "yearly"] as const;

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, { message: "Please select a category" }),
  subcategoryId: z.string().optional(),
  name: z
    .string()
    .min(1, { message: "Budget name is required" })
    .max(100, { message: "Budget name must be less than 100 characters" }),
  amount: z.number().positive({ message: "Amount must be greater than 0" }),
  period: z.enum(BUDGET_PERIODS, { message: "Please select a period" }),
  startDate: z.date({ message: "Please select a start date" }),
  alertThreshold: z.number().min(1).max(100).optional(),
});

export type CreateBudgetFormData = z.infer<typeof createBudgetSchema>;

export const updateBudgetSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Budget name is required" })
    .max(100, { message: "Budget name must be less than 100 characters" })
    .optional(),
  amount: z.number().positive({ message: "Amount must be greater than 0" }).optional(),
  period: z.enum(BUDGET_PERIODS, { message: "Please select a period" }).optional(),
  alertThreshold: z.number().min(1).max(100).nullish(),
});

export type UpdateBudgetFormData = z.infer<typeof updateBudgetSchema>;

export const BUDGET_PERIOD_LABELS: Record<(typeof BUDGET_PERIODS)[number], string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};
