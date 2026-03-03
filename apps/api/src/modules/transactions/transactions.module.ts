import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AccountsModule } from "@/modules/accounts";
import { CategoriesModule } from "@/modules/categories";
import { WorkspacesModule } from "@/modules/workspaces";
import {
  ArchiveTransactionHandler,
  ConfirmImportHandler,
  CreateTransactionHandler,
  FILE_PARSER_SERVICE,
  GetTransactionHandler,
  GetTransactionsHandler,
  IMPORT_SESSION_REPOSITORY,
  PreviewImportHandler,
  TRANSACTION_REPOSITORY,
  UpdateAccountBalanceHandler,
  UpdateTransactionHandler,
} from "./application";
import {
  CsvParserService,
  ImportSessionModel,
  ImportSessionSchema,
  MongooseImportSessionRepository,
  MongooseTransactionRepository,
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
];

const queryHandlers = [GetTransactionHandler, GetTransactionsHandler];

const eventHandlers = [UpdateAccountBalanceHandler];

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
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TransactionModel.name, schema: TransactionSchema },
      { name: ImportSessionModel.name, schema: ImportSessionSchema },
    ]),
    WorkspacesModule,
    AccountsModule,
    CategoriesModule,
  ],
  controllers: [TransactionsController, TransactionImportController],
  providers: [...commandHandlers, ...queryHandlers, ...eventHandlers, ...repositories, ...services],
  exports: [...commandHandlers, ...queryHandlers, ...repositories],
})
export class TransactionsModule {}
