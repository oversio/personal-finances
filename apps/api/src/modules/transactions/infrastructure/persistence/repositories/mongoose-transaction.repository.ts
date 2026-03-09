import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { type TransactionFilters, type TransactionRepository } from "../../../application/ports";
import { Transaction } from "../../../domain/entities";
import { TransactionDocument, TransactionModel } from "../schemas";

@Injectable()
export class MongooseTransactionRepository implements TransactionRepository {
  constructor(
    @InjectModel(TransactionModel.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  async save(transaction: Transaction): Promise<Transaction> {
    const doc = new this.transactionModel({
      workspaceId: new Types.ObjectId(transaction.workspaceId.value),
      type: transaction.type.value,
      accountId: new Types.ObjectId(transaction.accountId.value),
      toAccountId: transaction.toAccountId
        ? new Types.ObjectId(transaction.toAccountId.value)
        : undefined,
      categoryId: transaction.categoryId
        ? new Types.ObjectId(transaction.categoryId.value)
        : undefined,
      subcategoryId: transaction.subcategoryId,
      amount: transaction.amount.value,
      currency: transaction.currency.value,
      notes: transaction.notes,
      date: transaction.date.value,
      createdBy: new Types.ObjectId(transaction.createdBy.value),
      isArchived: transaction.isArchived,
    });

    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Transaction | null> {
    try {
      const doc = await this.transactionModel.findById(id).exec();
      return doc ? this.toDomain(doc) : null;
    } catch {
      return null;
    }
  }

  async findByWorkspaceId(
    workspaceId: string,
    filters?: TransactionFilters,
  ): Promise<Transaction[]> {
    const filter: Record<string, unknown> = {
      workspaceId: new Types.ObjectId(workspaceId),
    };

    if (!filters?.includeArchived) {
      filter.isArchived = false;
    }

    if (filters?.accountId) {
      filter.$or = [
        { accountId: new Types.ObjectId(filters.accountId) },
        { toAccountId: new Types.ObjectId(filters.accountId) },
      ];
    }

    if (filters?.categoryId) {
      filter.categoryId = new Types.ObjectId(filters.categoryId);
    }

    if (filters?.subcategoryId) {
      filter.subcategoryId = filters.subcategoryId;
    }

    if (filters?.type) {
      filter.type = filters.type;
    }

    if (filters?.startDate || filters?.endDate) {
      filter.date = {};
      if (filters.startDate) {
        (filter.date as Record<string, Date>).$gte = filters.startDate;
      }
      if (filters.endDate) {
        (filter.date as Record<string, Date>).$lte = filters.endDate;
      }
    }

    const docs = await this.transactionModel.find(filter).sort({ date: -1, createdAt: -1 }).exec();

    return docs.map(doc => this.toDomain(doc));
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const doc = await this.transactionModel
      .findByIdAndUpdate(
        transaction.id!.value,
        {
          type: transaction.type.value,
          accountId: new Types.ObjectId(transaction.accountId.value),
          toAccountId: transaction.toAccountId
            ? new Types.ObjectId(transaction.toAccountId.value)
            : undefined,
          categoryId: transaction.categoryId
            ? new Types.ObjectId(transaction.categoryId.value)
            : undefined,
          subcategoryId: transaction.subcategoryId,
          amount: transaction.amount.value,
          notes: transaction.notes,
          date: transaction.date.value,
          isArchived: transaction.isArchived,
        },
        { new: true },
      )
      .exec();

    if (!doc) {
      throw new Error(`Transaction with id ${transaction.id!.value} not found`);
    }

    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await this.transactionModel.findByIdAndDelete(id).exec();
  }

  async existsByCategory(
    workspaceId: string,
    categoryId: string,
    subcategoryId?: string,
  ): Promise<boolean> {
    const filter: Record<string, unknown> = {
      workspaceId: new Types.ObjectId(workspaceId),
      categoryId: new Types.ObjectId(categoryId),
      isArchived: false,
    };

    if (subcategoryId) {
      filter.subcategoryId = subcategoryId;
    }

    const count = await this.transactionModel.countDocuments(filter).limit(1).exec();
    return count > 0;
  }

  async sumByCategory(
    workspaceId: string,
    categoryId: string,
    subcategoryId: string | undefined,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const matchStage: Record<string, unknown> = {
      workspaceId: new Types.ObjectId(workspaceId),
      categoryId: new Types.ObjectId(categoryId),
      type: "expense",
      isArchived: false,
      date: { $gte: startDate, $lte: endDate },
    };

    // If subcategoryId provided, only sum that subcategory
    // If not, sum all transactions in the category
    if (subcategoryId) {
      matchStage.subcategoryId = subcategoryId;
    }

    const result = await this.transactionModel.aggregate<{ _id: null; total: number }>([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return result[0]?.total ?? 0;
  }

  async aggregateExpensesByMonth(
    workspaceId: string,
    year: number,
    currency?: string,
  ): Promise<
    Array<{
      categoryId: string;
      subcategoryId: string | null;
      month: number;
      total: number;
    }>
  > {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const matchStage: Record<string, unknown> = {
      workspaceId: new Types.ObjectId(workspaceId),
      type: "expense",
      isArchived: false,
      date: { $gte: startOfYear, $lte: endOfYear },
      categoryId: { $exists: true, $ne: null },
    };

    if (currency) {
      matchStage.currency = currency;
    }

    const result = await this.transactionModel.aggregate<{
      _id: {
        categoryId: Types.ObjectId;
        subcategoryId: string | null;
        month: number;
      };
      total: number;
    }>([
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: {
            categoryId: "$categoryId",
            subcategoryId: "$subcategoryId",
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: {
          "_id.categoryId": 1,
          "_id.subcategoryId": 1,
          "_id.month": 1,
        },
      },
    ]);

    return result.map(r => ({
      categoryId: r._id.categoryId.toString(),
      subcategoryId: r._id.subcategoryId,
      month: r._id.month,
      total: r.total,
    }));
  }

  private toDomain(doc: TransactionDocument): Transaction {
    return Transaction.create({
      id: doc._id.toString(),
      workspaceId: doc.workspaceId.toString(),
      type: doc.type,
      accountId: doc.accountId.toString(),
      toAccountId: doc.toAccountId?.toString(),
      categoryId: doc.categoryId?.toString(),
      subcategoryId: doc.subcategoryId,
      amount: doc.amount,
      currency: doc.currency,
      notes: doc.notes,
      date: doc.date,
      createdBy: doc.createdBy.toString(),
      isArchived: doc.isArchived,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
