import { z } from "zod";

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

export const generalSettingsSchema = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre del espacio de trabajo es requerido" })
    .max(100, { message: "El nombre debe tener menos de 100 caracteres" }),
  currency: z.enum(CURRENCIES, { message: "Selecciona una moneda" }),
  timezone: z
    .string()
    .max(100, { message: "La zona horaria debe tener menos de 100 caracteres" })
    .optional(),
});

export type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

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

export const COMMON_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "America/Buenos_Aires",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

export const TIMEZONE_LABELS: Record<(typeof COMMON_TIMEZONES)[number], string> = {
  "America/New_York": "New York (EST/EDT)",
  "America/Chicago": "Chicago (CST/CDT)",
  "America/Denver": "Denver (MST/MDT)",
  "America/Los_Angeles": "Los Angeles (PST/PDT)",
  "America/Mexico_City": "Mexico City (CST)",
  "America/Bogota": "Bogota (COT)",
  "America/Lima": "Lima (PET)",
  "America/Santiago": "Santiago (CLT/CLST)",
  "America/Buenos_Aires": "Buenos Aires (ART)",
  "America/Sao_Paulo": "Sao Paulo (BRT)",
  "Europe/London": "London (GMT/BST)",
  "Europe/Paris": "Paris (CET/CEST)",
  "Europe/Berlin": "Berlin (CET/CEST)",
  "Europe/Madrid": "Madrid (CET/CEST)",
  "Asia/Tokyo": "Tokyo (JST)",
  "Asia/Shanghai": "Shanghai (CST)",
  "Asia/Singapore": "Singapore (SGT)",
  "Australia/Sydney": "Sydney (AEST/AEDT)",
  "Pacific/Auckland": "Auckland (NZST/NZDT)",
};
