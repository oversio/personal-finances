import { z } from "zod";

export const RECURRING_TRANSACTION_TYPES = ["income", "expense"] as const;
export const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"] as const;

export const RecurringTransactionTypeSchema = z.enum(RECURRING_TRANSACTION_TYPES);
export type RecurringTransactionType = z.infer<typeof RecurringTransactionTypeSchema>;

export const FrequencySchema = z.enum(FREQUENCIES);
export type Frequency = z.infer<typeof FrequencySchema>;

export const RecurrenceScheduleSchema = z.object({
  frequency: FrequencySchema,
  interval: z.number(),
  dayOfWeek: z.number().nullable().optional(),
  dayOfMonth: z.number().nullable().optional(),
  monthOfYear: z.number().nullable().optional(),
});

export type RecurrenceSchedule = z.infer<typeof RecurrenceScheduleSchema>;

export const RecurringTransactionSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  type: RecurringTransactionTypeSchema,
  accountId: z.string(),
  categoryId: z.string(),
  subcategoryId: z.string().nullable().optional(),
  amount: z.number(),
  currency: z.string(),
  notes: z.string().nullable().optional(),
  schedule: RecurrenceScheduleSchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
  nextRunDate: z.coerce.date(),
  lastRunDate: z.coerce.date().nullable().optional(),
  isActive: z.boolean(),
  isArchived: z.boolean(),
  createdBy: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type RecurringTransaction = z.infer<typeof RecurringTransactionSchema>;

export interface CreateRecurringTransactionInput {
  type: RecurringTransactionType;
  accountId: string;
  categoryId: string;
  subcategoryId?: string;
  amount: number;
  currency: string;
  notes?: string;
  frequency: Frequency;
  interval: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  monthOfYear?: number;
  startDate: Date;
  endDate?: Date;
}

export interface UpdateRecurringTransactionInput {
  type?: RecurringTransactionType;
  accountId?: string;
  categoryId?: string;
  subcategoryId?: string | null;
  amount?: number;
  notes?: string | null;
  frequency?: Frequency;
  interval?: number;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  monthOfYear?: number | null;
  startDate?: Date;
  endDate?: Date | null;
}

export interface RecurringTransactionFilters {
  type?: RecurringTransactionType;
  categoryId?: string;
  accountId?: string;
  isActive?: boolean;
  includeArchived?: boolean;
}

export const ProcessRecurringTransactionsResultSchema = z.object({
  processed: z.number(),
  transactions: z.array(RecurringTransactionSchema),
});

export type ProcessRecurringTransactionsResult = z.infer<
  typeof ProcessRecurringTransactionsResultSchema
>;
