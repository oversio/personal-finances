import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { InsufficientPermissionsError } from "../../domain/exceptions";
import { REQUIRED_ROLES_KEY, type WorkspaceRole } from "../decorators/require-role.decorator";
import type { RequestWithWorkspace } from "./workspace-access.guard";

/**
 * Guard that checks if the user has the required role to access a route.
 * Must be used after WorkspaceAccessGuard, as it relies on the workspaceContext.
 *
 * @example
 * @UseGuards(WorkspaceAccessGuard, WorkspaceRoleGuard)
 * @RequireRole("owner", "admin")
 * @Put()
 * updateSettings() {}
 */
@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<WorkspaceRole[] | undefined>(
      REQUIRED_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithWorkspace>();
    const membership = request.workspaceContext?.membership;

    if (!membership) {
      throw new InsufficientPermissionsError("access this resource");
    }

    const userRole = membership.role as WorkspaceRole;

    if (!requiredRoles.includes(userRole)) {
      throw new InsufficientPermissionsError("perform this action");
    }

    return true;
  }
}
