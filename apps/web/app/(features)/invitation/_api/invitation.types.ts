import { z } from "zod";

export const InvitationStatusSchema = z.enum(["pending", "expired", "accepted", "revoked"]);
export type InvitationStatus = z.infer<typeof InvitationStatusSchema>;

export const InvitationSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  workspaceName: z.string(),
  email: z.string(),
  role: z.enum(["admin", "member"]),
  invitedByName: z.string(),
  expiresAt: z.coerce.date(),
  status: InvitationStatusSchema,
});

export type Invitation = z.infer<typeof InvitationSchema>;

export const AcceptInvitationResultSchema = z.object({
  workspaceId: z.string(),
  memberId: z.string(),
  role: z.string(),
});

export type AcceptInvitationResult = z.infer<typeof AcceptInvitationResultSchema>;
