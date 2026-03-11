import { DomainException } from "@/modules/shared/domain/exceptions";
import { ErrorCodes } from "@/modules/shared/domain/exceptions/error-codes";

export class InvoiceScannerUnsupportedFormatError extends DomainException {
  constructor(mimeType: string) {
    super(`Formato de imagen no soportado: ${mimeType}. Usa JPEG, PNG, WebP o GIF.`, {
      errorCode: ErrorCodes.invoiceScanner.unsupportedFormat,
      fieldName: "file",
      handler: "user",
    });
  }
}

export class InvoiceExtractionFailedError extends DomainException {
  constructor(reason?: string) {
    super(
      reason ?? "No se pudo extraer información de la factura. Intenta con una imagen más clara.",
      {
        errorCode: ErrorCodes.invoiceScanner.extractionFailed,
        fieldName: null,
        handler: "user",
      },
    );
  }
}

export class AiServiceUnavailableError extends DomainException {
  constructor(provider: string) {
    super(`El servicio de IA (${provider}) no está disponible en este momento.`, {
      errorCode: ErrorCodes.invoiceScanner.serviceUnavailable,
      fieldName: null,
      handler: "system",
    });
  }
}
