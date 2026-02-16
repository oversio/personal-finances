import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { WorkspaceInvitation } from "../../../domain/entities";
import { PendingInvitationExistsError, WorkspaceNotFoundError } from "../../../domain/exceptions";
import {
  WORKSPACE_INVITATION_REPOSITORY,
  WORKSPACE_REPOSITORY,
  type WorkspaceInvitationRepository,
  type WorkspaceRepository,
} from "../../ports";
import { SendInvitationCommand } from "./send-invitation.command";

export type SendInvitationResult = ReturnType<WorkspaceInvitation["toPrimitives"]>;

@Injectable()
export class SendInvitationHandler {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
    @Inject(WORKSPACE_INVITATION_REPOSITORY)
    private readonly invitationRepository: WorkspaceInvitationRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: SendInvitationCommand): Promise<SendInvitationResult> {
    // Verify workspace exists
    const workspace = await this.workspaceRepository.findById(command.workspaceId);
    if (!workspace) {
      throw new WorkspaceNotFoundError(command.workspaceId);
    }

    // Check for existing pending invitation
    const existingInvitation = await this.invitationRepository.findByWorkspaceAndEmail(
      command.workspaceId,
      command.email,
    );

    if (existingInvitation && existingInvitation.isPending()) {
      throw new PendingInvitationExistsError(command.email);
    }

    // Create new invitation
    const invitation = WorkspaceInvitation.create(
      command.workspaceId,
      command.email,
      command.role,
      command.invitedByUserId,
    );

    const savedInvitation = await this.invitationRepository.save(invitation);

    // Emit event for email sending
    this.eventEmitter.emit("workspace.invitation.sent", {
      invitationId: savedInvitation.id!.value,
      workspaceId: command.workspaceId,
      workspaceName: workspace.name.value,
      email: command.email,
      role: command.role,
      token: savedInvitation.token,
      invitedBy: command.invitedByUserId,
      expiresAt: savedInvitation.expiresAt,
    });

    return savedInvitation.toPrimitives();
  }
}
