import { fetcher, listOf } from "@/_commons/api";
import { AccountSchema } from "../account.types";

export interface GetAccountListParams {
  workspaceId: string;
  includeArchived?: boolean;
}

export async function getAccountList({ workspaceId, includeArchived }: GetAccountListParams) {
  return fetcher(`/ws/${workspaceId}/accounts`, {
    method: "GET",
    params: includeArchived ? { includeArchived: "true" } : undefined,
    schema: listOf(AccountSchema),
  });
}
