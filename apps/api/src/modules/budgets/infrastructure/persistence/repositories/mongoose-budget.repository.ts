import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import type { BudgetRepository } from "../../../application/ports";
import { Budget } from "../../../domain/entities";
import { BudgetDocument, BudgetModel } from "../schemas";

@Injectable()
export class MongooseBudgetRepository implements BudgetRepository {
  constructor(
    @InjectModel(BudgetModel.name)
    private readonly budgetModel: Model<BudgetDocument>,
  ) {}

  async save(budget: Budget): Promise<Budget> {
    const doc = new this.budgetModel({
      workspaceId: new Types.ObjectId(budget.workspaceId.value),
      categoryId: new Types.ObjectId(budget.categoryId.value),
      subcategoryId: budget.subcategoryId,
      name: budget.name.value,
      amount: budget.amount.value,
      period: budget.period.value,
      startDate: budget.startDate,
      alertThreshold: budget.alertThreshold?.value,
      isArchived: budget.isArchived,
    });

    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Budget | null> {
    try {
      const doc = await this.budgetModel.findById(id).exec();
      return doc ? this.toDomain(doc) : null;
    } catch {
      return null;
    }
  }

  async findByWorkspaceId(workspaceId: string, includeArchived = false): Promise<Budget[]> {
    const filter: Record<string, unknown> = {
      workspaceId: new Types.ObjectId(workspaceId),
    };

    if (!includeArchived) {
      filter.isArchived = false;
    }

    const docs = await this.budgetModel.find(filter).sort({ name: 1 }).exec();

    return docs.map(doc => this.toDomain(doc));
  }

  async findActiveByCategoryAndSubcategory(
    workspaceId: string,
    categoryId: string,
    subcategoryId: string | undefined,
  ): Promise<Budget | null> {
    const filter: Record<string, unknown> = {
      workspaceId: new Types.ObjectId(workspaceId),
      categoryId: new Types.ObjectId(categoryId),
      isArchived: false,
    };

    // Handle subcategoryId: if provided, match it; if not, match null/undefined
    if (subcategoryId) {
      filter.subcategoryId = subcategoryId;
    } else {
      filter.subcategoryId = { $exists: false };
    }

    const doc = await this.budgetModel.findOne(filter).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async update(budget: Budget): Promise<Budget> {
    const doc = await this.budgetModel
      .findByIdAndUpdate(
        budget.id!.value,
        {
          name: budget.name.value,
          amount: budget.amount.value,
          period: budget.period.value,
          alertThreshold: budget.alertThreshold?.value,
          isArchived: budget.isArchived,
        },
        { new: true },
      )
      .exec();

    if (!doc) {
      throw new Error(`Budget with id ${budget.id!.value} not found`);
    }

    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await this.budgetModel.findByIdAndDelete(id).exec();
  }

  private toDomain(doc: BudgetDocument): Budget {
    return Budget.create({
      id: doc._id.toString(),
      workspaceId: doc.workspaceId.toString(),
      categoryId: doc.categoryId.toString(),
      subcategoryId: doc.subcategoryId,
      name: doc.name,
      amount: doc.amount,
      period: doc.period,
      startDate: doc.startDate,
      alertThreshold: doc.alertThreshold,
      isArchived: doc.isArchived,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
