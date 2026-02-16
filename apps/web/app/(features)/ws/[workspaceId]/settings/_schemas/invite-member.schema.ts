import { z } from "zod";

const ASSIGNABLE_ROLES = ["admin", "member"] as const;

export const inviteMemberSchema = z.object({
  email: z.email({ message: "Ingresa un correo electrónico válido" }),
  role: z.enum(ASSIGNABLE_ROLES, { message: "Selecciona un rol" }),
});

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

export const ROLE_LABELS: Record<(typeof ASSIGNABLE_ROLES)[number], string> = {
  admin: "Administrador",
  member: "Miembro",
};

export const ROLE_DESCRIPTIONS: Record<(typeof ASSIGNABLE_ROLES)[number], string> = {
  admin: "Puede gestionar configuración y miembros",
  member: "Puede ver y editar datos",
};
