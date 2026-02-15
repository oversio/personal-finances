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
    type: z.enum(RECURRING_TRANSACTION_TYPES, { message: "Please select a transaction type" }),
    accountId: z.string().min(1, { message: "Please select an account" }),
    categoryId: z.string().min(1, { message: "Please select a category" }),
    subcategoryId: z.string().optional(),
    amount: z
      .number({ message: "Amount is required" })
      .positive({ message: "Amount must be greater than 0" }),
    currency: z.enum(CURRENCIES, { message: "Please select a currency" }),
    notes: z.string().max(2000, { message: "Notes must be less than 2000 characters" }).optional(),
    frequency: z.enum(FREQUENCIES, { message: "Please select a frequency" }),
    interval: z
      .number({ message: "Interval is required" })
      .int({ message: "Interval must be a whole number" })
      .min(1, { message: "Interval must be at least 1" })
      .max(365, { message: "Interval must be at most 365" }),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    dayOfMonth: z.number().int().min(1).max(31).optional(),
    monthOfYear: z.number().int().min(1).max(12).optional(),
    startDate: z.date({ message: "Please select a start date" }),
    endDate: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    // Weekly requires dayOfWeek
    if (data.frequency === "weekly" && data.dayOfWeek === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a day of week",
        path: ["dayOfWeek"],
      });
    }

    // Monthly requires dayOfMonth
    if (data.frequency === "monthly" && data.dayOfMonth === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a day of month",
        path: ["dayOfMonth"],
      });
    }

    // Yearly requires dayOfMonth and monthOfYear
    if (data.frequency === "yearly") {
      if (data.dayOfMonth === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a day of month",
          path: ["dayOfMonth"],
        });
      }
      if (data.monthOfYear === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a month",
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

export type CreateRecurringTransactionFormData = z.infer<typeof createRecurringTransactionSchema>;

export const RECURRING_TRANSACTION_TYPE_LABELS: Record<
  (typeof RECURRING_TRANSACTION_TYPES)[number],
  string
> = {
  income: "Income",
  expense: "Expense",
};

export const RECURRING_TRANSACTION_TYPE_COLORS: Record<
  (typeof RECURRING_TRANSACTION_TYPES)[number],
  string
> = {
  income: "text-success",
  expense: "text-danger",
};

export const FREQUENCY_LABELS: Record<(typeof FREQUENCIES)[number], string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const MONTH_LABELS: Record<number, string> = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};
