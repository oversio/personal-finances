import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AccountRepository } from "../../../application/ports";
import { Account } from "../../../domain/entities";
import { AccountDocument, AccountModel } from "../schemas";

@Injectable()
export class MongooseAccountRepository implements AccountRepository {
  constructor(
    @InjectModel(AccountModel.name)
    private readonly accountModel: Model<AccountDocument>,
  ) {}

  async save(account: Account): Promise<Account> {
    const doc = new this.accountModel({
      workspaceId: new Types.ObjectId(account.workspaceId.value),
      name: account.name.value,
      type: account.type.value,
      currency: account.currency.value,
      initialBalance: account.initialBalance.value,
      currentBalance: account.currentBalance.value,
      color: account.color.value,
      icon: account.icon,
      isArchived: account.isArchived,
    });

    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Account | null> {
    try {
      const doc = await this.accountModel.findById(id).exec();
      return doc ? this.toDomain(doc) : null;
    } catch {
      return null;
    }
  }

  async findByWorkspaceId(workspaceId: string, includeArchived = false): Promise<Account[]> {
    const filter: Record<string, unknown> = {
      workspaceId: new Types.ObjectId(workspaceId),
    };

    if (!includeArchived) {
      filter.isArchived = false;
    }

    const docs = await this.accountModel.find(filter).sort({ name: 1 }).exec();
    return docs.map(doc => this.toDomain(doc));
  }

  async findByNameAndWorkspace(name: string, workspaceId: string): Promise<Account | null> {
    const doc = await this.accountModel
      .findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        workspaceId: new Types.ObjectId(workspaceId),
      })
      .exec();
    return doc ? this.toDomain(doc) : null;
  }

  async update(account: Account): Promise<Account> {
    const doc = await this.accountModel
      .findByIdAndUpdate(
        account.id!.value,
        {
          name: account.name.value,
          type: account.type.value,
          currentBalance: account.currentBalance.value,
          color: account.color.value,
          icon: account.icon,
          isArchived: account.isArchived,
        },
        { new: true },
      )
      .exec();

    if (!doc) {
      throw new Error(`Account with id ${account.id!.value} not found`);
    }

    return this.toDomain(doc);
  }

  async delete(id: string): Promise<void> {
    await this.accountModel.findByIdAndDelete(id).exec();
  }

  private toDomain(doc: AccountDocument): Account {
    return Account.create({
      id: doc._id.toString(),
      workspaceId: doc.workspaceId.toString(),
      name: doc.name,
      type: doc.type,
      currency: doc.currency,
      initialBalance: doc.initialBalance,
      currentBalance: doc.currentBalance,
      color: doc.color,
      icon: doc.icon,
      isArchived: doc.isArchived,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
