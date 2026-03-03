import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const confirmImportSchema = z.object({
  sessionId: z.string().min(1, { error: "El ID de sesión es requerido" }),
  skipInvalid: z.boolean({
    error: "Debe indicar si desea omitir las filas inválidas",
  }),
  createMissingCategories: z.boolean().default(false),
});

export class ConfirmImportDto extends createZodDto(confirmImportSchema) {}
