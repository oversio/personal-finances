import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { USER_REPOSITORY, type UserRepository } from "@/modules/users/application";
import { WorkspaceMember } from "../../../domain/entities";
import { UserAlreadyMemberError, UserNotFoundByEmailError } from "../../../domain/exceptions";
import { WORKSPACE_MEMBER_REPOSITORY, type WorkspaceMemberRepository } from "../../ports";
import { InviteMemberCommand } from "./invite-member.command";

export type InviteMemberResult = ReturnType<WorkspaceMember["toPrimitives"]>;

@Injectable()
export class InviteMemberHandler {
  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: WorkspaceMemberRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: InviteMemberCommand): Promise<InviteMemberResult> {
    // Find user by email
    const user = await this.userRepository.findByEmail(command.email);

    if (!user) {
      throw new UserNotFoundByEmailError(command.email);
    }

    const userId = user.id!.value;

    // Check if already a member
    const existingMember = await this.memberRepository.findByWorkspaceAndUser(
      command.workspaceId,
      userId,
    );

    if (existingMember) {
      throw new UserAlreadyMemberError(command.workspaceId, userId);
    }

    // Create workspace member
    const member = WorkspaceMember.create(
      undefined,
      command.workspaceId,
      userId,
      command.role,
      command.invitedByUserId,
      new Date(),
      new Date(), // User joins immediately since they already exist
      true,
    );

    const savedMember = await this.memberRepository.save(member);

    this.eventEmitter.emit("workspace.member.invited", {
      workspaceId: command.workspaceId,
      memberId: savedMember.id!.value,
      userId,
      role: command.role,
      invitedBy: command.invitedByUserId,
    });

    return savedMember.toPrimitives();
  }
}
