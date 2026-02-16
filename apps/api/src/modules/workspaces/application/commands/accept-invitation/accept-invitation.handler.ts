import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { WorkspaceMember } from "../../../domain/entities";
import {
  InvitationAlreadyAcceptedError,
  InvitationEmailMismatchError,
  InvitationExpiredError,
  InvitationNotFoundError,
  InvitationRevokedError,
  UserAlreadyMemberError,
} from "../../../domain/exceptions";
import {
  WORKSPACE_INVITATION_REPOSITORY,
  WORKSPACE_MEMBER_REPOSITORY,
  type WorkspaceInvitationRepository,
  type WorkspaceMemberRepository,
} from "../../ports";
import { AcceptInvitationCommand } from "./accept-invitation.command";

export interface AcceptInvitationResult {
  workspaceId: string;
  memberId: string;
  role: string;
}

@Injectable()
export class AcceptInvitationHandler {
  constructor(
    @Inject(WORKSPACE_INVITATION_REPOSITORY)
    private readonly invitationRepository: WorkspaceInvitationRepository,
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: WorkspaceMemberRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: AcceptInvitationCommand): Promise<AcceptInvitationResult> {
    // Find invitation by token
    const invitation = await this.invitationRepository.findByToken(command.token);

    if (!invitation) {
      throw new InvitationNotFoundError(command.token);
    }

    // Validate invitation state
    if (invitation.isAccepted()) {
      throw new InvitationAlreadyAcceptedError();
    }

    if (invitation.isRevoked()) {
      throw new InvitationRevokedError();
    }

    if (invitation.isExpired()) {
      throw new InvitationExpiredError();
    }

    // Verify email matches
    if (invitation.email.toLowerCase() !== command.userEmail.toLowerCase()) {
      throw new InvitationEmailMismatchError();
    }

    // Check if user is already a member
    const existingMember = await this.memberRepository.findByWorkspaceAndUser(
      invitation.workspaceId.value,
      command.userId,
    );

    if (existingMember) {
      throw new UserAlreadyMemberError(invitation.workspaceId.value, command.userId);
    }

    // Create workspace member
    const now = new Date();
    const member = WorkspaceMember.create(
      undefined,
      invitation.workspaceId.value,
      command.userId,
      invitation.role.value,
      invitation.invitedBy.value,
      invitation.createdAt,
      now,
      true,
    );

    const savedMember = await this.memberRepository.save(member);

    // Mark invitation as accepted
    const acceptedInvitation = invitation.accept(command.userId);
    await this.invitationRepository.update(acceptedInvitation);

    // Emit event
    this.eventEmitter.emit("workspace.invitation.accepted", {
      invitationId: invitation.id!.value,
      workspaceId: invitation.workspaceId.value,
      memberId: savedMember.id!.value,
      userId: command.userId,
      role: invitation.role.value,
    });

    return {
      workspaceId: invitation.workspaceId.value,
      memberId: savedMember.id!.value,
      role: invitation.role.value,
    };
  }
}
