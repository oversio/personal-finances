import { fetcher, listOf } from "@/_commons/api";
import { AccountSchema } from "./account.types";

export interface GetAccountsParams {
  workspaceId: string;
  includeArchived?: boolean;
}

export async function getAccounts({ workspaceId, includeArchived }: GetAccountsParams) {
  return fetcher(`/ws/${workspaceId}/accounts`, {
    method: "GET",
    params: includeArchived ? { includeArchived: "true" } : undefined,
    schema: listOf(AccountSchema),
  });
}
