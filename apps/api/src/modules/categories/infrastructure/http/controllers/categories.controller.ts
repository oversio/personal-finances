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
  AddSubcategoryCommand,
  AddSubcategoryHandler,
  ArchiveCategoryCommand,
  ArchiveCategoryHandler,
  CreateCategoryCommand,
  CreateCategoryHandler,
  GetCategoriesHandler,
  GetCategoriesQuery,
  GetCategoryHandler,
  GetCategoryQuery,
  RemoveSubcategoryCommand,
  RemoveSubcategoryHandler,
  UpdateCategoryCommand,
  UpdateCategoryHandler,
  UpdateSubcategoryCommand,
  UpdateSubcategoryHandler,
} from "../../../application";
import {
  AddSubcategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateSubcategoryDto,
} from "../dto";

@ApiTags("categories")
@Controller("ws/:workspaceId/categories")
@UseGuards(WorkspaceAccessGuard)
export class CategoriesController {
  constructor(
    private readonly createCategoryHandler: CreateCategoryHandler,
    private readonly updateCategoryHandler: UpdateCategoryHandler,
    private readonly archiveCategoryHandler: ArchiveCategoryHandler,
    private readonly getCategoryHandler: GetCategoryHandler,
    private readonly getCategoriesHandler: GetCategoriesHandler,
    private readonly addSubcategoryHandler: AddSubcategoryHandler,
    private readonly updateSubcategoryHandler: UpdateSubcategoryHandler,
    private readonly removeSubcategoryHandler: RemoveSubcategoryHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: "List all categories in workspace" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiQuery({ name: "type", required: false, enum: ["income", "expense"] })
  @ApiQuery({ name: "includeArchived", required: false, type: Boolean })
  @ApiResponse({ status: 200, description: "List of categories" })
  async getCategories(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Query("type") type?: string,
    @Query("includeArchived") includeArchived?: string,
  ) {
    const query = new GetCategoriesQuery(workspace.id, type, includeArchived === "true");
    return this.getCategoriesHandler.execute(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single category" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiResponse({ status: 200, description: "Category details" })
  @ApiResponse({ status: 404, description: "Category not found" })
  async getCategory(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") id: string,
  ) {
    const query = new GetCategoryQuery(id, workspace.id);
    return this.getCategoryHandler.execute(query);
  }

  @Post()
  @ApiOperation({ summary: "Create a new category" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiResponse({ status: 201, description: "Category created" })
  @ApiResponse({ status: 422, description: "Validation error or category already exists" })
  async createCategory(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Body() dto: CreateCategoryDto,
  ) {
    const command = new CreateCategoryCommand(
      workspace.id,
      dto.name,
      dto.type,
      dto.subcategories,
      dto.icon,
      dto.color,
    );
    return this.createCategoryHandler.execute(command);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a category" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiResponse({ status: 200, description: "Category updated" })
  @ApiResponse({ status: 404, description: "Category not found" })
  @ApiResponse({ status: 422, description: "Validation error" })
  async updateCategory(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const command = new UpdateCategoryCommand(
      id,
      workspace.id,
      dto.name,
      dto.type,
      dto.icon ?? undefined,
      dto.color,
    );
    return this.updateCategoryHandler.execute(command);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Archive a category (soft delete)" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiResponse({ status: 204, description: "Category archived" })
  @ApiResponse({ status: 404, description: "Category not found" })
  async archiveCategory(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") id: string,
  ) {
    const command = new ArchiveCategoryCommand(id, workspace.id);
    await this.archiveCategoryHandler.execute(command);
  }

  // Subcategory endpoints

  @Post(":id/subcategories")
  @ApiOperation({ summary: "Add a subcategory to a category" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiResponse({ status: 201, description: "Subcategory added" })
  @ApiResponse({ status: 404, description: "Category not found" })
  @ApiResponse({ status: 422, description: "Validation error" })
  async addSubcategory(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") categoryId: string,
    @Body() dto: AddSubcategoryDto,
  ) {
    const command = new AddSubcategoryCommand(categoryId, workspace.id, dto.name, dto.icon);
    return this.addSubcategoryHandler.execute(command);
  }

  @Put(":id/subcategories/:subId")
  @ApiOperation({ summary: "Update a subcategory" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiParam({ name: "subId", description: "Subcategory ID" })
  @ApiResponse({ status: 200, description: "Subcategory updated" })
  @ApiResponse({ status: 404, description: "Category or subcategory not found" })
  @ApiResponse({ status: 422, description: "Validation error" })
  async updateSubcategory(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") categoryId: string,
    @Param("subId") subcategoryId: string,
    @Body() dto: UpdateSubcategoryDto,
  ) {
    const command = new UpdateSubcategoryCommand(
      categoryId,
      subcategoryId,
      workspace.id,
      dto.name,
      dto.icon ?? undefined,
    );
    return this.updateSubcategoryHandler.execute(command);
  }

  @Delete(":id/subcategories/:subId")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Remove a subcategory from a category" })
  @ApiParam({ name: "workspaceId", description: "Workspace ID" })
  @ApiParam({ name: "id", description: "Category ID" })
  @ApiParam({ name: "subId", description: "Subcategory ID" })
  @ApiResponse({ status: 200, description: "Subcategory removed, returns updated category" })
  @ApiResponse({ status: 404, description: "Category or subcategory not found" })
  async removeSubcategory(
    @CurrentWorkspace() workspace: WorkspaceContext["workspace"],
    @Param("id") categoryId: string,
    @Param("subId") subcategoryId: string,
  ) {
    const command = new RemoveSubcategoryCommand(categoryId, subcategoryId, workspace.id);
    return this.removeSubcategoryHandler.execute(command);
  }
}
