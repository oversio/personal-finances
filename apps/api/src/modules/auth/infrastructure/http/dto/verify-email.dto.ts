import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const verifyEmailSchema = z.object({
  token: z.string().min(1, { error: "Verification token is required" }),
});

export class VerifyEmailDto extends createZodDto(verifyEmailSchema) {}
