import { fetcher, IgnoreResponse } from "@/_commons/api";

export interface DeleteWorkspaceParams {
  workspaceId: string;
}

export async function deleteWorkspace({ workspaceId }: DeleteWorkspaceParams) {
  return fetcher(`/ws/${workspaceId}`, {
    method: "DELETE",
    schema: IgnoreResponse,
  });
}
