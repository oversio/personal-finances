import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AccountsModule } from "@/modules/accounts";
import { WorkspacesModule } from "@/modules/workspaces";
import {
  ArchiveTransactionHandler,
  CreateTransactionHandler,
  GetTransactionHandler,
  GetTransactionsHandler,
  TRANSACTION_REPOSITORY,
  UpdateAccountBalanceHandler,
  UpdateTransactionHandler,
} from "./application";
import {
  MongooseTransactionRepository,
  TransactionModel,
  TransactionSchema,
  TransactionsController,
} from "./infrastructure";

const commandHandlers = [
  CreateTransactionHandler,
  UpdateTransactionHandler,
  ArchiveTransactionHandler,
];

const queryHandlers = [GetTransactionHandler, GetTransactionsHandler];

const eventHandlers = [UpdateAccountBalanceHandler];

const repositories = [
  {
    provide: TRANSACTION_REPOSITORY,
    useClass: MongooseTransactionRepository,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TransactionModel.name, schema: TransactionSchema }]),
    WorkspacesModule,
    AccountsModule,
  ],
  controllers: [TransactionsController],
  providers: [...commandHandlers, ...queryHandlers, ...eventHandlers, ...repositories],
  exports: [...commandHandlers, ...queryHandlers, ...repositories],
})
export class TransactionsModule {}
