import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Body,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
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
import {
  type AuthenticatedUser,
  CurrentUser,
  Public,
} from "@/modules/shared/infrastructure/decorators";
import {
  CurrentWorkspace,
  WorkspaceAccessGuard,
  type WorkspaceContext,
} from "@/modules/workspaces";
import {
  PreviewImportHandler,
  PreviewImportCommand,
  ConfirmImportHandler,
  ConfirmImportCommand,
  FILE_PARSER_SERVICE,
  type FileParserService,
} from "../../../application";
import { ConfirmImportDto } from "../dto";

const CSV_TEMPLATE = `type,account,toAccount,category,subcategory,amount,currency,notes,date
expense,Cuenta Corriente,,Alimentación,Supermercado,150.00,USD,Compras semanales,2024-01-15
income,Cuenta Corriente,,Salario,,2500.00,USD,Salario enero,2024-01-01
transfer,Cuenta Corriente,Ahorros,,,500.00,USD,Ahorro mensual,2024-01-10`;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@ApiTags("transactions")
@Controller("ws/:workspaceId/transactions/import")
@UseGuards(WorkspaceAccessGuard)
export class TransactionImportController {
  constructor(
    @Inject(FILE_PARSER_SERVICE)
    private readonly fileParser: FileParserService,
    private readonly previewImportHandler: PreviewImportHandler,
    private readonly confirmImportHandler: ConfirmImportHandler,
  ) {}

  @Public()
  @Get("template")
  @Header("Content-Type", "text/csv")
  @Header("Content-Disposition", 'attachment; filename="transactions-template.csv"')
  @ApiOperation({ summary: "Download CSV template for transaction import" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiResponse({ status: 200, description: "CSV template file" })
  getTemplate(): string {
    return CSV_TEMPLATE;
  }

  @Post("preview")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  @ApiOperation({ summary: "Upload file and preview import data" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "CSV file to import",
        },
      },
      required: ["file"],
    },
  })
  @ApiResponse({ status: 200, description: "Import preview with validation results" })
  @ApiResponse({ status: 400, description: "Invalid file format or parsing error" })
  async previewImport(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException("No se proporcionó ningún archivo");
    }

    const mimeType = file.mimetype;
    if (!this.fileParser.supports(mimeType)) {
      throw new BadRequestException(
        `Formato de archivo no soportado: ${mimeType}. Usa archivos CSV.`,
      );
    }

    const command = new PreviewImportCommand(
      workspace.id,
      user.id,
      file.originalname,
      file.buffer,
      mimeType,
    );

    return this.previewImportHandler.execute(command);
  }

  @Post("confirm")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Confirm import of validated transactions" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiResponse({ status: 200, description: "Import completed successfully" })
  @ApiResponse({ status: 400, description: "Invalid session or validation error" })
  @ApiResponse({ status: 404, description: "Import session not found or expired" })
  async confirmImport(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ConfirmImportDto,
  ) {
    const command = new ConfirmImportCommand(
      dto.sessionId,
      workspace.id,
      user.id,
      dto.skipInvalid,
      dto.createMissingCategories ?? false,
    );

    return this.confirmImportHandler.execute(command);
  }
}
