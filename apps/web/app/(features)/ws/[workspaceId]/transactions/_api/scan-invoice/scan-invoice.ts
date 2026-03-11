import { useAuthStore } from "@/_commons/stores/auth.store";
import { InvoiceScanResultSchema, type InvoiceScanResult } from "../invoice-scan.types";

export interface ScanInvoiceParams {
  workspaceId: string;
  file: File;
}

export async function scanInvoice({
  workspaceId,
  file,
}: ScanInvoiceParams): Promise<InvoiceScanResult> {
  const { accessToken } = useAuthStore.getState();

  const formData = new FormData();
  formData.append("file", file);

  const headers: HeadersInit = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`/api/v1/ws/${workspaceId}/transactions/invoice/scan`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al escanear la factura");
  }

  const data = await response.json();
  return InvoiceScanResultSchema.parse(data);
}
