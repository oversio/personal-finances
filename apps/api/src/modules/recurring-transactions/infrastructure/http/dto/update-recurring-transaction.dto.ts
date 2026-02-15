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
    interval: intervalSchema.optional(),
    dayOfWeek: dayOfWeekSchema.nullable().optional(),
    dayOfMonth: dayOfMonthSchema.nullable().optional(),
    monthOfYear: monthOfYearSchema.nullable().optional(),
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
