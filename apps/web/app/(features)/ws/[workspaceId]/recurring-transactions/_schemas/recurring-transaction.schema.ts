import { z } from "zod";

export const RECURRING_TRANSACTION_TYPES = ["income", "expense"] as const;
export const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"] as const;

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

export const createRecurringTransactionSchema = z
  .object({
    type: z.enum(RECURRING_TRANSACTION_TYPES, { message: "Selecciona un tipo de transacción" }),
    accountId: z.string().min(1, { message: "Selecciona una cuenta" }),
    categoryId: z.string().min(1, { message: "Selecciona una categoría" }),
    subcategoryId: z.string().optional(),
    amount: z
      .number({ message: "El monto es requerido" })
      .positive({ message: "El monto debe ser mayor a 0" }),
    currency: z.enum(CURRENCIES, { message: "Selecciona una moneda" }),
    notes: z
      .string()
      .max(2000, { message: "Las notas deben tener menos de 2000 caracteres" })
      .optional(),
    frequency: z.enum(FREQUENCIES, { message: "Selecciona una frecuencia" }),
    interval: z
      .number({ message: "El intervalo es requerido" })
      .int({ message: "El intervalo debe ser un número entero" })
      .min(1, { message: "El intervalo debe ser al menos 1" })
      .max(365, { message: "El intervalo debe ser como máximo 365" }),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    dayOfMonth: z.number().int().min(1).max(31).optional(),
    monthOfYear: z.number().int().min(1).max(12).optional(),
    startDate: z.date({ message: "Selecciona una fecha de inicio" }),
    endDate: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    // Weekly requires dayOfWeek
    if (data.frequency === "weekly" && data.dayOfWeek === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona un día de la semana",
        path: ["dayOfWeek"],
      });
    }

    // Monthly requires dayOfMonth
    if (data.frequency === "monthly" && data.dayOfMonth === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selecciona un día del mes",
        path: ["dayOfMonth"],
      });
    }

    // Yearly requires dayOfMonth and monthOfYear
    if (data.frequency === "yearly") {
      if (data.dayOfMonth === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selecciona un día del mes",
          path: ["dayOfMonth"],
        });
      }
      if (data.monthOfYear === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selecciona un mes",
          path: ["monthOfYear"],
        });
      }
    }

    // End date must be after start date
    if (data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de fin debe ser posterior a la fecha de inicio",
        path: ["endDate"],
      });
    }
  });

export type CreateRecurringTransactionFormData = z.infer<typeof createRecurringTransactionSchema>;

export const RECURRING_TRANSACTION_TYPE_LABELS: Record<
  (typeof RECURRING_TRANSACTION_TYPES)[number],
  string
> = {
  income: "Ingreso",
  expense: "Gasto",
};

export const RECURRING_TRANSACTION_TYPE_COLORS: Record<
  (typeof RECURRING_TRANSACTION_TYPES)[number],
  string
> = {
  income: "text-success",
  expense: "text-danger",
};

export const FREQUENCY_LABELS: Record<(typeof FREQUENCIES)[number], string> = {
  daily: "Diario",
  weekly: "Semanal",
  monthly: "Mensual",
  yearly: "Anual",
};

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

export const MONTH_LABELS: Record<number, string> = {
  1: "Enero",
  2: "Febrero",
  3: "Marzo",
  4: "Abril",
  5: "Mayo",
  6: "Junio",
  7: "Julio",
  8: "Agosto",
  9: "Septiembre",
  10: "Octubre",
  11: "Noviembre",
  12: "Diciembre",
};
