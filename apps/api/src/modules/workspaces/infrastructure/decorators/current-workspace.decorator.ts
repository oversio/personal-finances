import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { RequestWithWorkspace, WorkspaceContext } from "../guards";

/**
 * Extracts the workspace from the request context.
 * Requires WorkspaceAccessGuard to be applied to the route.
 *
 * @example
 * // Get full workspace object
 * @Get()
 * getAccounts(@CurrentWorkspace() workspace: WorkspaceContext['workspace']) {
 *   return this.service.getByWorkspace(workspace.id);
 * }
 *
 * @example
 * // Get specific workspace field
 * @Get()
 * getAccounts(@CurrentWorkspace('id') workspaceId: string) {
 *   return this.service.getByWorkspace(workspaceId);
 * }
 */
export const CurrentWorkspace = createParamDecorator(
  (
    data: keyof WorkspaceContext["workspace"] | undefined,
    ctx: ExecutionContext,
  ): WorkspaceContext["workspace"] | string | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithWorkspace>();
    const workspace = request.workspaceContext?.workspace;

    if (!workspace) {
      return undefined;
    }

    return data ? workspace[data] : workspace;
  },
);
