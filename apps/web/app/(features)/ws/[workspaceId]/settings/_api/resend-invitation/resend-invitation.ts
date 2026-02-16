import { fetcher } from "@/_commons/api";
import { SendInvitationResultSchema, type SendInvitationResult } from "../settings.types";

export interface ResendInvitationParams {
  workspaceId: string;
  invitationId: string;
}

export async function resendInvitation({
  workspaceId,
  invitationId,
}: ResendInvitationParams): Promise<SendInvitationResult> {
  return fetcher(`/ws/${workspaceId}/invitations/${invitationId}/resend`, {
    method: "POST",
    schema: SendInvitationResultSchema,
  });
}
