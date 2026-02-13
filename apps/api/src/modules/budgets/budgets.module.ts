import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CategoriesModule } from "@/modules/categories";
import { TransactionsModule } from "@/modules/transactions";
import { WorkspacesModule } from "@/modules/workspaces";
import {
  ArchiveBudgetHandler,
  BUDGET_REPOSITORY,
  BudgetProgressService,
  CreateBudgetHandler,
  GetBudgetHandler,
  GetBudgetsHandler,
  UpdateBudgetHandler,
} from "./application";
import {
  BudgetModel,
  BudgetSchema,
  BudgetsController,
  MongooseBudgetRepository,
} from "./infrastructure";

const commandHandlers = [CreateBudgetHandler, UpdateBudgetHandler, ArchiveBudgetHandler];

const queryHandlers = [GetBudgetHandler, GetBudgetsHandler];

const services = [BudgetProgressService];

const repositories = [
  {
    provide: BUDGET_REPOSITORY,
    useClass: MongooseBudgetRepository,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BudgetModel.name, schema: BudgetSchema }]),
    WorkspacesModule,
    CategoriesModule,
    TransactionsModule,
  ],
  controllers: [BudgetsController],
  providers: [...commandHandlers, ...queryHandlers, ...services, ...repositories],
  exports: [...commandHandlers, ...queryHandlers, ...services, ...repositories],
})
export class BudgetsModule {}
