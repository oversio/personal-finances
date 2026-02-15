import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CannotRemoveOwnerError, WorkspaceMemberNotFoundError } from "../../../domain/exceptions";
import { WORKSPACE_MEMBER_REPOSITORY, type WorkspaceMemberRepository } from "../../ports";
import { RemoveMemberCommand } from "./remove-member.command";

@Injectable()
export class RemoveMemberHandler {
  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: WorkspaceMemberRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: RemoveMemberCommand): Promise<void> {
    const member = await this.memberRepository.findById(command.memberId);

    if (!member || member.workspaceId.value !== command.workspaceId) {
      throw new WorkspaceMemberNotFoundError(command.workspaceId, command.memberId);
    }

    // Cannot remove owner
    if (member.role.isOwner()) {
      throw new CannotRemoveOwnerError();
    }

    await this.memberRepository.delete(command.memberId);

    this.eventEmitter.emit("workspace.member.removed", {
      workspaceId: command.workspaceId,
      memberId: command.memberId,
      userId: member.userId.value,
    });
  }
}
