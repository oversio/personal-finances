import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CategoryRepository } from "../../../application/ports";
import { Category } from "../../../domain/entities";
import { CategoryDocument, CategoryModel } from "../schemas";

@Injectable()
export class MongooseCategoryRepository implements CategoryRepository {
  constructor(
    @InjectModel(CategoryModel.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async save(category: Category): Promise<Category> {
    const doc = new this.categoryModel({
      workspaceId: new Types.ObjectId(category.workspaceId.value),
      name: category.name.value,
      type: category.type.value,
      subcategories: category.subcategories.map(sub => sub.toPrimitives()),
      icon: category.icon,
      color: category.color.value,
      isArchived: category.isArchived,
    });

    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async saveMany(categories: Category[]): Promise<Category[]> {
    const docs = categories.map(category => ({
      workspaceId: new Types.ObjectId(category.workspaceId.value),
      name: category.name.value,
      type: category.type.value,
      subcategories: category.subcategories.map(sub => sub.toPrimitives()),
      icon: category.icon,
      color: category.color.value,
      isArchived: category.isArchived,
    }));

    const saved = await this.categoryModel.insertMany(docs);
    return saved.map(doc => this.toDomain(doc as CategoryDocument));
  }

  async findById(id: string): Promise<Category | null> {
    try {
      const doc = await this.categoryModel.findById(id).exec();
      return doc ? this.toDomain(doc) : null;
    } catch {
      return null;
    }
  }

  async findByWorkspaceId(workspaceId: string, includeArchived = false): Promise<Category[]> {
    const filter: Record<string, unknown> = {
      workspaceId: new Types.ObjectId(workspaceId),
    };

    if (!includeArchived) {
      filter.isArchived = false;
    }

    const docs = await this.categoryModel.find(filter).sort({ type: 1, name: 1 }).exec();
    return docs.map(doc => this.toDomain(doc));
  }

  async findByNameTypeAndWorkspace(
    name: string,
    type: string,
    workspaceId: string,
  ): Promise<Category | null> {
    const doc = await this.categoryModel
      .findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        type,
        workspaceId: new Types.ObjectId(workspaceId),
      })
      .exec();
    return doc ? this.toDomain(doc) : null;
  }

  async update(category: Category): Promise<Category> {
    const doc = await this.categoryModel
      .findByIdAndUpdate(
        category.id!.value,
        {
          name: category.name.value,
          type: category.type.value,
          subcategories: category.subcategories.map(sub => sub.toPrimitives()),
          icon: category.icon,
          color: category.color.value,
          isArchived: category.isArchived,
        },
        { new: true },
      )
      .exec();

    if (!doc) {
      throw new Error(`Category with id ${category.id!.value} not found`);
    }

    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await this.categoryModel.findByIdAndDelete(id).exec();
  }

  private toDomain(doc: CategoryDocument): Category {
    return Category.create({
      id: doc._id.toString(),
      workspaceId: doc.workspaceId.toString(),
      name: doc.name,
      type: doc.type,
      subcategories: doc.subcategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        icon: sub.icon,
      })),
      icon: doc.icon,
      color: doc.color,
      isArchived: doc.isArchived,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
