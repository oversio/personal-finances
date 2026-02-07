import { createZodDto } from "nestjs-zod";
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

const createAccountSchema = z.object({
  name: z
    .string()
    .min(1, { error: "Account name is required" })
    .max(100, { error: "Account name must be less than 100 characters" }),
  type: z.enum(ACCOUNT_TYPES, { error: "Invalid account type" }),
  currency: z.enum(CURRENCIES, { error: "Invalid currency code" }),
  initialBalance: z.number().finite({ error: "Initial balance must be a finite number" }),
  color: z
    .string()
    .regex(HEX_COLOR_REGEX, { error: "Invalid hex color format. Use #RRGGBB" })
    .optional(),
  icon: z.string().max(50).optional(),
});

export class CreateAccountDto extends createZodDto(createAccountSchema) {}
