import { Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY, type UserRepository } from "@/modules/users/application";
import { InvitationNotFoundError, WorkspaceNotFoundError } from "../../../domain/exceptions";
import {
  WORKSPACE_INVITATION_REPOSITORY,
  WORKSPACE_REPOSITORY,
  type WorkspaceInvitationRepository,
  type WorkspaceRepository,
} from "../../ports";
import { GetInvitationQuery } from "./get-invitation.query";

export interface InvitationResult {
  id: string;
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: string;
  invitedByName: string;
  expiresAt: Date;
  status: "pending" | "expired" | "accepted" | "revoked";
}

@Injectable()
export class GetInvitationHandler {
  constructor(
    @Inject(WORKSPACE_INVITATION_REPOSITORY)
    private readonly invitationRepository: WorkspaceInvitationRepository,
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetInvitationQuery): Promise<InvitationResult> {
    const invitation = await this.invitationRepository.findByToken(query.token);

    if (!invitation) {
      throw new InvitationNotFoundError(query.token);
    }

    const workspace = await this.workspaceRepository.findById(invitation.workspaceId.value);
    if (!workspace) {
      throw new WorkspaceNotFoundError(invitation.workspaceId.value);
    }

    const inviter = await this.userRepository.findById(invitation.invitedBy.value);
    const inviterName = inviter?.name.value ?? "Unknown";

    let status: InvitationResult["status"] = "pending";
    if (invitation.isAccepted()) {
      status = "accepted";
    } else if (invitation.isRevoked()) {
      status = "revoked";
    } else if (invitation.isExpired()) {
      status = "expired";
    }

    return {
      id: invitation.id!.value,
      workspaceId: workspace.id!.value,
      workspaceName: workspace.name.value,
      email: invitation.email,
      role: invitation.role.value,
      invitedByName: inviterName,
      expiresAt: invitation.expiresAt,
      status,
    };
  }
}
