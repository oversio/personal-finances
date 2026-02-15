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
import { type AuthenticatedUser, CurrentUser } from "@/modules/shared/infrastructure/decorators";
import {
  CurrentWorkspace,
  WorkspaceAccessGuard,
  type WorkspaceContext,
} from "@/modules/workspaces";
import {
  ArchiveRecurringTransactionCommand,
  ArchiveRecurringTransactionHandler,
  CreateRecurringTransactionCommand,
  CreateRecurringTransactionHandler,
  GetRecurringTransactionHandler,
  GetRecurringTransactionQuery,
  GetRecurringTransactionsHandler,
  GetRecurringTransactionsQuery,
  PauseRecurringTransactionCommand,
  PauseRecurringTransactionHandler,
  ProcessRecurringTransactionsCommand,
  ProcessRecurringTransactionsHandler,
  ResumeRecurringTransactionCommand,
  ResumeRecurringTransactionHandler,
  UpdateRecurringTransactionCommand,
  UpdateRecurringTransactionHandler,
} from "../../../application";
import {
  CreateRecurringTransactionDto,
  RecurringTransactionFiltersDto,
  UpdateRecurringTransactionDto,
} from "../dto";

@ApiTags("recurring-transactions")
@Controller("ws/:workspaceId/recurring-transactions")
@UseGuards(WorkspaceAccessGuard)
export class RecurringTransactionsController {
  constructor(
    private readonly createHandler: CreateRecurringTransactionHandler,
    private readonly updateHandler: UpdateRecurringTransactionHandler,
    private readonly archiveHandler: ArchiveRecurringTransactionHandler,
    private readonly pauseHandler: PauseRecurringTransactionHandler,
    private readonly resumeHandler: ResumeRecurringTransactionHandler,
    private readonly processHandler: ProcessRecurringTransactionsHandler,
    private readonly getOneHandler: GetRecurringTransactionHandler,
    private readonly getListHandler: GetRecurringTransactionsHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: "List all recurring transactions in workspace" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiQuery({ name: "type", required: false, enum: ["income", "expense"] })
  @ApiQuery({ name: "categoryId", required: false, description: "Filter by category" })
  @ApiQuery({ name: "accountId", required: false, description: "Filter by account" })
  @ApiQuery({ name: "isActive", required: false, type: Boolean })
  @ApiQuery({ name: "includeArchived", required: false, type: Boolean })
  @ApiResponse({ status: 200, description: "List of recurring transactions" })
  async getRecurringTransactions(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Query() filters: RecurringTransactionFiltersDto,
  ) {
    const query = new GetRecurringTransactionsQuery(
      workspace.id,
      filters.type,
      filters.categoryId,
      filters.accountId,
      filters.isActive,
      filters.includeArchived ?? false,
    );
    return this.getListHandler.execute(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single recurring transaction" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Recurring transaction ID" })
  @ApiResponse({ status: 200, description: "Recurring transaction details" })
  @ApiResponse({ status: 404, description: "Recurring transaction not found" })
  async getRecurringTransaction(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") id: string,
  ) {
    const query = new GetRecurringTransactionQuery(id, workspace.id);
    return this.getOneHandler.execute(query);
  }

  @Post()
  @ApiOperation({ summary: "Create a new recurring transaction" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiResponse({ status: 201, description: "Recurring transaction created" })
  @ApiResponse({ status: 422, description: "Validation error" })
  async createRecurringTransaction(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRecurringTransactionDto,
  ) {
    const command = new CreateRecurringTransactionCommand(
      workspace.id,
      dto.type,
      dto.accountId,
      dto.categoryId,
      dto.amount,
      dto.currency,
      dto.frequency,
      dto.interval,
      dto.startDate,
      user.id,
      dto.subcategoryId,
      dto.notes,
      dto.dayOfWeek,
      dto.dayOfMonth,
      dto.monthOfYear,
      dto.endDate,
    );
    return this.createHandler.execute(command);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a recurring transaction" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Recurring transaction ID" })
  @ApiResponse({ status: 200, description: "Recurring transaction updated" })
  @ApiResponse({ status: 404, description: "Recurring transaction not found" })
  @ApiResponse({ status: 422, description: "Validation error" })
  async updateRecurringTransaction(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") id: string,
    @Body() dto: UpdateRecurringTransactionDto,
  ) {
    const command = new UpdateRecurringTransactionCommand(
      id,
      workspace.id,
      dto.type,
      dto.accountId,
      dto.categoryId,
      dto.subcategoryId,
      dto.amount,
      dto.notes,
      dto.frequency,
      dto.interval,
      dto.dayOfWeek,
      dto.dayOfMonth,
      dto.monthOfYear,
      dto.startDate,
      dto.endDate,
    );
    return this.updateHandler.execute(command);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Archive a recurring transaction (soft delete)" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Recurring transaction ID" })
  @ApiResponse({ status: 204, description: "Recurring transaction archived" })
  @ApiResponse({ status: 404, description: "Recurring transaction not found" })
  async archiveRecurringTransaction(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") id: string,
  ) {
    const command = new ArchiveRecurringTransactionCommand(id, workspace.id);
    await this.archiveHandler.execute(command);
  }

  @Post(":id/pause")
  @ApiOperation({ summary: "Pause a recurring transaction" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Recurring transaction ID" })
  @ApiResponse({ status: 200, description: "Recurring transaction paused" })
  @ApiResponse({ status: 404, description: "Recurring transaction not found" })
  @ApiResponse({ status: 422, description: "Already paused" })
  async pauseRecurringTransaction(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") id: string,
  ) {
    const command = new PauseRecurringTransactionCommand(id, workspace.id);
    return this.pauseHandler.execute(command);
  }

  @Post(":id/resume")
  @ApiOperation({ summary: "Resume a paused recurring transaction" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Recurring transaction ID" })
  @ApiResponse({ status: 200, description: "Recurring transaction resumed" })
  @ApiResponse({ status: 404, description: "Recurring transaction not found" })
  @ApiResponse({ status: 422, description: "Already active" })
  async resumeRecurringTransaction(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") id: string,
  ) {
    const command = new ResumeRecurringTransactionCommand(id, workspace.id);
    return this.resumeHandler.execute(command);
  }

  @Post("process")
  @ApiOperation({ summary: "Process all due recurring transactions" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiResponse({
    status: 200,
    description: "Processing result with count and updated recurring transactions",
  })
  async processRecurringTransactions(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const command = new ProcessRecurringTransactionsCommand(workspace.id, user.id);
    return this.processHandler.execute(command);
  }
}
