import { useAuthStore } from "@/_commons/stores/auth.store";
import { PreviewImportResponseSchema, type PreviewImportResponse } from "../import.types";

export interface PreviewImportParams {
  workspaceId: string;
  file: File;
}

export async function previewImport({
  workspaceId,
  file,
}: PreviewImportParams): Promise<PreviewImportResponse> {
  const { accessToken } = useAuthStore.getState();

  const formData = new FormData();
  formData.append("file", file);

  const headers: HeadersInit = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`/api/v1/ws/${workspaceId}/transactions/import/preview`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al procesar el archivo");
  }

  const data = await response.json();
  return PreviewImportResponseSchema.parse(data);
}
