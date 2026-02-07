import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { IS_PUBLIC_KEY } from "@/modules/shared";
import type { AuthenticatedUser } from "@/modules/auth";
import { WORKSPACE_MEMBER_REPOSITORY, WORKSPACE_REPOSITORY } from "../../application/ports";
import type { WorkspaceMemberRepository, WorkspaceRepository } from "../../application/ports";
import { WorkspaceAccessDeniedError, WorkspaceNotFoundError } from "../../domain/exceptions";

export const WORKSPACE_ID_PARAM = "workspaceId";

export interface WorkspaceContext {
  workspace: {
    id: string;
    name: string;
    ownerId: string;
    currency: string;
    timezone?: string;
  };
  membership: {
    id: string;
    role: string;
    isActive: boolean;
  };
}

export interface RequestWithWorkspace extends Request {
  user: AuthenticatedUser;
  workspaceContext: WorkspaceContext;
}

@Injectable()
export class WorkspaceAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: WorkspaceMemberRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip for public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithWorkspace>();
    const user = request.user;

    // Get workspaceId from route params
    const workspaceIdParam = request.params[WORKSPACE_ID_PARAM];

    // Handle case where param could be string[] (Express typing)
    const workspaceId = Array.isArray(workspaceIdParam) ? workspaceIdParam[0] : workspaceIdParam;

    if (!workspaceId) {
      // No workspace context required for this route
      return true;
    }

    // Validate workspace exists
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new WorkspaceNotFoundError(workspaceId);
    }

    // Validate user is a member
    const membership = await this.memberRepository.findByWorkspaceAndUser(workspaceId, user.id);

    if (!membership || !membership.isActive) {
      throw new WorkspaceAccessDeniedError(workspaceId);
    }

    // Attach workspace context to request
    request.workspaceContext = {
      workspace: {
        id: workspace.id!.value,
        name: workspace.name.value,
        ownerId: workspace.ownerId.value,
        currency: workspace.currency.value,
        timezone: workspace.timezone,
      },
      membership: {
        id: membership.id!.value,
        role: membership.role.value,
        isActive: membership.isActive,
      },
    };

    return true;
  }
}
