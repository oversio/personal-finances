import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from "@/modules/users";
import {
  ChangeMemberRoleHandler,
  CreateWorkspaceHandler,
  DeleteWorkspaceHandler,
  GetWorkspaceMembersHandler,
  GetWorkspaceSettingsHandler,
  GetWorkspacesHandler,
  InviteMemberHandler,
  RemoveMemberHandler,
  UpdateWorkspaceHandler,
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
  WorkspaceRoleGuard,
  WorkspaceSchema,
  WorkspaceSettingsController,
  WorkspacesController,
} from "./infrastructure";

const commandHandlers = [
  CreateWorkspaceHandler,
  UpdateWorkspaceHandler,
  InviteMemberHandler,
  ChangeMemberRoleHandler,
  RemoveMemberHandler,
  DeleteWorkspaceHandler,
];

const queryHandlers = [
  GetWorkspacesHandler,
  GetWorkspaceSettingsHandler,
  GetWorkspaceMembersHandler,
];

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

const guards = [WorkspaceAccessGuard, WorkspaceRoleGuard];

const controllers = [WorkspacesController, WorkspaceSettingsController];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkspaceModel.name, schema: WorkspaceSchema },
      { name: WorkspaceMemberModel.name, schema: WorkspaceMemberSchema },
    ]),
    UsersModule,
  ],
  controllers: [...controllers],
  providers: [...commandHandlers, ...queryHandlers, ...repositories, ...guards],
  exports: [...commandHandlers, ...queryHandlers, ...repositories, ...guards],
})
export class WorkspacesModule {}
