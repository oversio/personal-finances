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
    .min(1, { message: "Workspace name is required" })
    .max(100, { message: "Workspace name must be less than 100 characters" }),
  currency: z.enum(CURRENCIES, { message: "Please select a currency" }),
  timezone: z
    .string()
    .max(100, { message: "Timezone must be less than 100 characters" })
    .optional(),
});

export type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

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
