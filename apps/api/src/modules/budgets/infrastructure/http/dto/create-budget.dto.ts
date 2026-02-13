import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const BUDGET_PERIODS = ["weekly", "monthly", "yearly"] as const;

const createBudgetSchema = z.object({
  categoryId: z.string().min(1, { error: "Category ID is required" }),
  subcategoryId: z.string().optional(),
  name: z
    .string()
    .min(1, { error: "Budget name is required" })
    .max(100, { error: "Budget name must be less than 100 characters" }),
  amount: z
    .number()
    .positive({ error: "Budget amount must be positive" })
    .finite({ error: "Budget amount must be a finite number" }),
  period: z.enum(BUDGET_PERIODS, { error: "Invalid budget period" }),
  startDate: z.string({ error: "Invalid date format" }).transform(val => new Date(val)),
  alertThreshold: z
    .number()
    .min(1, { error: "Alert threshold must be at least 1%" })
    .max(100, { error: "Alert threshold cannot exceed 100%" })
    .optional(),
});

export class CreateBudgetDto extends createZodDto(createBudgetSchema) {}
