import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WorkspacesModule } from "@/modules/workspaces";
import {
  AddSubcategoryHandler,
  ArchiveCategoryHandler,
  CATEGORY_REPOSITORY,
  CreateCategoryHandler,
  GetCategoriesHandler,
  GetCategoryHandler,
  RemoveSubcategoryHandler,
  UpdateCategoryHandler,
  UpdateSubcategoryHandler,
  WorkspaceCreatedHandler,
} from "./application";
import {
  CategoriesController,
  CategoryModel,
  CategorySchema,
  MongooseCategoryRepository,
} from "./infrastructure";

const commandHandlers = [
  CreateCategoryHandler,
  UpdateCategoryHandler,
  ArchiveCategoryHandler,
  AddSubcategoryHandler,
  UpdateSubcategoryHandler,
  RemoveSubcategoryHandler,
];

const queryHandlers = [GetCategoryHandler, GetCategoriesHandler];

const eventHandlers = [WorkspaceCreatedHandler];

const repositories = [
  {
    provide: CATEGORY_REPOSITORY,
    useClass: MongooseCategoryRepository,
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CategoryModel.name, schema: CategorySchema }]),
    WorkspacesModule,
  ],
  controllers: [CategoriesController],
  providers: [...commandHandlers, ...queryHandlers, ...eventHandlers, ...repositories],
  exports: [...commandHandlers, ...queryHandlers, ...repositories],
})
export class CategoriesModule {}
