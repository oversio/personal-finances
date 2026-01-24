import { WorkspaceMember } from "../../domain/entities";

export const WORKSPACE_MEMBER_REPOSITORY = Symbol(
  "WORKSPACE_MEMBER_REPOSITORY"
);

export interface WorkspaceMemberRepository {
  save(member: WorkspaceMember): Promise<WorkspaceMember>;
  findById(id: string): Promise<WorkspaceMember | null>;
  findByWorkspaceId(workspaceId: string): Promise<WorkspaceMember[]>;
  findByUserId(userId: string): Promise<WorkspaceMember[]>;
  findByWorkspaceAndUser(
    workspaceId: string,
    userId: string
  ): Promise<WorkspaceMember | null>;
  update(member: WorkspaceMember): Promise<WorkspaceMember>;
  delete(id: string): Promise<void>;
}
