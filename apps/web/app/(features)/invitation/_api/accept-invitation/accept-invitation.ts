import { fetcher } from "@/_commons/api";
import { AcceptInvitationResultSchema, type AcceptInvitationResult } from "../invitation.types";

export async function acceptInvitation(token: string): Promise<AcceptInvitationResult> {
  return fetcher(`/invitations/${token}/accept`, {
    method: "POST",
    schema: AcceptInvitationResultSchema,
  });
}
