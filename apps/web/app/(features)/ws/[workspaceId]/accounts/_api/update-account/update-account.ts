import { fetcher } from "@/_commons/api";
import { AccountSchema, type UpdateAccountInput } from "../account.types";

export interface UpdateAccountParams {
  workspaceId: string;
  accountId: string;
  data: UpdateAccountInput;
}

export async function updateAccount({ workspaceId, accountId, data }: UpdateAccountParams) {
  return fetcher(`/ws/${workspaceId}/accounts/${accountId}`, {
    method: "PUT",
    body: data,
    schema: AccountSchema,
  });
}
