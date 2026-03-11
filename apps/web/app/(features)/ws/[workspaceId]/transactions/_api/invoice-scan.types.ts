import { z } from "zod";

export const InvoiceScanResultSchema = z.object({
  confidence: z.number().min(0).max(1),
  amount: z.number().nullable(),
  currency: z.string().nullable(),
  date: z.string().nullable(),
  vendor: z.string().nullable(),
  description: z.string().nullable(),
  categoryId: z.string().nullable(),
  subcategoryId: z.string().nullable(),
});

export type InvoiceScanResult = z.infer<typeof InvoiceScanResultSchema>;
