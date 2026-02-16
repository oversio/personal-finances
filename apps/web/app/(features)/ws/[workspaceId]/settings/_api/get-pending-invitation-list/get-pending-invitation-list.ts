import { fetcher } from "@/_commons/api";
import { PendingInvitationListSchema, type PendingInvitation } from "../settings.types";

export async function getPendingInvitationList(workspaceId: string): Promise<PendingInvitation[]> {
  return fetcher(`/ws/${workspaceId}/invitations`, {
    method: "GET",
    schema: PendingInvitationListSchema,
  });
}
