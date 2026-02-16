import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { WorkspaceInvitation } from "../../../domain/entities";
import {
  InvitationAlreadyAcceptedError,
  InvitationNotFoundError,
  InvitationRevokedError,
  WorkspaceNotFoundError,
} from "../../../domain/exceptions";
import {
  WORKSPACE_INVITATION_REPOSITORY,
  WORKSPACE_REPOSITORY,
  type WorkspaceInvitationRepository,
  type WorkspaceRepository,
} from "../../ports";
import { ResendInvitationCommand } from "./resend-invitation.command";

export type ResendInvitationResult = ReturnType<WorkspaceInvitation["toPrimitives"]>;

@Injectable()
export class ResendInvitationHandler {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
    @Inject(WORKSPACE_INVITATION_REPOSITORY)
    private readonly invitationRepository: WorkspaceInvitationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: ResendInvitationCommand): Promise<ResendInvitationResult> {
    const invitation = await this.invitationRepository.findById(command.invitationId);

    if (!invitation) {
      throw new InvitationNotFoundError(command.invitationId);
    }

    // Verify invitation belongs to workspace
    if (invitation.workspaceId.value !== command.workspaceId) {
      throw new InvitationNotFoundError(command.invitationId);
    }

    if (invitation.isAccepted()) {
      throw new InvitationAlreadyAcceptedError();
    }

    if (invitation.isRevoked()) {
      throw new InvitationRevokedError();
    }

    const workspace = await this.workspaceRepository.findById(command.workspaceId);
    if (!workspace) {
      throw new WorkspaceNotFoundError(command.workspaceId);
    }

    let resultInvitation = invitation;

    // If expired, create a new invitation
    if (invitation.isExpired()) {
      // Revoke the old one
      const revokedInvitation = invitation.revoke();
      await this.invitationRepository.update(revokedInvitation);

      // Create new invitation
      const newInvitation = WorkspaceInvitation.create(
        command.workspaceId,
        invitation.email,
        invitation.role.value,
        command.resendByUserId,
      );

      resultInvitation = await this.invitationRepository.save(newInvitation);

      // Emit sent event for new invitation
      this.eventEmitter.emit("workspace.invitation.sent", {
        invitationId: resultInvitation.id!.value,
        workspaceId: command.workspaceId,
        workspaceName: workspace.name.value,
        email: invitation.email,
        role: invitation.role.value,
        token: resultInvitation.token,
        invitedBy: command.resendByUserId,
        expiresAt: resultInvitation.expiresAt,
      });
    } else {
      // Not expired, just resend the email
      this.eventEmitter.emit("workspace.invitation.resent", {
        invitationId: invitation.id!.value,
        workspaceId: command.workspaceId,
        workspaceName: workspace.name.value,
        email: invitation.email,
        role: invitation.role.value,
        token: invitation.token,
        invitedBy: invitation.invitedBy.value,
        expiresAt: invitation.expiresAt,
      });
    }

    return resultInvitation.toPrimitives();
  }
}
