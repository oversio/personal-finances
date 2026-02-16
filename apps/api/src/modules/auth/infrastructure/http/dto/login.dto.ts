import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  recaptchaToken: z.string().min(1).optional(),
});

export class LoginDto extends createZodDto(loginSchema) {}
