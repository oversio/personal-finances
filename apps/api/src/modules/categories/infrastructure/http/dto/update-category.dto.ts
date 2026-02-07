import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const CATEGORY_TYPES = ["income", "expense"] as const;
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, { error: "Category name is required" })
    .max(50, { error: "Category name must be less than 50 characters" })
    .optional(),
  type: z.enum(CATEGORY_TYPES, { error: "Invalid category type" }).optional(),
  icon: z.string().max(50).nullish(),
  color: z
    .string()
    .regex(HEX_COLOR_REGEX, { error: "Invalid hex color format. Use #RRGGBB" })
    .optional(),
});

export class UpdateCategoryDto extends createZodDto(updateCategorySchema) {}
