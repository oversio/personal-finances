import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const BUDGET_PERIODS = ["weekly", "monthly", "yearly"] as const;

const updateBudgetSchema = z.object({
  name: z
    .string()
    .min(1, { error: "Budget name is required" })
    .max(100, { error: "Budget name must be less than 100 characters" })
    .optional(),
  amount: z
    .number()
    .positive({ error: "Budget amount must be positive" })
    .finite({ error: "Budget amount must be a finite number" })
    .optional(),
  period: z.enum(BUDGET_PERIODS, { error: "Invalid budget period" }).optional(),
  alertThreshold: z
    .number()
    .min(1, { error: "Alert threshold must be at least 1%" })
    .max(100, { error: "Alert threshold cannot exceed 100%" })
    .nullish(),
});

export class UpdateBudgetDto extends createZodDto(updateBudgetSchema) {}
