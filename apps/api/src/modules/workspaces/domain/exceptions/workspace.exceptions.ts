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

export class CannotRemoveOwnerError extends DomainException {
  constructor() {
    super("Cannot remove the workspace owner", {
      errorCode: ErrorCodes.workspaces.cannotRemoveOwner,
      fieldName: null,
      handler: "user",
    });
  }
}

export class CannotChangeOwnerRoleError extends DomainException {
  constructor() {
    super("Cannot change the role of the workspace owner", {
      errorCode: ErrorCodes.workspaces.cannotChangeOwnerRole,
      fieldName: null,
      handler: "user",
    });
  }
}

export class InsufficientPermissionsError extends DomainException {
  constructor(action: string) {
    super(`Insufficient permissions to ${action}`, {
      errorCode: ErrorCodes.workspaces.insufficientPermissions,
      fieldName: null,
      handler: "user",
    });
  }
}

export class UserNotFoundByEmailError extends DomainException {
  constructor(email: string) {
    super(`User with email ${email} not found`, {
      errorCode: ErrorCodes.workspaces.userNotFoundByEmail,
      fieldName: "email",
      handler: "user",
    });
  }
}

export class OnlyOwnerCanDeleteWorkspaceError extends DomainException {
  constructor() {
    super("Only the workspace owner can delete the workspace", {
      errorCode: ErrorCodes.workspaces.onlyOwnerCanDelete,
      fieldName: null,
      handler: "user",
    });
  }
}

export class InvitationNotFoundError extends DomainException {
  constructor(tokenOrId: string) {
    super(`Invitation ${tokenOrId} not found`, {
      errorCode: ErrorCodes.workspaces.invitationNotFound,
      fieldName: null,
      handler: "user",
    });
  }
}

export class InvitationExpiredError extends DomainException {
  constructor() {
    super("This invitation has expired", {
      errorCode: ErrorCodes.workspaces.invitationExpired,
      fieldName: null,
      handler: "user",
    });
  }
}

export class InvitationAlreadyAcceptedError extends DomainException {
  constructor() {
    super("This invitation has already been accepted", {
      errorCode: ErrorCodes.workspaces.invitationAlreadyAccepted,
      fieldName: null,
      handler: "user",
    });
  }
}

export class InvitationRevokedError extends DomainException {
  constructor() {
    super("This invitation has been revoked", {
      errorCode: ErrorCodes.workspaces.invitationRevoked,
      fieldName: null,
      handler: "user",
    });
  }
}

export class PendingInvitationExistsError extends DomainException {
  constructor(email: string) {
    super(`A pending invitation already exists for ${email}`, {
      errorCode: ErrorCodes.workspaces.pendingInvitationExists,
      fieldName: "email",
      handler: "user",
    });
  }
}

export class InvitationEmailMismatchError extends DomainException {
  constructor() {
    super("This invitation was sent to a different email address", {
      errorCode: ErrorCodes.workspaces.invitationEmailMismatch,
      fieldName: null,
      handler: "user",
    });
  }
}
