import { Module, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import type { EnvConfig } from "@/config/env.validation";
import { AccountsModule } from "@/modules/accounts";
import { CategoriesModule } from "@/modules/categories";
import { WorkspacesModule } from "@/modules/workspaces";
import {
  ArchiveTransactionHandler,
  ConfirmImportHandler,
  CreateTransactionFromRecurringHandler,
  CreateTransactionHandler,
  FILE_PARSER_SERVICE,
  GetExpensesBreakdownHandler,
  GetTransactionHandler,
  GetTransactionsHandler,
  IMPORT_SESSION_REPOSITORY,
  INVOICE_SCANNER_SERVICE,
  PreviewImportHandler,
  ScanInvoiceHandler,
  TRANSACTION_REPOSITORY,
  UpdateAccountBalanceHandler,
  UpdateTransactionHandler,
} from "./application";
import {
  AnthropicInvoiceScannerService,
  CsvParserService,
  GeminiInvoiceScannerService,
  GroqInvoiceScannerService,
  ImportSessionModel,
  ImportSessionSchema,
  InvoiceScanController,
  MongooseImportSessionRepository,
  MongooseTransactionRepository,
  OpenAiInvoiceScannerService,
  TransactionImportController,
  TransactionModel,
  TransactionSchema,
  TransactionsController,
} from "./infrastructure";

const commandHandlers = [
  CreateTransactionHandler,
  UpdateTransactionHandler,
  ArchiveTransactionHandler,
  PreviewImportHandler,
  ConfirmImportHandler,
  ScanInvoiceHandler,
];

const queryHandlers = [GetTransactionHandler, GetTransactionsHandler, GetExpensesBreakdownHandler];

const eventHandlers = [UpdateAccountBalanceHandler, CreateTransactionFromRecurringHandler];

const repositories = [
  {
    provide: TRANSACTION_REPOSITORY,
    useClass: MongooseTransactionRepository,
  },
  {
    provide: IMPORT_SESSION_REPOSITORY,
    useClass: MongooseImportSessionRepository,
  },
];

const services = [
  {
    provide: FILE_PARSER_SERVICE,
    useClass: CsvParserService,
  },
  {
    provide: INVOICE_SCANNER_SERVICE,
    useFactory: (config: ConfigService<EnvConfig>) => {
      const provider = config.get<string>("AI_INVOICE_PROVIDER") ?? "groq";
      switch (provider) {
        case "gemini":
          return new GeminiInvoiceScannerService(config);
        case "openai":
          return new OpenAiInvoiceScannerService(config);
        case "anthropic":
          return new AnthropicInvoiceScannerService(config);
        case "groq":
        default:
          return new GroqInvoiceScannerService(config);
      }
    },
    inject: [ConfigService],
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TransactionModel.name, schema: TransactionSchema },
      { name: ImportSessionModel.name, schema: ImportSessionSchema },
    ]),
    WorkspacesModule,
    AccountsModule,
    forwardRef(() => CategoriesModule),
  ],
  controllers: [TransactionsController, TransactionImportController, InvoiceScanController],
  providers: [...commandHandlers, ...queryHandlers, ...eventHandlers, ...repositories, ...services],
  exports: [...commandHandlers, ...queryHandlers, ...repositories],
})
export class TransactionsModule {}
