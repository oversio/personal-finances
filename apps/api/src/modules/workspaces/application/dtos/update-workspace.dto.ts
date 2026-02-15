import { createZodDto } from "nestjs-zod";
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

const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, { error: "Workspace name is required" })
    .max(100, { error: "Workspace name must be less than 100 characters" })
    .optional(),
  currency: z.enum(CURRENCIES, { error: "Invalid currency" }).optional(),
  timezone: z.string().max(100, { error: "Timezone must be less than 100 characters" }).optional(),
});

export class UpdateWorkspaceDto extends createZodDto(updateWorkspaceSchema) {}
