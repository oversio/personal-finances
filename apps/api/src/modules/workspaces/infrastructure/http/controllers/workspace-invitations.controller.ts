import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser, Public, type AuthenticatedUser } from "@/modules/shared";
import {
  AcceptInvitationCommand,
  AcceptInvitationHandler,
  GetInvitationHandler,
  GetInvitationQuery,
  GetPendingInvitationsHandler,
  GetPendingInvitationsQuery,
  ResendInvitationCommand,
  ResendInvitationHandler,
  RevokeInvitationCommand,
  RevokeInvitationHandler,
  SendInvitationCommand,
  SendInvitationDto,
  SendInvitationHandler,
} from "../../../application";
import { CurrentWorkspace, RequireRole } from "../../decorators";
import { WorkspaceAccessGuard, WorkspaceRoleGuard, type WorkspaceContext } from "../../guards";

@ApiTags("workspace-invitations")
@Controller()
export class WorkspaceInvitationsController {
  constructor(
    private readonly sendInvitationHandler: SendInvitationHandler,
    private readonly acceptInvitationHandler: AcceptInvitationHandler,
    private readonly revokeInvitationHandler: RevokeInvitationHandler,
    private readonly resendInvitationHandler: ResendInvitationHandler,
    private readonly getInvitationHandler: GetInvitationHandler,
    private readonly getPendingInvitationsHandler: GetPendingInvitationsHandler,
  ) {}

  // ===== Public endpoint (requires token only) =====

  @Get("invitations/:token")
  @Public()
  @ApiOperation({ summary: "Get invitation details by token (public)" })
  @ApiParam({ name: "token", description: "Invitation token" })
  @ApiResponse({ status: 200, description: "Invitation details" })
  @ApiResponse({ status: 404, description: "Invitation not found" })
  async getInvitation(@Param("token") token: string) {
    const query = new GetInvitationQuery(token);
    return this.getInvitationHandler.execute(query);
  }

  // ===== Authenticated endpoint (no workspace guard) =====

  @Post("invitations/:token/accept")
  @ApiOperation({ summary: "Accept an invitation" })
  @ApiParam({ name: "token", description: "Invitation token" })
  @ApiResponse({ status: 200, description: "Invitation accepted" })
  @ApiResponse({ status: 404, description: "Invitation not found" })
  @ApiResponse({ status: 422, description: "Invitation expired, revoked, or email mismatch" })
  async acceptInvitation(@Param("token") token: string, @CurrentUser() user: AuthenticatedUser) {
    const command = new AcceptInvitationCommand(token, user.id, user.email);
    return this.acceptInvitationHandler.execute(command);
  }

  // ===== Workspace-scoped endpoints (require admin/owner) =====

  @Post("ws/:workspaceId/invitations")
  @UseGuards(WorkspaceAccessGuard, WorkspaceRoleGuard)
  @RequireRole("owner", "admin")
  @ApiOperation({ summary: "Send an invitation to join workspace" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiResponse({ status: 201, description: "Invitation sent" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  @ApiResponse({ status: 422, description: "Pending invitation already exists" })
  async sendInvitation(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SendInvitationDto,
  ) {
    const command = new SendInvitationCommand(workspace.id, dto.email, dto.role, user.id);
    return this.sendInvitationHandler.execute(command);
  }

  @Get("ws/:workspaceId/invitations")
  @UseGuards(WorkspaceAccessGuard, WorkspaceRoleGuard)
  @RequireRole("owner", "admin")
  @ApiOperation({ summary: "List pending invitations for workspace" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiResponse({ status: 200, description: "List of pending invitations" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  async getPendingInvitations(@CurrentWorkspace() workspace: WorkspaceContext["workspace"]) {
    const query = new GetPendingInvitationsQuery(workspace.id);
    return this.getPendingInvitationsHandler.execute(query);
  }

  @Post("ws/:workspaceId/invitations/:invitationId/resend")
  @UseGuards(WorkspaceAccessGuard, WorkspaceRoleGuard)
  @RequireRole("owner", "admin")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Resend an invitation email" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "invitationId", description: "Invitation ID" })
  @ApiResponse({ status: 200, description: "Invitation resent" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  @ApiResponse({ status: 404, description: "Invitation not found" })
  @ApiResponse({ status: 422, description: "Invitation already accepted or revoked" })
  async resendInvitation(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @CurrentUser() user: AuthenticatedUser,
    @Param("invitationId") invitationId: string,
  ) {
    const command = new ResendInvitationCommand(workspace.id, invitationId, user.id);
    return this.resendInvitationHandler.execute(command);
  }

  @Delete("ws/:workspaceId/invitations/:invitationId")
  @UseGuards(WorkspaceAccessGuard, WorkspaceRoleGuard)
  @RequireRole("owner", "admin")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Revoke an invitation" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "invitationId", description: "Invitation ID" })
  @ApiResponse({ status: 204, description: "Invitation revoked" })
  @ApiResponse({ status: 403, description: "Insufficient permissions" })
  @ApiResponse({ status: 404, description: "Invitation not found" })
  async revokeInvitation(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("invitationId") invitationId: string,
  ) {
    const command = new RevokeInvitationCommand(workspace.id, invitationId);
    await this.revokeInvitationHandler.execute(command);
  }
}
