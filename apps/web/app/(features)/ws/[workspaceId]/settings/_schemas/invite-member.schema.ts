import { z } from "zod";

const ASSIGNABLE_ROLES = ["admin", "member"] as const;

export const inviteMemberSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  role: z.enum(ASSIGNABLE_ROLES, { message: "Please select a role" }),
});

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

export const ROLE_LABELS: Record<(typeof ASSIGNABLE_ROLES)[number], string> = {
  admin: "Admin",
  member: "Member",
};

export const ROLE_DESCRIPTIONS: Record<(typeof ASSIGNABLE_ROLES)[number], string> = {
  admin: "Can manage settings and members",
  member: "Can view and edit data",
};
