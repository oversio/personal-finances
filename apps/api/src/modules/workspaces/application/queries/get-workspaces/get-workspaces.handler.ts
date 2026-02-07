import { Inject, Injectable } from "@nestjs/common";
import {
  WORKSPACE_MEMBER_REPOSITORY,
  WORKSPACE_REPOSITORY,
  type WorkspaceMemberRepository,
  type WorkspaceRepository,
} from "../../ports";
import { GetWorkspacesQuery } from "./get-workspaces.query";

export interface WorkspaceListItem {
  id: string;
  name: string;
  currency: string;
  timezone: string | undefined;
  isDefault: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetWorkspacesHandler {
  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: WorkspaceMemberRepository,
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async execute(query: GetWorkspacesQuery): Promise<WorkspaceListItem[]> {
    // Find all workspace memberships for the user
    const memberships = await this.memberRepository.findByUserId(query.userId);

    // If no memberships, return empty array
    if (memberships.length === 0) {
      return [];
    }

    // Get workspace details for each membership
    const workspaces: (WorkspaceListItem | null)[] = await Promise.all(
      memberships.map(async (membership): Promise<WorkspaceListItem | null> => {
        const workspace = await this.workspaceRepository.findById(membership.workspaceId.value);

        if (!workspace || !workspace.id) {
          return null;
        }

        return {
          id: workspace.id.value,
          name: workspace.name.value,
          currency: workspace.currency.value,
          timezone: workspace.timezone,
          isDefault: workspace.isDefault,
          role: membership.role.value,
          createdAt: workspace.createdAt,
          updatedAt: workspace.updatedAt,
        };
      }),
    );

    // Filter out any null values (in case workspace was deleted)
    return workspaces.filter((ws): ws is WorkspaceListItem => ws !== null);
  }
}
