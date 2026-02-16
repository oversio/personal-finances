import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersModule } from "@/modules/users";
import {
  AcceptInvitationHandler,
  ChangeMemberRoleHandler,
  CreateWorkspaceHandler,
  DeleteWorkspaceHandler,
  GetInvitationHandler,
  GetPendingInvitationsHandler,
  GetWorkspaceMembersHandler,
  GetWorkspaceSettingsHandler,
  GetWorkspacesHandler,
  InviteMemberHandler,
  RemoveMemberHandler,
  ResendInvitationHandler,
  RevokeInvitationHandler,
  SendInvitationEmailHandler,
  SendInvitationHandler,
  UpdateWorkspaceHandler,
  WORKSPACE_INVITATION_REPOSITORY,
  WORKSPACE_MEMBER_REPOSITORY,
  WORKSPACE_REPOSITORY,
} from "./application";
import {
  MongooseWorkspaceInvitationRepository,
  MongooseWorkspaceMemberRepository,
  MongooseWorkspaceRepository,
  WorkspaceAccessGuard,
  WorkspaceInvitationModel,
  WorkspaceInvitationSchema,
  WorkspaceInvitationsController,
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
  SendInvitationHandler,
  AcceptInvitationHandler,
  RevokeInvitationHandler,
  ResendInvitationHandler,
];

const queryHandlers = [
  GetWorkspacesHandler,
  GetWorkspaceSettingsHandler,
  GetWorkspaceMembersHandler,
  GetInvitationHandler,
  GetPendingInvitationsHandler,
];

const eventHandlers = [SendInvitationEmailHandler];

const repositories = [
  {
    provide: WORKSPACE_REPOSITORY,
    useClass: MongooseWorkspaceRepository,
  },
  {
    provide: WORKSPACE_MEMBER_REPOSITORY,
    useClass: MongooseWorkspaceMemberRepository,
  },
  {
    provide: WORKSPACE_INVITATION_REPOSITORY,
    useClass: MongooseWorkspaceInvitationRepository,
  },
];

const guards = [WorkspaceAccessGuard, WorkspaceRoleGuard];

const controllers = [
  WorkspacesController,
  WorkspaceSettingsController,
  WorkspaceInvitationsController,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkspaceModel.name, schema: WorkspaceSchema },
      { name: WorkspaceMemberModel.name, schema: WorkspaceMemberSchema },
      { name: WorkspaceInvitationModel.name, schema: WorkspaceInvitationSchema },
    ]),
    UsersModule,
  ],
  controllers: [...controllers],
  providers: [...commandHandlers, ...queryHandlers, ...eventHandlers, ...repositories, ...guards],
  exports: [...commandHandlers, ...queryHandlers, ...repositories, ...guards],
})
export class WorkspacesModule {}
