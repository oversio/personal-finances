import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const TRANSACTION_TYPES = ["income", "expense", "transfer"] as const;

const CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "MXN",
  "CAD",
  "AUD",
  "JPY",
  "CNY",
  "BRL",
  "ARS",
  "CLP",
  "COP",
  "PEN",
] as const;

const createTransactionSchema = z
  .object({
    type: z.enum(TRANSACTION_TYPES, { error: "Invalid transaction type" }),
    accountId: z.string().min(1, { error: "Account is required" }),
    toAccountId: z.string().optional(),
    categoryId: z.string().optional(),
    subcategoryId: z.string().optional(),
    amount: z
      .number()
      .positive({ error: "Amount must be a positive number" })
      .finite({ error: "Amount must be a finite number" }),
    currency: z.enum(CURRENCIES, { error: "Invalid currency code" }),
    notes: z.string().max(2000, { error: "Notes must be less than 2000 characters" }).optional(),
    date: z.string({ error: "Invalid date format" }).transform(val => new Date(val)),
  })
  .superRefine((data, ctx) => {
    // Transfer requires toAccountId
    if (data.type === "transfer" && !data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Transfer transactions require a destination account",
        path: ["toAccountId"],
      });
    }

    // Income/expense require categoryId
    if ((data.type === "income" || data.type === "expense") && !data.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${data.type} transactions require a category`,
        path: ["categoryId"],
      });
    }

    // Cannot transfer to same account
    if (data.type === "transfer" && data.accountId === data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cannot transfer to the same account",
        path: ["toAccountId"],
      });
    }
  });

export class CreateTransactionDto extends createZodDto(createTransactionSchema) {}
