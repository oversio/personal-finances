import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { RequestWithWorkspace, WorkspaceContext } from "../guards";

/**
 * Extracts the workspace membership from the request context.
 * Requires WorkspaceAccessGuard to be applied to the route.
 *
 * @example
 * // Get full membership object
 * @Get()
 * getSensitiveData(@CurrentWorkspaceMember() member: WorkspaceContext['membership']) {
 *   if (member.role !== 'owner' && member.role !== 'admin') {
 *     throw new ForbiddenException();
 *   }
 *   return this.service.getSensitiveData();
 * }
 *
 * @example
 * // Get specific membership field
 * @Get()
 * getRole(@CurrentWorkspaceMember('role') role: string) {
 *   return { role };
 * }
 */
export const CurrentWorkspaceMember = createParamDecorator(
  (
    data: keyof WorkspaceContext["membership"] | undefined,
    ctx: ExecutionContext,
  ): WorkspaceContext["membership"] | string | boolean | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithWorkspace>();
    const membership = request.workspaceContext?.membership;

    if (!membership) {
      return undefined;
    }

    return data ? membership[data] : membership;
  },
);
