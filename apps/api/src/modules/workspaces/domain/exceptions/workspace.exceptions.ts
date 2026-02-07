import { DomainException, ErrorCodes } from "@/modules/shared/domain/exceptions";

export class WorkspaceNotFoundError extends DomainException {
  constructor(id: string) {
    super(`Workspace with id ${id} not found`, {
      errorCode: ErrorCodes.workspaces.notFound,
      fieldName: null,
      handler: "user",
    });
  }
}

export class WorkspaceMemberNotFoundError extends DomainException {
  constructor(workspaceId: string, userId: string) {
    super(`Member with userId ${userId} not found in workspace ${workspaceId}`, {
      errorCode: ErrorCodes.workspaces.memberNotFound,
      fieldName: null,
      handler: "user",
    });
  }
}

export class UserAlreadyMemberError extends DomainException {
  constructor(workspaceId: string, userId: string) {
    super(`User ${userId} is already a member of workspace ${workspaceId}`, {
      errorCode: ErrorCodes.workspaces.userAlreadyMember,
      fieldName: "userId",
      handler: "user",
    });
  }
}

export class WorkspaceAccessDeniedError extends DomainException {
  constructor(workspaceId: string) {
    super(`Access denied to workspace ${workspaceId}`, {
      errorCode: ErrorCodes.workspaces.accessDenied,
      fieldName: null,
      handler: "user",
    });
  }
}
