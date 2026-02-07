import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const updateSubcategorySchema = z.object({
  name: z
    .string()
    .min(1, { error: "Subcategory name is required" })
    .max(50, { error: "Subcategory name must be less than 50 characters" })
    .optional(),
  icon: z.string().max(50).nullish(),
});

export class UpdateSubcategoryDto extends createZodDto(updateSubcategorySchema) {}
