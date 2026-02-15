import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { WorkspaceMember } from "../../../domain/entities";
import {
  CannotChangeOwnerRoleError,
  WorkspaceMemberNotFoundError,
} from "../../../domain/exceptions";
import { WORKSPACE_MEMBER_REPOSITORY, type WorkspaceMemberRepository } from "../../ports";
import { ChangeMemberRoleCommand } from "./change-member-role.command";

export type ChangeMemberRoleResult = ReturnType<WorkspaceMember["toPrimitives"]>;

@Injectable()
export class ChangeMemberRoleHandler {
  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: WorkspaceMemberRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: ChangeMemberRoleCommand): Promise<ChangeMemberRoleResult> {
    const member = await this.memberRepository.findById(command.memberId);

    if (!member || member.workspaceId.value !== command.workspaceId) {
      throw new WorkspaceMemberNotFoundError(command.workspaceId, command.memberId);
    }

    // Cannot change owner's role
    if (member.role.isOwner()) {
      throw new CannotChangeOwnerRoleError();
    }

    const updatedMember = member.updateRole(command.role);
    const savedMember = await this.memberRepository.update(updatedMember);

    this.eventEmitter.emit("workspace.member.role_changed", {
      workspaceId: command.workspaceId,
      memberId: savedMember.id!.value,
      userId: savedMember.userId.value,
      oldRole: member.role.value,
      newRole: command.role,
    });

    return savedMember.toPrimitives();
  }
}
