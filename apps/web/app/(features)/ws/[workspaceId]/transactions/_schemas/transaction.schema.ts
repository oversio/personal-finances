import { z } from "zod";

export const TRANSACTION_TYPES = ["income", "expense", "transfer"] as const;

export const CURRENCIES = [
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

export const createTransactionSchema = z
  .object({
    type: z.enum(TRANSACTION_TYPES, { message: "Please select a transaction type" }),
    accountId: z.string().min(1, { message: "Please select an account" }),
    toAccountId: z.string().optional(),
    categoryId: z.string().optional(),
    subcategoryId: z.string().optional(),
    amount: z
      .number({ message: "Amount is required" })
      .positive({ message: "Amount must be greater than 0" }),
    currency: z.enum(CURRENCIES, { message: "Please select a currency" }),
    notes: z.string().max(2000, { message: "Notes must be less than 2000 characters" }).optional(),
    date: z.date({ message: "Please select a date" }),
  })
  .superRefine((data, ctx) => {
    // Transfer requires toAccountId
    if (data.type === "transfer" && !data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a destination account for the transfer",
        path: ["toAccountId"],
      });
    }

    // Income/expense require categoryId
    if ((data.type === "income" || data.type === "expense") && !data.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a category",
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

export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = z
  .object({
    type: z.enum(TRANSACTION_TYPES, { message: "Please select a transaction type" }).optional(),
    accountId: z.string().min(1, { message: "Please select an account" }).optional(),
    toAccountId: z.string().nullish(),
    categoryId: z.string().nullish(),
    subcategoryId: z.string().nullish(),
    amount: z.number().positive({ message: "Amount must be greater than 0" }).optional(),
    notes: z.string().max(2000, { message: "Notes must be less than 2000 characters" }).nullish(),
    date: z.date({ message: "Please select a date" }).optional(),
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

export type UpdateTransactionFormData = z.infer<typeof updateTransactionSchema>;

export const TRANSACTION_TYPE_LABELS: Record<(typeof TRANSACTION_TYPES)[number], string> = {
  income: "Income",
  expense: "Expense",
  transfer: "Transfer",
};

export const TRANSACTION_TYPE_COLORS: Record<(typeof TRANSACTION_TYPES)[number], string> = {
  income: "text-success",
  expense: "text-danger",
  transfer: "text-primary",
};
