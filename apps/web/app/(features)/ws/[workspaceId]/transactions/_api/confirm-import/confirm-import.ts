import { fetcher } from "@/_commons/api";
import {
  ConfirmImportResponseSchema,
  type ConfirmImportInput,
  type ConfirmImportResponse,
} from "../import.types";

export interface ConfirmImportParams {
  workspaceId: string;
  data: ConfirmImportInput;
}

export async function confirmImport({
  workspaceId,
  data,
}: ConfirmImportParams): Promise<ConfirmImportResponse> {
  return fetcher(`/ws/${workspaceId}/transactions/import/confirm`, {
    method: "POST",
    body: data,
    schema: ConfirmImportResponseSchema,
  });
}
