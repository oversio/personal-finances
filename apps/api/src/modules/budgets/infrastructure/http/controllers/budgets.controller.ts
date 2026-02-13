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
  ArchiveBudgetCommand,
  ArchiveBudgetHandler,
  CreateBudgetCommand,
  CreateBudgetHandler,
  GetBudgetHandler,
  GetBudgetQuery,
  GetBudgetsHandler,
  GetBudgetsQuery,
  UpdateBudgetCommand,
  UpdateBudgetHandler,
} from "../../../application";
import { CreateBudgetDto, UpdateBudgetDto } from "../dto";

@ApiTags("budgets")
@Controller("ws/:workspaceId/budgets")
@UseGuards(WorkspaceAccessGuard)
export class BudgetsController {
  constructor(
    private readonly createBudgetHandler: CreateBudgetHandler,
    private readonly updateBudgetHandler: UpdateBudgetHandler,
    private readonly archiveBudgetHandler: ArchiveBudgetHandler,
    private readonly getBudgetHandler: GetBudgetHandler,
    private readonly getBudgetsHandler: GetBudgetsHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: "List all budgets in workspace with progress" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiQuery({ name: "includeArchived", required: false, type: Boolean })
  @ApiResponse({ status: 200, description: "List of budgets with progress" })
  async getBudgets(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Query("includeArchived") includeArchived?: string,
  ) {
    const query = new GetBudgetsQuery(workspace.id, includeArchived === "true");
    return this.getBudgetsHandler.execute(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single budget with progress" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Budget ID" })
  @ApiResponse({ status: 200, description: "Budget details with progress" })
  @ApiResponse({ status: 404, description: "Budget not found" })
  async getBudget(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") id: string,
  ) {
    const query = new GetBudgetQuery(id, workspace.id);
    return this.getBudgetHandler.execute(query);
  }

  @Post()
  @ApiOperation({ summary: "Create a new budget" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiResponse({ status: 201, description: "Budget created" })
  @ApiResponse({ status: 422, description: "Validation error or budget already exists" })
  async createBudget(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Body() dto: CreateBudgetDto,
  ) {
    const command = new CreateBudgetCommand(
      workspace.id,
      dto.categoryId,
      dto.subcategoryId,
      dto.name,
      dto.amount,
      dto.period,
      dto.startDate,
      dto.alertThreshold,
    );
    return this.createBudgetHandler.execute(command);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a budget" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Budget ID" })
  @ApiResponse({ status: 200, description: "Budget updated" })
  @ApiResponse({ status: 404, description: "Budget not found" })
  @ApiResponse({ status: 422, description: "Validation error" })
  async updateBudget(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    const command = new UpdateBudgetCommand(
      id,
      workspace.id,
      dto.name,
      dto.amount,
      dto.period,
      dto.alertThreshold,
    );
    return this.updateBudgetHandler.execute(command);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Archive a budget (soft delete)" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Budget ID" })
  @ApiResponse({ status: 204, description: "Budget archived" })
  @ApiResponse({ status: 404, description: "Budget not found" })
  async archiveBudget(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") id: string,
  ) {
    const command = new ArchiveBudgetCommand(id, workspace.id);
    await this.archiveBudgetHandler.execute(command);
  }
}
