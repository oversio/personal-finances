import { Inject, Injectable } from "@nestjs/common";
import { WORKSPACE_INVITATION_REPOSITORY, type WorkspaceInvitationRepository } from "../../ports";
import { GetPendingInvitationsQuery } from "./get-pending-invitations.query";

export interface PendingInvitationItem {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
  createdAt: Date;
  isExpired: boolean;
}

export type PendingInvitationsResult = PendingInvitationItem[];

@Injectable()
export class GetPendingInvitationsHandler {
  constructor(
    @Inject(WORKSPACE_INVITATION_REPOSITORY)
    private readonly invitationRepository: WorkspaceInvitationRepository,
  ) {}

  async execute(query: GetPendingInvitationsQuery): Promise<PendingInvitationsResult> {
    const invitations = await this.invitationRepository.findPendingByWorkspaceId(query.workspaceId);

    return invitations.map(invitation => ({
      id: invitation.id!.value,
      email: invitation.email,
      role: invitation.role.value,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      isExpired: invitation.isExpired(),
    }));
  }
}
