import { z } from "zod";

export const ACCOUNT_TYPES = ["checking", "savings", "credit_card", "cash", "investment"] as const;

export const AccountTypeSchema = z.enum(ACCOUNT_TYPES);
export type AccountType = z.infer<typeof AccountTypeSchema>;

export const AccountSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  type: AccountTypeSchema,
  currency: z.string(),
  initialBalance: z.number(),
  currentBalance: z.number(),
  color: z.string(),
  icon: z.string().nullable().optional(),
  isArchived: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Account = z.infer<typeof AccountSchema>;

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  currency: string;
  initialBalance: number;
  color?: string;
  icon?: string;
}

export interface UpdateAccountInput {
  name?: string;
  type?: AccountType;
  color?: string;
  icon?: string | null;
}
