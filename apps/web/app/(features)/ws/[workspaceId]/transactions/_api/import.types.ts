import { z } from "zod";

export const CategoryToCreateSchema = z.object({
  name: z.string(),
  type: z.enum(["income", "expense"]),
  subcategories: z.array(z.string()),
});

export type CategoryToCreate = z.infer<typeof CategoryToCreateSchema>;

export const CreatedCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  subcategoriesCreated: z.array(z.string()),
});

export type CreatedCategory = z.infer<typeof CreatedCategorySchema>;

export const ImportRowDataSchema = z.object({
  type: z.string(),
  accountName: z.string(),
  toAccountName: z.string().optional(),
  categoryName: z.string().optional(),
  subcategoryName: z.string().optional(),
  amount: z.number(),
  currency: z.string(),
  notes: z.string().optional(),
  date: z.string(),
});

export type ImportRowData = z.infer<typeof ImportRowDataSchema>;

export const ImportRowErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string(),
});

export type ImportRowError = z.infer<typeof ImportRowErrorSchema>;

export const ImportRowSchema = z.object({
  rowNumber: z.number(),
  status: z.enum(["valid", "invalid", "warning"]),
  data: ImportRowDataSchema,
  resolvedIds: z.object({
    accountId: z.string().optional(),
    toAccountId: z.string().optional(),
    categoryId: z.string().optional(),
    subcategoryId: z.string().optional(),
  }),
  errors: z.array(ImportRowErrorSchema),
});

export type ImportRow = z.infer<typeof ImportRowSchema>;

export const ImportSummarySchema = z.object({
  total: z.number(),
  valid: z.number(),
  invalid: z.number(),
  warnings: z.number(),
});

export type ImportSummary = z.infer<typeof ImportSummarySchema>;

export const PreviewImportResponseSchema = z.object({
  sessionId: z.string(),
  rows: z.array(ImportRowSchema),
  summary: ImportSummarySchema,
  categoriesToCreate: z.array(CategoryToCreateSchema),
});

export type PreviewImportResponse = z.infer<typeof PreviewImportResponseSchema>;

export const ImportedTransactionSchema = z.object({
  id: z.string(),
  rowNumber: z.number(),
});

export type ImportedTransaction = z.infer<typeof ImportedTransactionSchema>;

export const ConfirmImportResponseSchema = z.object({
  imported: z.number(),
  skipped: z.number(),
  transactions: z.array(ImportedTransactionSchema),
  createdCategories: z.array(CreatedCategorySchema),
});

export type ConfirmImportResponse = z.infer<typeof ConfirmImportResponseSchema>;

export interface ConfirmImportInput {
  sessionId: string;
  skipInvalid: boolean;
  createMissingCategories: boolean;
}
