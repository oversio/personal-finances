import { fetcher } from "@/_commons/api";

export interface RevokeInvitationParams {
  workspaceId: string;
  invitationId: string;
}

export async function revokeInvitation({
  workspaceId,
  invitationId,
}: RevokeInvitationParams): Promise<void> {
  await fetcher(`/ws/${workspaceId}/invitations/${invitationId}`, {
    method: "DELETE",
  });
}
