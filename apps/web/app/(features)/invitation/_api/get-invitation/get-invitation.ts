import { fetcher } from "@/_commons/api";
import { InvitationSchema, type Invitation } from "../invitation.types";

export async function getInvitation(token: string): Promise<Invitation> {
  return fetcher(`/invitations/${token}`, {
    method: "GET",
    schema: InvitationSchema,
  });
}
