import { z } from "zod";

export const MEMBER_ROLES = ["owner", "admin", "member"] as const;
export const ASSIGNABLE_ROLES = ["admin", "member"] as const;

export const MemberRoleSchema = z.enum(MEMBER_ROLES);
export type MemberRole = z.infer<typeof MemberRoleSchema>;

export const WorkspaceSettingsSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
  currency: z.string(),
  timezone: z.string().nullable().optional(),
  isDefault: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  currentUserRole: MemberRoleSchema,
});

export type WorkspaceSettings = z.infer<typeof WorkspaceSettingsSchema>;

export const WorkspaceMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
  email: z.string(),
  name: z.string(),
  picture: z.string().nullable().optional(),
  role: MemberRoleSchema,
  invitedAt: z.coerce.date(),
  joinedAt: z.coerce.date().nullable().optional(),
  isActive: z.boolean(),
});

export type WorkspaceMember = z.infer<typeof WorkspaceMemberSchema>;

export interface UpdateWorkspaceSettingsInput {
  name?: string;
  currency?: string;
  timezone?: string;
}

export interface InviteMemberInput {
  email: string;
  role?: "admin" | "member";
}

export interface ChangeMemberRoleInput {
  role: "admin" | "member";
}
