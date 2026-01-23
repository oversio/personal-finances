import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const logoutSchema = z.object({
  refreshToken: z.string().min(1),
  logoutAll: z.boolean().optional().default(false),
});

export class LogoutDto extends createZodDto(logoutSchema) {}
