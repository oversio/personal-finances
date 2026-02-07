import { z } from "zod";

export const CATEGORY_TYPES = ["income", "expense"] as const;

export const CategoryTypeSchema = z.enum(CATEGORY_TYPES);
export type CategoryType = z.infer<typeof CategoryTypeSchema>;

export const SubcategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable().optional(),
});

export type Subcategory = z.infer<typeof SubcategorySchema>;

export const CategorySchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  type: CategoryTypeSchema,
  subcategories: z.array(SubcategorySchema),
  icon: z.string().nullable().optional(),
  color: z.string(),
  isArchived: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Category = z.infer<typeof CategorySchema>;

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  subcategories?: Array<{ name: string; icon?: string }>;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  type?: CategoryType;
  icon?: string | null;
  color?: string;
}

export interface AddSubcategoryInput {
  name: string;
  icon?: string;
}

export interface UpdateSubcategoryInput {
  name?: string;
  icon?: string | null;
}
