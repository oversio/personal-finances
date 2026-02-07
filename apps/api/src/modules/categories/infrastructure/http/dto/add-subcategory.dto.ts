import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const addSubcategorySchema = z.object({
  name: z
    .string()
    .min(1, { error: "Subcategory name is required" })
    .max(50, { error: "Subcategory name must be less than 50 characters" }),
  icon: z.string().max(50).optional(),
});

export class AddSubcategoryDto extends createZodDto(addSubcategorySchema) {}
