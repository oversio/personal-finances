import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { type AuthenticatedUser, CurrentUser } from "@/modules/shared/infrastructure/decorators";
import {
  CurrentWorkspace,
  WorkspaceAccessGuard,
  type WorkspaceContext,
} from "@/modules/workspaces";
import {
  INVOICE_SCANNER_SERVICE,
  type InvoiceScannerService,
  ScanInvoiceCommand,
  ScanInvoiceHandler,
} from "../../../application";
import { ScanInvoiceResponseDto } from "../dto";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@ApiTags("transactions")
@Controller("ws/:workspaceId/transactions/invoice")
@UseGuards(WorkspaceAccessGuard)
export class InvoiceScanController {
  constructor(
    @Inject(INVOICE_SCANNER_SERVICE)
    private readonly invoiceScanner: InvoiceScannerService,
    private readonly scanInvoiceHandler: ScanInvoiceHandler,
  ) {}

  @Post("scan")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  @ApiOperation({ summary: "Scan an invoice image and extract transaction data" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Invoice image file (JPEG, PNG, WebP, GIF, max 10MB)",
        },
      },
      required: ["file"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Invoice scanned successfully",
    type: ScanInvoiceResponseDto,
  })
  @ApiResponse({ status: 400, description: "No file provided or unsupported format" })
  @ApiResponse({ status: 422, description: "Failed to extract data from invoice" })
  async scanInvoice(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ScanInvoiceResponseDto> {
    if (!file) {
      throw new BadRequestException("No se proporcionó ningún archivo");
    }

    const mimeType = file.mimetype;
    if (!this.invoiceScanner.supports(mimeType)) {
      throw new BadRequestException(
        `Formato de archivo no soportado: ${mimeType}. Usa JPEG, PNG, WebP o GIF.`,
      );
    }

    const command = new ScanInvoiceCommand(
      workspace.id,
      user.id,
      file.originalname,
      file.buffer,
      mimeType,
    );

    return this.scanInvoiceHandler.execute(command);
  }
}
