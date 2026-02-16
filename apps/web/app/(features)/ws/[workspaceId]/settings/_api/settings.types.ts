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

// Workspace Invitations

export const PendingInvitationSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.enum(["admin", "member"]),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  isExpired: z.boolean(),
});

export type PendingInvitation = z.infer<typeof PendingInvitationSchema>;

export const PendingInvitationListSchema = z.array(PendingInvitationSchema);

export const SendInvitationResultSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  email: z.string(),
  role: z.string(),
  token: z.string(),
  expiresAt: z.coerce.date(),
  invitedBy: z.string(),
  createdAt: z.coerce.date(),
  acceptedAt: z.coerce.date().nullable().optional(),
  revokedAt: z.coerce.date().nullable().optional(),
  acceptedByUserId: z.string().nullable().optional(),
});

export type SendInvitationResult = z.infer<typeof SendInvitationResultSchema>;

export interface SendInvitationInput {
  email: string;
  role?: "admin" | "member";
}
