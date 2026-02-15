import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser, type AuthenticatedUser } from "@/modules/shared";
import {
  ChangeMemberRoleCommand,
  ChangeMemberRoleDto,
  ChangeMemberRoleHandler,
  DeleteWorkspaceCommand,
  DeleteWorkspaceHandler,
  GetWorkspaceMembersHandler,
  GetWorkspaceMembersQuery,
  GetWorkspaceSettingsHandler,
  GetWorkspaceSettingsQuery,
  InviteMemberCommand,
  InviteMemberDto,
  InviteMemberHandler,
  RemoveMemberCommand,
  RemoveMemberHandler,
  UpdateWorkspaceCommand,
  UpdateWorkspaceDto,
  UpdateWorkspaceHandler,
} from "../../../application";
import { CurrentWorkspace, CurrentWorkspaceMember, RequireRole } from "../../decorators";
import { WorkspaceAccessGuard, WorkspaceRoleGuard, type WorkspaceContext } from "../../guards";

@ApiTags("workspace-settings")
@Controller("ws/:workspaceId")
@UseGuards(WorkspaceAccessGuard, WorkspaceRoleGuard)
export class WorkspaceSettingsController {
  constructor(
    private readonly getWorkspaceSettingsHandler: GetWorkspaceSettingsHandler,
    private readonly updateWorkspaceHandler: UpdateWorkspaceHandler,
    private readonly getWorkspaceMembersHandler: GetWorkspaceMembersHandler,
    private readonly inviteMemberHandler: InviteMemberHandler,
    private readonly changeMemberRoleHandler: ChangeMemberRoleHandler,
    private readonly removeMemberHandler: RemoveMemberHandler,
    private readonly deleteWorkspaceHandler: DeleteWorkspaceHandler,
  ) {}

  @Get("settings")
  @ApiOperation({ summary: "Get workspace settings" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiResponse({ status: 200, description: "Workspace settings" })
  async getSettings(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const query = new GetWorkspaceSettingsQuery(workspace.id, user.id);
    return this.getWorkspaceSettingsHandler.execute(query);
  }

  @Put("settings")
  @RequireRole("owner", "admin")
  @ApiOperation({ summary: "Update workspace settings" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiResponse({ status: 200, description: "Workspace updated" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async updateSettings(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @CurrentWorkspaceMember("role") currentUserRole: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    const command = new UpdateWorkspaceCommand(workspace.id, dto.name, dto.currency, dto.timezone);
    const result = await this.updateWorkspaceHandler.execute(command);
    return { ...result, currentUserRole };
  }

  @Get("members")
  @ApiOperation({ summary: "List workspace members" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiResponse({ status: 200, description: "List of members" })
  async getMembers(@CurrentWorkspace() workspace: WorkspaceContext["workspace"]) {
    const query = new GetWorkspaceMembersQuery(workspace.id);
    return this.getWorkspaceMembersHandler.execute(query);
  }

  @Post("members/invite")
  @RequireRole("owner", "admin")
  @ApiOperation({ summary: "Invite a member to workspace" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiResponse({ status: 201, description: "Member invited" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  @ApiResponse({ status: 422, description: "User not found or already member" })
  async inviteMember(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: InviteMemberDto,
  ) {
    const command = new InviteMemberCommand(workspace.id, dto.email, dto.role, user.id);
    return this.inviteMemberHandler.execute(command);
  }

  @Put("members/:memberId/role")
  @RequireRole("owner", "admin")
  @ApiOperation({ summary: "Change member role" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "memberId", description: "Member ID" })
  @ApiResponse({ status: 200, description: "Role updated" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  @ApiResponse({ status: 422, description: "Cannot change owner role" })
  async changeMemberRole(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("memberId") memberId: string,
    @Body() dto: ChangeMemberRoleDto,
  ) {
    const command = new ChangeMemberRoleCommand(workspace.id, memberId, dto.role);
    return this.changeMemberRoleHandler.execute(command);
  }

  @Delete("members/:memberId")
  @RequireRole("owner", "admin")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove member from workspace" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "memberId", description: "Member ID" })
  @ApiResponse({ status: 204, description: "Member removed" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  @ApiResponse({ status: 422, description: "Cannot remove owner" })
  async removeMember(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("memberId") memberId: string,
  ) {
    const command = new RemoveMemberCommand(workspace.id, memberId);
    await this.removeMemberHandler.execute(command);
  }

  @Delete()
  @RequireRole("owner")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete workspace" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiResponse({ status: 204, description: "Workspace deleted" })
  @ApiResponse({ status: 403, description: "Only owner can delete" })
  async deleteWorkspace(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const command = new DeleteWorkspaceCommand(workspace.id, user.id);
    await this.deleteWorkspaceHandler.execute(command);
  }
}
