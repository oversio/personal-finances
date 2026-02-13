import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const TRANSACTION_TYPES = ["income", "expense", "transfer"] as const;

const transactionFiltersSchema = z.object({
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  type: z.enum(TRANSACTION_TYPES, { error: "Invalid transaction type" }).optional(),
  startDate: z
    .string()
    .transform(val => new Date(val))
    .optional(),
  endDate: z
    .string()
    .transform(val => new Date(val))
    .optional(),
  includeArchived: z
    .string()
    .transform(val => val === "true")
    .optional(),
});

export class TransactionFiltersDto extends createZodDto(transactionFiltersSchema) {}
