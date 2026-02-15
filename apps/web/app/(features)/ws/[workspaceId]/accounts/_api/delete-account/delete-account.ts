import { fetcher, IgnoreResponse } from "@/_commons/api";

export interface DeleteAccountParams {
  workspaceId: string;
  accountId: string;
}

export async function deleteAccount({ workspaceId, accountId }: DeleteAccountParams) {
  return fetcher(`/ws/${workspaceId}/accounts/${accountId}`, {
    method: "DELETE",
    schema: IgnoreResponse,
  });
}
