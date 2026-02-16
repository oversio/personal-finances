import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Por favor ingresa un correo electrónico válido" }),
  password: z.string().min(1, { message: "La contraseña es requerida" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
