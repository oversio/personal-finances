import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(100, { message: "El nombre debe tener menos de 100 caracteres" }),
  email: z.email({ message: "Por favor ingresa un correo electrónico válido" }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .regex(/[A-Z]/, { message: "La contraseña debe contener una mayúscula" })
    .regex(/[a-z]/, { message: "La contraseña debe contener una minúscula" })
    .regex(/[0-9]/, { message: "La contraseña debe contener un número" }),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
