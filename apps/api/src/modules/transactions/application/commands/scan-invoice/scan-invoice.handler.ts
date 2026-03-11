import { Inject, Injectable } from "@nestjs/common";
import {
  CATEGORY_REPOSITORY,
  type CategoryRepository,
} from "@/modules/categories/application/ports";
import {
  INVOICE_SCANNER_SERVICE,
  type InvoiceScannerService,
  type InvoiceScanResult,
  type CategoryOption,
} from "../../ports";
import { InvoiceScannerUnsupportedFormatError } from "../../../domain/exceptions";
import { ScanInvoiceCommand } from "./scan-invoice.command";

export type ScanInvoiceResult = InvoiceScanResult;

@Injectable()
export class ScanInvoiceHandler {
  constructor(
    @Inject(INVOICE_SCANNER_SERVICE)
    private readonly invoiceScanner: InvoiceScannerService,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(command: ScanInvoiceCommand): Promise<ScanInvoiceResult> {
    if (!this.invoiceScanner.supports(command.mimeType)) {
      throw new InvoiceScannerUnsupportedFormatError(command.mimeType);
    }

    const categories = await this.categoryRepository.findByWorkspaceId(command.workspaceId);

    const expenseCategories: CategoryOption[] = categories
      .filter(cat => !cat.isArchived && cat.id && cat.type.value === "expense")
      .map(cat => ({
        id: cat.id!.value,
        name: cat.name.value,
        subcategories: cat.subcategories.map(sub => ({
          id: sub.id,
          name: sub.name,
        })),
      }));

    return this.invoiceScanner.scan({
      buffer: command.buffer,
      mimeType: command.mimeType,
      fileName: command.fileName,
      expenseCategories,
    });
  }
}
