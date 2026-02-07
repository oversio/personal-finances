import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Workspace, WorkspaceMember } from "../../../domain/entities";
import {
  WORKSPACE_MEMBER_REPOSITORY,
  WORKSPACE_REPOSITORY,
  type WorkspaceMemberRepository,
  type WorkspaceRepository,
} from "../../ports";
import { CreateWorkspaceCommand } from "./create-workspace.command";

export interface CreateWorkspaceResult {
  workspace: ReturnType<Workspace["toPrimitives"]>;
  member: ReturnType<WorkspaceMember["toPrimitives"]>;
}

@Injectable()
export class CreateWorkspaceHandler {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: WorkspaceMemberRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: CreateWorkspaceCommand): Promise<CreateWorkspaceResult> {
    // Create the workspace
    const workspace = Workspace.create(
      undefined,
      command.name,
      command.ownerId,
      command.currency,
      command.timezone,
      command.isDefault,
    );

    const savedWorkspace = await this.workspaceRepository.save(workspace);

    // Create the owner as a member
    const ownerMember = WorkspaceMember.createOwner(savedWorkspace.id!.value, command.ownerId);

    const savedMember = await this.memberRepository.save(ownerMember);

    // Emit domain event
    this.eventEmitter.emit("workspace.created", {
      workspaceId: savedWorkspace.id!.value,
      ownerId: command.ownerId,
      name: command.name,
    });

    return {
      workspace: savedWorkspace.toPrimitives(),
      member: savedMember.toPrimitives(),
    };
  }
}
