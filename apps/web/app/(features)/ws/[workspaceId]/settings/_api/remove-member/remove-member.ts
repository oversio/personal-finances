import { fetcher, IgnoreResponse } from "@/_commons/api";

export interface RemoveMemberParams {
  workspaceId: string;
  memberId: string;
}

export async function removeMember({ workspaceId, memberId }: RemoveMemberParams) {
  return fetcher(`/ws/${workspaceId}/members/${memberId}`, {
    method: "DELETE",
    schema: IgnoreResponse,
  });
}
