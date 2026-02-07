import { z } from "zod";

const CATEGORY_TYPES = ["income", "expense"] as const;
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export const subcategoryFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Subcategory name is required" })
    .max(50, { message: "Subcategory name must be less than 50 characters" }),
  icon: z.string().max(50).optional(),
});

export type SubcategoryFormData = z.infer<typeof subcategoryFormSchema>;

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, { message: "Category name is required" })
    .max(50, { message: "Category name must be less than 50 characters" }),
  type: z.enum(CATEGORY_TYPES, { message: "Please select a category type" }),
  color: z.string().regex(HEX_COLOR_REGEX, { message: "Invalid color format" }),
  icon: z.string().max(50).optional(),
});

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, { message: "Category name is required" })
    .max(50, { message: "Category name must be less than 50 characters" })
    .optional(),
  type: z.enum(CATEGORY_TYPES, { message: "Please select a category type" }).optional(),
  color: z.string().regex(HEX_COLOR_REGEX, { message: "Invalid color format" }).optional(),
  icon: z.string().max(50).nullish(),
});

export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;

export const CATEGORY_TYPE_LABELS: Record<(typeof CATEGORY_TYPES)[number], string> = {
  income: "Income",
  expense: "Expense",
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
