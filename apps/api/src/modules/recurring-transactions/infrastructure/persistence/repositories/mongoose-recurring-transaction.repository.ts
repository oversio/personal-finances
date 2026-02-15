import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  type RecurringTransactionFilters,
  type RecurringTransactionRepository,
} from "../../../application/ports";
import { RecurringTransaction } from "../../../domain/entities";
import { RecurringTransactionDocument, RecurringTransactionModel } from "../schemas";

@Injectable()
export class MongooseRecurringTransactionRepository implements RecurringTransactionRepository {
  constructor(
    @InjectModel(RecurringTransactionModel.name)
    private readonly model: Model<RecurringTransactionDocument>,
  ) {}

  async save(recurringTransaction: RecurringTransaction): Promise<RecurringTransaction> {
    const doc = new this.model({
      workspaceId: new Types.ObjectId(recurringTransaction.workspaceId.value),
      type: recurringTransaction.type.value,
      accountId: new Types.ObjectId(recurringTransaction.accountId.value),
      categoryId: new Types.ObjectId(recurringTransaction.categoryId.value),
      subcategoryId: recurringTransaction.subcategoryId,
      amount: recurringTransaction.amount.value,
      currency: recurringTransaction.currency.value,
      notes: recurringTransaction.notes,
      schedule: {
        frequency: recurringTransaction.schedule.frequency.value,
        interval: recurringTransaction.schedule.interval,
        dayOfWeek: recurringTransaction.schedule.dayOfWeek,
        dayOfMonth: recurringTransaction.schedule.dayOfMonth,
        monthOfYear: recurringTransaction.schedule.monthOfYear,
      },
      startDate: recurringTransaction.startDate,
      endDate: recurringTransaction.endDate,
      nextRunDate: recurringTransaction.nextRunDate,
      lastRunDate: recurringTransaction.lastRunDate,
      isActive: recurringTransaction.isActive,
      isArchived: recurringTransaction.isArchived,
      createdBy: new Types.ObjectId(recurringTransaction.createdBy.value),
    });

    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<RecurringTransaction | null> {
    try {
      const doc = await this.model.findById(id).exec();
      return doc ? this.toDomain(doc) : null;
    } catch {
      return null;
    }
  }

  async findByWorkspaceId(
    workspaceId: string,
    filters?: RecurringTransactionFilters,
  ): Promise<RecurringTransaction[]> {
    const filter: Record<string, unknown> = {
      workspaceId: new Types.ObjectId(workspaceId),
    };

    if (!filters?.includeArchived) {
      filter.isArchived = false;
    }

    if (filters?.type) {
      filter.type = filters.type;
    }

    if (filters?.categoryId) {
      filter.categoryId = new Types.ObjectId(filters.categoryId);
    }

    if (filters?.accountId) {
      filter.accountId = new Types.ObjectId(filters.accountId);
    }

    if (filters?.isActive !== undefined) {
      filter.isActive = filters.isActive;
    }

    const docs = await this.model.find(filter).sort({ nextRunDate: 1, createdAt: -1 }).exec();

    return docs.map(doc => this.toDomain(doc));
  }

  async findDue(workspaceId: string, asOfDate: Date): Promise<RecurringTransaction[]> {
    const docs = await this.model
      .find({
        workspaceId: new Types.ObjectId(workspaceId),
        isActive: true,
        isArchived: false,
        nextRunDate: { $lte: asOfDate },
      })
      .sort({ nextRunDate: 1 })
      .exec();

    return docs.map(doc => this.toDomain(doc));
  }

  async update(recurringTransaction: RecurringTransaction): Promise<RecurringTransaction> {
    const doc = await this.model
      .findByIdAndUpdate(
        recurringTransaction.id!.value,
        {
          type: recurringTransaction.type.value,
          accountId: new Types.ObjectId(recurringTransaction.accountId.value),
          categoryId: new Types.ObjectId(recurringTransaction.categoryId.value),
          subcategoryId: recurringTransaction.subcategoryId,
          amount: recurringTransaction.amount.value,
          notes: recurringTransaction.notes,
          schedule: {
            frequency: recurringTransaction.schedule.frequency.value,
            interval: recurringTransaction.schedule.interval,
            dayOfWeek: recurringTransaction.schedule.dayOfWeek,
            dayOfMonth: recurringTransaction.schedule.dayOfMonth,
            monthOfYear: recurringTransaction.schedule.monthOfYear,
          },
          startDate: recurringTransaction.startDate,
          endDate: recurringTransaction.endDate,
          nextRunDate: recurringTransaction.nextRunDate,
          lastRunDate: recurringTransaction.lastRunDate,
          isActive: recurringTransaction.isActive,
          isArchived: recurringTransaction.isArchived,
        },
        { new: true },
      )
      .exec();

    if (!doc) {
      throw new Error(`Recurring transaction with id ${recurringTransaction.id!.value} not found`);
    }

    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  private toDomain(doc: RecurringTransactionDocument): RecurringTransaction {
    return RecurringTransaction.create({
      id: doc._id.toString(),
      workspaceId: doc.workspaceId.toString(),
      type: doc.type,
      accountId: doc.accountId.toString(),
      categoryId: doc.categoryId.toString(),
      subcategoryId: doc.subcategoryId,
      amount: doc.amount,
      currency: doc.currency,
      notes: doc.notes,
      frequency: doc.schedule.frequency,
      interval: doc.schedule.interval,
      dayOfWeek: doc.schedule.dayOfWeek,
      dayOfMonth: doc.schedule.dayOfMonth,
      monthOfYear: doc.schedule.monthOfYear,
      startDate: doc.startDate,
      endDate: doc.endDate,
      nextRunDate: doc.nextRunDate,
      lastRunDate: doc.lastRunDate,
      isActive: doc.isActive,
      isArchived: doc.isArchived,
      createdBy: doc.createdBy.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
