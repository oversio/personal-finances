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
  ArchiveTransactionCommand,
  ArchiveTransactionHandler,
  CreateTransactionCommand,
  CreateTransactionHandler,
  GetTransactionHandler,
  GetTransactionQuery,
  GetTransactionsHandler,
  GetTransactionsQuery,
  UpdateTransactionCommand,
  UpdateTransactionHandler,
} from "../../../application";
import { CreateTransactionDto, TransactionFiltersDto, UpdateTransactionDto } from "../dto";

@ApiTags("transactions")
@Controller("ws/:workspaceId/transactions")
@UseGuards(WorkspaceAccessGuard)
export class TransactionsController {
  constructor(
    private readonly createTransactionHandler: CreateTransactionHandler,
    private readonly updateTransactionHandler: UpdateTransactionHandler,
    private readonly archiveTransactionHandler: ArchiveTransactionHandler,
    private readonly getTransactionHandler: GetTransactionHandler,
    private readonly getTransactionsHandler: GetTransactionsHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: "List all transactions in workspace" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiQuery({ name: "accountId", required: false, description: "Filter by account" })
  @ApiQuery({ name: "categoryId", required: false, description: "Filter by category" })
  @ApiQuery({
    name: "type",
    required: false,
    enum: ["income", "expense", "transfer"],
    description: "Filter by transaction type",
  })
  @ApiQuery({ name: "startDate", required: false, description: "Filter from date (ISO format)" })
  @ApiQuery({ name: "endDate", required: false, description: "Filter to date (ISO format)" })
  @ApiQuery({ name: "includeArchived", required: false, type: Boolean })
  @ApiResponse({ status: 200, description: "List of transactions" })
  async getTransactions(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Query() filters: TransactionFiltersDto,
  ) {
    const query = new GetTransactionsQuery(
      workspace.id,
      filters.accountId,
      filters.categoryId,
      filters.type,
      filters.startDate,
      filters.endDate,
      filters.includeArchived ?? false,
    );
    return this.getTransactionsHandler.execute(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single transaction" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Transaction ID" })
  @ApiResponse({ status: 200, description: "Transaction details" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  async getTransaction(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") id: string,
  ) {
    const query = new GetTransactionQuery(id, workspace.id);
    return this.getTransactionHandler.execute(query);
  }

  @Post()
  @ApiOperation({ summary: "Create a new transaction" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiResponse({ status: 201, description: "Transaction created" })
  @ApiResponse({ status: 422, description: "Validation error" })
  async createTransaction(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTransactionDto,
  ) {
    const command = new CreateTransactionCommand(
      workspace.id,
      dto.type,
      dto.accountId,
      dto.amount,
      dto.currency,
      dto.date,
      user.id,
      dto.toAccountId,
      dto.categoryId,
      dto.subcategoryId,
      dto.notes,
    );
    return this.createTransactionHandler.execute(command);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a transaction" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Transaction ID" })
  @ApiResponse({ status: 200, description: "Transaction updated" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  @ApiResponse({ status: 422, description: "Validation error" })
  async updateTransaction(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    const command = new UpdateTransactionCommand(
      id,
      workspace.id,
      dto.type,
      dto.accountId,
      dto.toAccountId,
      dto.categoryId,
      dto.subcategoryId,
      dto.amount,
      dto.notes,
      dto.date,
    );
    return this.updateTransactionHandler.execute(command);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Archive a transaction (soft delete)" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Transaction ID" })
  @ApiResponse({ status: 204, description: "Transaction archived" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  async archiveTransaction(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") id: string,
  ) {
    const command = new ArchiveTransactionCommand(id, workspace.id);
    await this.archiveTransactionHandler.execute(command);
  }
}
