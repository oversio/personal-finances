export const INVOICE_SCANNER_SERVICE = Symbol("INVOICE_SCANNER_SERVICE");

export interface CategoryOption {
  id: string;
  name: string;
  subcategories: Array<{ id: string; name: string }>;
}

export interface InvoiceScanInput {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  expenseCategories: CategoryOption[];
}

export interface InvoiceScanResult {
  confidence: number;
  amount: number | null;
  currency: string | null;
  date: string | null;
  vendor: string | null;
  description: string | null;
  categoryId: string | null;
  subcategoryId: string | null;
}

export interface InvoiceScannerService {
  supports(mimeType: string): boolean;
  scan(input: InvoiceScanInput): Promise<InvoiceScanResult>;
}
