import { fetcher } from "@/_commons/api";
import { WorkspaceMemberSchema, type ChangeMemberRoleInput } from "../settings.types";

export interface ChangeMemberRoleParams {
  workspaceId: string;
  memberId: string;
  data: ChangeMemberRoleInput;
}

export async function changeMemberRole({ workspaceId, memberId, data }: ChangeMemberRoleParams) {
  return fetcher(`/ws/${workspaceId}/members/${memberId}/role`, {
    method: "PUT",
    body: data,
    schema: WorkspaceMemberSchema,
  });
}
