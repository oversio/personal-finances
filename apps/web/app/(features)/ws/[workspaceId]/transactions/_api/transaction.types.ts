import { z } from "zod";

export const TRANSACTION_TYPES = ["income", "expense", "transfer"] as const;

export const TransactionTypeSchema = z.enum(TRANSACTION_TYPES);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const TransactionSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  type: TransactionTypeSchema,
  accountId: z.string(),
  toAccountId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  subcategoryId: z.string().nullable().optional(),
  amount: z.number(),
  currency: z.string(),
  notes: z.string().nullable().optional(),
  date: z.coerce.date(),
  createdBy: z.string(),
  isArchived: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export interface CreateTransactionInput {
  type: TransactionType;
  accountId: string;
  toAccountId?: string;
  categoryId?: string;
  subcategoryId?: string;
  amount: number;
  currency: string;
  notes?: string;
  date: Date;
}

export interface UpdateTransactionInput {
  type?: TransactionType;
  accountId?: string;
  toAccountId?: string | null;
  categoryId?: string | null;
  subcategoryId?: string | null;
  amount?: number;
  notes?: string | null;
  date?: Date;
}

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  startDate?: Date;
  endDate?: Date;
  includeArchived?: boolean;
}
