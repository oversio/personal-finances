import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser, type AuthenticatedUser } from "@/modules/shared";
import { GetWorkspacesHandler, GetWorkspacesQuery } from "../../../application";

@ApiTags("workspaces")
@Controller("workspaces")
export class WorkspacesController {
  constructor(private readonly getWorkspacesHandler: GetWorkspacesHandler) {}

  @Get()
  @ApiOperation({ summary: "List all workspaces for the authenticated user" })
  @ApiResponse({ status: 200, description: "List of workspaces" })
  async getWorkspaces(@CurrentUser() user: AuthenticatedUser) {
    const query = new GetWorkspacesQuery(user.id);
    return this.getWorkspacesHandler.execute(query);
  }
}
