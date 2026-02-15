import { fetcher } from "@/_commons/api";
import { AccountSchema } from "../account.types";

export interface GetAccountParams {
  workspaceId: string;
  accountId: string;
}

export async function getAccount({ workspaceId, accountId }: GetAccountParams) {
  return fetcher(`/ws/${workspaceId}/accounts/${accountId}`, {
    method: "GET",
    schema: AccountSchema,
  });
}
