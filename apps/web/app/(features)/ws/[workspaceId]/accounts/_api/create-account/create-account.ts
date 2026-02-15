import { fetcher } from "@/_commons/api";
import { AccountSchema, type CreateAccountInput } from "../account.types";

export interface CreateAccountParams {
  workspaceId: string;
  data: CreateAccountInput;
}

export async function createAccount({ workspaceId, data }: CreateAccountParams) {
  return fetcher(`/ws/${workspaceId}/accounts`, {
    method: "POST",
    body: data,
    schema: AccountSchema,
  });
}
