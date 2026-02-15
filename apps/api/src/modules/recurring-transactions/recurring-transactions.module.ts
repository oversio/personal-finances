import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TransactionsModule } from "@/modules/transactions";
import { WorkspacesModule } from "@/modules/workspaces";
import {
  ArchiveRecurringTransactionHandler,
  CreateRecurringTransactionHandler,
  CreateTransactionFromRecurringHandler,
  GetRecurringTransactionHandler,
  GetRecurringTransactionsHandler,
  PauseRecurringTransactionHandler,
  ProcessRecurringTransactionsHandler,
  RECURRING_TRANSACTION_REPOSITORY,
  ResumeRecurringTransactionHandler,
  UpdateRecurringTransactionHandler,
} from "./application";
import {
  MongooseRecurringTransactionRepository,
  RecurringTransactionModel,
  RecurringTransactionSchema,
  RecurringTransactionsController,
} from "./infrastructure";

const commandHandlers = [
  CreateRecurringTransactionHandler,
  UpdateRecurringTransactionHandler,
  ArchiveRecurringTransactionHandler,
  PauseRecurringTransactionHandler,
  ResumeRecurringTransactionHandler,
  ProcessRecurringTransactionsHandler,
];

const queryHandlers = [GetRecurringTransactionHandler, GetRecurringTransactionsHandler];

const eventHandlers = [CreateTransactionFromRecurringHandler];

const repositories = [
  {
    provide: RECURRING_TRANSACTION_REPOSITORY,
    useClass: MongooseRecurringTransactionRepository,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RecurringTransactionModel.name, schema: RecurringTransactionSchema },
    ]),
    WorkspacesModule,
    TransactionsModule,
  ],
  controllers: [RecurringTransactionsController],
  providers: [...commandHandlers, ...queryHandlers, ...eventHandlers, ...repositories],
  exports: [...commandHandlers, ...queryHandlers, ...repositories],
})
export class RecurringTransactionsModule {}
