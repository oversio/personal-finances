import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WorkspacesModule } from "@/modules/workspaces";
import {
  ACCOUNT_REPOSITORY,
  ArchiveAccountHandler,
  CreateAccountHandler,
  GetAccountHandler,
  GetAccountsHandler,
  UpdateAccountHandler,
} from "./application";
import {
  AccountModel,
  AccountSchema,
  AccountsController,
  MongooseAccountRepository,
} from "./infrastructure";

const commandHandlers = [CreateAccountHandler, UpdateAccountHandler, ArchiveAccountHandler];

const queryHandlers = [GetAccountHandler, GetAccountsHandler];

const repositories = [
  {
    provide: ACCOUNT_REPOSITORY,
    useClass: MongooseAccountRepository,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AccountModel.name, schema: AccountSchema }]),
    WorkspacesModule,
  ],
  controllers: [AccountsController],
  providers: [...commandHandlers, ...queryHandlers, ...repositories],
  exports: [...commandHandlers, ...queryHandlers, ...repositories],
})
export class AccountsModule {}
