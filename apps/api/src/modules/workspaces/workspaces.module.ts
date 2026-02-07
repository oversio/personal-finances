import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  CreateWorkspaceHandler,
  GetWorkspacesHandler,
  WORKSPACE_MEMBER_REPOSITORY,
  WORKSPACE_REPOSITORY,
} from "./application";
import {
  MongooseWorkspaceMemberRepository,
  MongooseWorkspaceRepository,
  WorkspaceAccessGuard,
  WorkspaceMemberModel,
  WorkspaceMemberSchema,
  WorkspaceModel,
  WorkspaceSchema,
  WorkspacesController,
} from "./infrastructure";

const commandHandlers = [CreateWorkspaceHandler];

const queryHandlers = [GetWorkspacesHandler];

const repositories = [
  {
    provide: WORKSPACE_REPOSITORY,
    useClass: MongooseWorkspaceRepository,
  },
  {
    provide: WORKSPACE_MEMBER_REPOSITORY,
    useClass: MongooseWorkspaceMemberRepository,
  },
];

const guards = [WorkspaceAccessGuard];

const controllers = [WorkspacesController];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkspaceModel.name, schema: WorkspaceSchema },
      { name: WorkspaceMemberModel.name, schema: WorkspaceMemberSchema },
    ]),
  ],
  controllers: [...controllers],
  providers: [...commandHandlers, ...queryHandlers, ...repositories, ...guards],
  exports: [...commandHandlers, ...queryHandlers, ...repositories, ...guards],
})
export class WorkspacesModule {}
