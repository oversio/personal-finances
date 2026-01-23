import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  CreateWorkspaceHandler,
  WORKSPACE_MEMBER_REPOSITORY,
  WORKSPACE_REPOSITORY,
} from "./application";
import {
  MongooseWorkspaceMemberRepository,
  MongooseWorkspaceRepository,
  WorkspaceMemberModel,
  WorkspaceMemberSchema,
  WorkspaceModel,
  WorkspaceSchema,
} from "./infrastructure";

const commandHandlers = [CreateWorkspaceHandler];

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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkspaceModel.name, schema: WorkspaceSchema },
      { name: WorkspaceMemberModel.name, schema: WorkspaceMemberSchema },
    ]),
  ],
  providers: [...commandHandlers, ...repositories],
  exports: [...commandHandlers, ...repositories],
})
export class WorkspacesModule {}
