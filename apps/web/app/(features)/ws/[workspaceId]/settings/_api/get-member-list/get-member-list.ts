import { fetcher, listOf } from "@/_commons/api";
import { WorkspaceMemberSchema } from "../settings.types";

export interface GetMemberListParams {
  workspaceId: string;
}

export async function getMemberList({ workspaceId }: GetMemberListParams) {
  return fetcher(`/ws/${workspaceId}/members`, {
    method: "GET",
    schema: listOf(WorkspaceMemberSchema),
  });
}
