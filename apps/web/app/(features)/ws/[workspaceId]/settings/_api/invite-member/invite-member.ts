import { fetcher } from "@/_commons/api";
import { WorkspaceMemberSchema, type InviteMemberInput } from "../settings.types";

export interface InviteMemberParams {
  workspaceId: string;
  data: InviteMemberInput;
}

export async function inviteMember({ workspaceId, data }: InviteMemberParams) {
  return fetcher(`/ws/${workspaceId}/members/invite`, {
    method: "POST",
    body: data,
    schema: WorkspaceMemberSchema,
  });
}
