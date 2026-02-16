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
    type: z.enum(TRANSACTION_TYPES, { message: "Selecciona un tipo de transacción" }),
    accountId: z.string().min(1, { message: "Selecciona una cuenta" }),
    toAccountId: z.string().optional(),
    categoryId: z.string().optional(),
    subcategoryId: z.string().optional(),
    amount: z
      .number({ message: "El monto es requerido" })
      .positive({ message: "El monto debe ser mayor a 0" }),
    currency: z.enum(CURRENCIES, { message: "Selecciona una moneda" }),
    notes: z.string().max(2000, { message: "Las notas deben tener menos de 2000 caracteres" }).optional(),
    date: z.date({ message: "Selecciona una fecha" }),
  })
  .superRefine((data, ctx) => {
    // Transfer requires toAccountId
    if (data.type === "transfer" && !data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona una cuenta de destino para la transferencia",
        path: ["toAccountId"],
      });
    }

    // Income/expense require categoryId
    if ((data.type === "income" || data.type === "expense") && !data.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona una categoría",
        path: ["categoryId"],
      });
    }

    // Cannot transfer to same account
    if (data.type === "transfer" && data.accountId === data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No se puede transferir a la misma cuenta",
        path: ["toAccountId"],
      });
    }
  });

export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = z
  .object({
    type: z.enum(TRANSACTION_TYPES, { message: "Selecciona un tipo de transacción" }).optional(),
    accountId: z.string().min(1, { message: "Selecciona una cuenta" }).optional(),
    toAccountId: z.string().nullish(),
    categoryId: z.string().nullish(),
    subcategoryId: z.string().nullish(),
    amount: z.number().positive({ message: "El monto debe ser mayor a 0" }).optional(),
    notes: z.string().max(2000, { message: "Las notas deben tener menos de 2000 caracteres" }).nullish(),
    date: z.date({ message: "Selecciona una fecha" }).optional(),
  })
  .superRefine((data, ctx) => {
    // Cannot transfer to same account when both are being set
    if (data.accountId && data.toAccountId && data.accountId === data.toAccountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No se puede transferir a la misma cuenta",
        path: ["toAccountId"],
      });
    }
  });

export type UpdateTransactionFormData = z.infer<typeof updateTransactionSchema>;

export const TRANSACTION_TYPE_LABELS: Record<(typeof TRANSACTION_TYPES)[number], string> = {
  income: "Ingreso",
  expense: "Gasto",
  transfer: "Transferencia",
};

export const TRANSACTION_TYPE_COLORS: Record<(typeof TRANSACTION_TYPES)[number], string> = {
  income: "text-success",
  expense: "text-danger",
  transfer: "text-primary",
};
