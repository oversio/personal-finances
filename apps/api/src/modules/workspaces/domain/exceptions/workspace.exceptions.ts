import { DomainException } from "@/modules/shared/domain/exceptions";

export class WorkspaceNotFoundError extends DomainException {
  constructor(id: string) {
    super(`Workspace with id ${id} not found`);
  }
}

export class WorkspaceMemberNotFoundError extends DomainException {
  constructor(workspaceId: string, userId: string) {
    super(`Member with userId ${userId} not found in workspace ${workspaceId}`);
  }
}

export class UserAlreadyMemberError extends DomainException {
  constructor(workspaceId: string, userId: string) {
    super(`User ${userId} is already a member of workspace ${workspaceId}`);
  }
}
