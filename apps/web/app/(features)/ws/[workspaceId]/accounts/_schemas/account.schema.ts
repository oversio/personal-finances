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
    .min(1, { message: "El nombre de la cuenta es requerido" })
    .max(100, { message: "El nombre debe tener menos de 100 caracteres" }),
  type: z.enum(ACCOUNT_TYPES, { message: "Selecciona un tipo de cuenta" }),
  currency: z.enum(CURRENCIES, { message: "Selecciona una moneda" }),
  initialBalance: z.number().finite({ message: "El saldo inicial debe ser un número válido" }),
  color: z.string().regex(HEX_COLOR_REGEX, { message: "Formato de color inválido" }),
  icon: z.string().max(50).optional(),
});

export type CreateAccountFormData = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre de la cuenta es requerido" })
    .max(100, { message: "El nombre debe tener menos de 100 caracteres" })
    .optional(),
  type: z.enum(ACCOUNT_TYPES, { message: "Selecciona un tipo de cuenta" }).optional(),
  color: z.string().regex(HEX_COLOR_REGEX, { message: "Formato de color inválido" }).optional(),
  icon: z.string().max(50).nullish(),
});

export type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;

export const ACCOUNT_TYPE_LABELS: Record<(typeof ACCOUNT_TYPES)[number], string> = {
  checking: "Cuenta Corriente",
  savings: "Ahorros",
  credit_card: "Tarjeta de Crédito",
  cash: "Efectivo",
  investment: "Inversión",
};

export const CURRENCY_LABELS: Record<(typeof CURRENCIES)[number], string> = {
  USD: "USD - Dólar Estadounidense",
  EUR: "EUR - Euro",
  GBP: "GBP - Libra Esterlina",
  MXN: "MXN - Peso Mexicano",
  CAD: "CAD - Dólar Canadiense",
  AUD: "AUD - Dólar Australiano",
  JPY: "JPY - Yen Japonés",
  CNY: "CNY - Yuan Chino",
  BRL: "BRL - Real Brasileño",
  ARS: "ARS - Peso Argentino",
  CLP: "CLP - Peso Chileno",
  COP: "COP - Peso Colombiano",
  PEN: "PEN - Sol Peruano",
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
