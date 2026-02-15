import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const RECURRING_TRANSACTION_TYPES = ["income", "expense"] as const;
const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"] as const;

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

const createRecurringTransactionSchema = z
  .object({
    type: z.enum(RECURRING_TRANSACTION_TYPES, { error: "Type must be income or expense" }),
    accountId: z.string().min(1, { error: "Account is required" }),
    categoryId: z.string().min(1, { error: "Category is required" }),
    subcategoryId: z.string().optional(),
    amount: z
      .number()
      .positive({ error: "Amount must be a positive number" })
      .finite({ error: "Amount must be a finite number" }),
    currency: z.enum(CURRENCIES, { error: "Invalid currency code" }),
    notes: z.string().max(2000, { error: "Notes must be less than 2000 characters" }).optional(),
    frequency: z.enum(FREQUENCIES, {
      error: "Frequency must be daily, weekly, monthly, or yearly",
    }),
    interval: z
      .number()
      .int({ error: "Interval must be a whole number" })
      .min(1, { error: "Interval must be at least 1" })
      .max(365, { error: "Interval must be at most 365" }),
    dayOfWeek: z
      .number()
      .int()
      .min(0, { error: "Day of week must be between 0 (Sunday) and 6 (Saturday)" })
      .max(6, { error: "Day of week must be between 0 (Sunday) and 6 (Saturday)" })
      .optional(),
    dayOfMonth: z
      .number()
      .int()
      .min(1, { error: "Day of month must be between 1 and 31" })
      .max(31, { error: "Day of month must be between 1 and 31" })
      .optional(),
    monthOfYear: z
      .number()
      .int()
      .min(1, { error: "Month must be between 1 (January) and 12 (December)" })
      .max(12, { error: "Month must be between 1 (January) and 12 (December)" })
      .optional(),
    startDate: z.string({ error: "Invalid date format" }).transform(val => new Date(val)),
    endDate: z
      .string({ error: "Invalid date format" })
      .transform(val => new Date(val))
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Weekly requires dayOfWeek
    if (data.frequency === "weekly" && data.dayOfWeek === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Weekly frequency requires dayOfWeek",
        path: ["dayOfWeek"],
      });
    }

    // Monthly requires dayOfMonth
    if (data.frequency === "monthly" && data.dayOfMonth === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Monthly frequency requires dayOfMonth",
        path: ["dayOfMonth"],
      });
    }

    // Yearly requires dayOfMonth and monthOfYear
    if (data.frequency === "yearly") {
      if (data.dayOfMonth === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Yearly frequency requires dayOfMonth",
          path: ["dayOfMonth"],
        });
      }
      if (data.monthOfYear === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Yearly frequency requires monthOfYear",
          path: ["monthOfYear"],
        });
      }
    }

    // End date must be after start date
    if (data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ["endDate"],
      });
    }
  });

export class CreateRecurringTransactionDto extends createZodDto(createRecurringTransactionSchema) {}
