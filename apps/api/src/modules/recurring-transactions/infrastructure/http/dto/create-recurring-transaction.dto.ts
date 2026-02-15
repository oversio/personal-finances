import { createZodDto } from "nestjs-zod";
import { z } from "zod";
import {
  dayOfMonthSchema,
  dayOfWeekSchema,
  intervalSchema,
  monthOfYearSchema,
} from "../../../domain/value-objects/recurrence-schedule.schemas";

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
    interval: intervalSchema,
    dayOfWeek: dayOfWeekSchema.optional(),
    dayOfMonth: dayOfMonthSchema.optional(),
    monthOfYear: monthOfYearSchema.optional(),
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
