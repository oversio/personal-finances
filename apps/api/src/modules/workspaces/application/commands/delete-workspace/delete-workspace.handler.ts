import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  OnlyOwnerCanDeleteWorkspaceError,
  WorkspaceNotFoundError,
} from "../../../domain/exceptions";
import {
  WORKSPACE_MEMBER_REPOSITORY,
  WORKSPACE_REPOSITORY,
  type WorkspaceMemberRepository,
  type WorkspaceRepository,
} from "../../ports";
import { DeleteWorkspaceCommand } from "./delete-workspace.command";

@Injectable()
export class DeleteWorkspaceHandler {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: WorkspaceMemberRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: DeleteWorkspaceCommand): Promise<void> {
    const workspace = await this.workspaceRepository.findById(command.workspaceId);

    if (!workspace) {
      throw new WorkspaceNotFoundError(command.workspaceId);
    }

    // Only owner can delete
    if (workspace.ownerId.value !== command.userId) {
      throw new OnlyOwnerCanDeleteWorkspaceError();
    }

    // Delete all members first
    const members = await this.memberRepository.findByWorkspaceId(command.workspaceId);
    for (const member of members) {
      await this.memberRepository.delete(member.id!.value);
    }

    // Delete workspace
    await this.workspaceRepository.delete(command.workspaceId);

    // Emit event for cascading cleanup in other modules
    this.eventEmitter.emit("workspace.deleted", {
      workspaceId: command.workspaceId,
      ownerId: workspace.ownerId.value,
    });
  }
}
