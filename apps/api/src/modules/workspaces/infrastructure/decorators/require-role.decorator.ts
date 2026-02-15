import { SetMetadata } from "@nestjs/common";

export const REQUIRED_ROLES_KEY = "requiredRoles";

export type WorkspaceRole = "owner" | "admin" | "member";

/**
 * Decorator that specifies which roles are required to access a route.
 * Must be used with WorkspaceRoleGuard.
 *
 * @example
 * // Allow only owners
 * @RequireRole("owner")
 *
 * @example
 * // Allow owners and admins
 * @RequireRole("owner", "admin")
 */
export const RequireRole = (...roles: WorkspaceRole[]) => SetMetadata(REQUIRED_ROLES_KEY, roles);
