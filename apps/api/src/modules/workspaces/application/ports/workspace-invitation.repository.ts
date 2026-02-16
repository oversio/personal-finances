import { WorkspaceInvitation } from "../../domain/entities";

export const WORKSPACE_INVITATION_REPOSITORY = Symbol("WORKSPACE_INVITATION_REPOSITORY");

export interface WorkspaceInvitationRepository {
  save(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation>;
  findById(id: string): Promise<WorkspaceInvitation | null>;
  findByToken(token: string): Promise<WorkspaceInvitation | null>;
  findByWorkspaceAndEmail(workspaceId: string, email: string): Promise<WorkspaceInvitation | null>;
  findPendingByWorkspaceId(workspaceId: string): Promise<WorkspaceInvitation[]>;
  update(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation>;
  delete(id: string): Promise<void>;
}
