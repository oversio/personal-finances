import { z } from "zod";

const ACCOUNT_TYPES = ["checking", "savings", "credit_card", "cash", "investment"] as const;

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

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export const createAccountSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Account name is required" })
    .max(100, { message: "Account name must be less than 100 characters" }),
  type: z.enum(ACCOUNT_TYPES, { message: "Please select an account type" }),
  currency: z.enum(CURRENCIES, { message: "Please select a currency" }),
  initialBalance: z.number().finite({ message: "Initial balance must be a valid number" }),
  color: z.string().regex(HEX_COLOR_REGEX, { message: "Invalid color format" }),
  icon: z.string().max(50).optional(),
});

export type CreateAccountFormData = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Account name is required" })
    .max(100, { message: "Account name must be less than 100 characters" })
    .optional(),
  type: z.enum(ACCOUNT_TYPES, { message: "Please select an account type" }).optional(),
  color: z.string().regex(HEX_COLOR_REGEX, { message: "Invalid color format" }).optional(),
  icon: z.string().max(50).nullish(),
});

export type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;

export const ACCOUNT_TYPE_LABELS: Record<(typeof ACCOUNT_TYPES)[number], string> = {
  checking: "Checking",
  savings: "Savings",
  credit_card: "Credit Card",
  cash: "Cash",
  investment: "Investment",
};

export const CURRENCY_LABELS: Record<(typeof CURRENCIES)[number], string> = {
  USD: "USD - US Dollar",
  EUR: "EUR - Euro",
  GBP: "GBP - British Pound",
  MXN: "MXN - Mexican Peso",
  CAD: "CAD - Canadian Dollar",
  AUD: "AUD - Australian Dollar",
  JPY: "JPY - Japanese Yen",
  CNY: "CNY - Chinese Yuan",
  BRL: "BRL - Brazilian Real",
  ARS: "ARS - Argentine Peso",
  CLP: "CLP - Chilean Peso",
  COP: "COP - Colombian Peso",
  PEN: "PEN - Peruvian Sol",
};

export const DEFAULT_COLORS = [
  "#6366F1", // Indigo
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#EF4444", // Red
  "#F97316", // Orange
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#14B8A6", // Teal
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
];
