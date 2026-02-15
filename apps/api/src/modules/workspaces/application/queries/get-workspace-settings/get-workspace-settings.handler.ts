import { Inject, Injectable } from "@nestjs/common";
import { WorkspaceMemberNotFoundError, WorkspaceNotFoundError } from "../../../domain/exceptions";
import {
  WORKSPACE_MEMBER_REPOSITORY,
  WORKSPACE_REPOSITORY,
  type WorkspaceMemberRepository,
  type WorkspaceRepository,
} from "../../ports";
import { GetWorkspaceSettingsQuery } from "./get-workspace-settings.query";

export interface WorkspaceSettingsResult {
  id: string;
  name: string;
  ownerId: string;
  currency: string;
  timezone: string | undefined;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  currentUserRole: string;
}

@Injectable()
export class GetWorkspaceSettingsHandler {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: WorkspaceMemberRepository,
  ) {}

  async execute(query: GetWorkspaceSettingsQuery): Promise<WorkspaceSettingsResult> {
    const workspace = await this.workspaceRepository.findById(query.workspaceId);

    if (!workspace) {
      throw new WorkspaceNotFoundError(query.workspaceId);
    }

    const membership = await this.memberRepository.findByWorkspaceAndUser(
      query.workspaceId,
      query.userId,
    );

    if (!membership) {
      throw new WorkspaceMemberNotFoundError(query.workspaceId, query.userId);
    }

    return {
      id: workspace.id!.value,
      name: workspace.name.value,
      ownerId: workspace.ownerId.value,
      currency: workspace.currency.value,
      timezone: workspace.timezone,
      isDefault: workspace.isDefault,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      currentUserRole: membership.role.value,
    };
  }
}
