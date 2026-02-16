import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InvitationNotFoundError } from "../../../domain/exceptions";
import { WORKSPACE_INVITATION_REPOSITORY, type WorkspaceInvitationRepository } from "../../ports";
import { RevokeInvitationCommand } from "./revoke-invitation.command";

@Injectable()
export class RevokeInvitationHandler {
  constructor(
    @Inject(WORKSPACE_INVITATION_REPOSITORY)
    private readonly invitationRepository: WorkspaceInvitationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: RevokeInvitationCommand): Promise<void> {
    const invitation = await this.invitationRepository.findById(command.invitationId);

    if (!invitation) {
      throw new InvitationNotFoundError(command.invitationId);
    }

    // Verify invitation belongs to workspace
    if (invitation.workspaceId.value !== command.workspaceId) {
      throw new InvitationNotFoundError(command.invitationId);
    }

    // Already revoked or accepted - just return silently
    if (invitation.isRevoked() || invitation.isAccepted()) {
      return;
    }

    const revokedInvitation = invitation.revoke();
    await this.invitationRepository.update(revokedInvitation);

    this.eventEmitter.emit("workspace.invitation.revoked", {
      invitationId: invitation.id!.value,
      workspaceId: command.workspaceId,
      email: invitation.email,
    });
  }
}
