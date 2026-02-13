import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const TRANSACTION_TYPES = ["income", "expense", "transfer"] as const;

const updateTransactionSchema = z
  .object({
    type: z.enum(TRANSACTION_TYPES, { error: "Invalid transaction type" }).optional(),
    accountId: z.string().min(1, { error: "Account is required" }).optional(),
    toAccountId: z.string().nullish(),
    categoryId: z.string().nullish(),
    subcategoryId: z.string().nullish(),
    amount: z
      .number()
      .positive({ error: "Amount must be a positive number" })
      .finite({ error: "Amount must be a finite number" })
      .optional(),
    notes: z.string().max(2000, { error: "Notes must be less than 2000 characters" }).nullish(),
    date: z
      .string({ error: "Invalid date format" })
      .transform(val => new Date(val))
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Cannot transfer to same account when both are being set
    if (data.accountId && data.toAccountId && data.accountId === data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cannot transfer to the same account",
        path: ["toAccountId"],
      });
    }
  });

export class UpdateTransactionDto extends createZodDto(updateTransactionSchema) {}
