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
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  CurrentWorkspace,
  WorkspaceAccessGuard,
  type WorkspaceContext,
} from "@/modules/workspaces";
import {
  ArchiveAccountCommand,
  ArchiveAccountHandler,
  CreateAccountCommand,
  CreateAccountHandler,
  GetAccountHandler,
  GetAccountQuery,
  GetAccountsHandler,
  GetAccountsQuery,
  UpdateAccountCommand,
  UpdateAccountHandler,
} from "../../../application";
import { CreateAccountDto, UpdateAccountDto } from "../dto";

@ApiTags("accounts")
@Controller("ws/:workspaceId/accounts")
@UseGuards(WorkspaceAccessGuard)
export class AccountsController {
  constructor(
    private readonly createAccountHandler: CreateAccountHandler,
    private readonly updateAccountHandler: UpdateAccountHandler,
    private readonly archiveAccountHandler: ArchiveAccountHandler,
    private readonly getAccountHandler: GetAccountHandler,
    private readonly getAccountsHandler: GetAccountsHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: "List all accounts in workspace" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiQuery({ name: "includeArchived", required: false, type: Boolean })
  @ApiResponse({ status: 200, description: "List of accounts" })
  async getAccounts(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Query("includeArchived") includeArchived?: string,
  ) {
    const query = new GetAccountsQuery(workspace.id, includeArchived === "true");
    return this.getAccountsHandler.execute(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single account" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Account ID" })
  @ApiResponse({ status: 200, description: "Account details" })
  @ApiResponse({ status: 404, description: "Account not found" })
  async getAccount(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") id: string,
  ) {
    const query = new GetAccountQuery(id, workspace.id);
    return this.getAccountHandler.execute(query);
  }

  @Post()
  @ApiOperation({ summary: "Create a new account" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiResponse({ status: 201, description: "Account created" })
  @ApiResponse({ status: 422, description: "Validation error or account already exists" })
  async createAccount(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Body() dto: CreateAccountDto,
  ) {
    const command = new CreateAccountCommand(
      workspace.id,
      dto.name,
      dto.type,
      dto.currency,
      dto.initialBalance,
      dto.color,
      dto.icon,
    );
    return this.createAccountHandler.execute(command);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an account" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Account ID" })
  @ApiResponse({ status: 200, description: "Account updated" })
  @ApiResponse({ status: 404, description: "Account not found" })
  @ApiResponse({ status: 422, description: "Validation error" })
  async updateAccount(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    const command = new UpdateAccountCommand(
      id,
      workspace.id,
      dto.name,
      dto.type,
      dto.color,
      dto.icon ?? undefined,
    );
    return this.updateAccountHandler.execute(command);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Archive an account (soft delete)" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Account ID" })
  @ApiResponse({ status: 204, description: "Account archived" })
  @ApiResponse({ status: 404, description: "Account not found" })
  async archiveAccount(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") id: string,
  ) {
    const command = new ArchiveAccountCommand(id, workspace.id);
    await this.archiveAccountHandler.execute(command);
  }
}
