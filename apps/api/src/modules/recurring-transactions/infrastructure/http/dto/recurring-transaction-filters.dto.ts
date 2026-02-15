import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const recurringTransactionFiltersSchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  isActive: z
    .string()
    .transform(val => val === "true")
    .optional(),
  includeArchived: z
    .string()
    .transform(val => val === "true")
    .optional(),
});

export class RecurringTransactionFiltersDto extends createZodDto(
  recurringTransactionFiltersSchema,
) {}
