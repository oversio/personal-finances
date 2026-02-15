import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const RECURRING_TRANSACTION_TYPES = ["income", "expense"] as const;
const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"] as const;

const updateRecurringTransactionSchema = z
  .object({
    type: z
      .enum(RECURRING_TRANSACTION_TYPES, { error: "Type must be income or expense" })
      .optional(),
    accountId: z.string().min(1, { error: "Account is required" }).optional(),
    categoryId: z.string().min(1, { error: "Category is required" }).optional(),
    subcategoryId: z.string().nullable().optional(),
    amount: z
      .number()
      .positive({ error: "Amount must be a positive number" })
      .finite({ error: "Amount must be a finite number" })
      .optional(),
    notes: z
      .string()
      .max(2000, { error: "Notes must be less than 2000 characters" })
      .nullable()
      .optional(),
    frequency: z
      .enum(FREQUENCIES, { error: "Frequency must be daily, weekly, monthly, or yearly" })
      .optional(),
    interval: z
      .number()
      .int({ error: "Interval must be a whole number" })
      .min(1, { error: "Interval must be at least 1" })
      .max(365, { error: "Interval must be at most 365" })
      .optional(),
    dayOfWeek: z
      .number()
      .int()
      .min(0, { error: "Day of week must be between 0 (Sunday) and 6 (Saturday)" })
      .max(6, { error: "Day of week must be between 0 (Sunday) and 6 (Saturday)" })
      .nullable()
      .optional(),
    dayOfMonth: z
      .number()
      .int()
      .min(1, { error: "Day of month must be between 1 and 31" })
      .max(31, { error: "Day of month must be between 1 and 31" })
      .nullable()
      .optional(),
    monthOfYear: z
      .number()
      .int()
      .min(1, { error: "Month must be between 1 (January) and 12 (December)" })
      .max(12, { error: "Month must be between 1 (January) and 12 (December)" })
      .nullable()
      .optional(),
    startDate: z
      .string({ error: "Invalid date format" })
      .transform(val => new Date(val))
      .optional(),
    endDate: z
      .string({ error: "Invalid date format" })
      .transform(val => new Date(val))
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    // When frequency is being set to weekly, dayOfWeek must be provided
    if (data.frequency === "weekly" && data.dayOfWeek === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Weekly frequency requires dayOfWeek",
        path: ["dayOfWeek"],
      });
    }

    // When frequency is being set to monthly, dayOfMonth must be provided
    if (data.frequency === "monthly" && data.dayOfMonth === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Monthly frequency requires dayOfMonth",
        path: ["dayOfMonth"],
      });
    }

    // When frequency is being set to yearly, both dayOfMonth and monthOfYear must be provided
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
  });

export class UpdateRecurringTransactionDto extends createZodDto(updateRecurringTransactionSchema) {}
