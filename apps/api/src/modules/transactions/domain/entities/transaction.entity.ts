import { EntityId } from "@/modules/shared/domain/value-objects";
import { Currency } from "@/modules/workspaces/domain/value-objects";
import {
  CategoryRequiredError,
  SameAccountTransferError,
  TransferRequiresToAccountError,
} from "../exceptions";
import { TransactionAmount, TransactionDate, TransactionType } from "../value-objects";

export interface TransactionPrimitives {
  id: string | undefined;
  workspaceId: string;
  type: string;
  accountId: string;
  toAccountId: string | undefined;
  categoryId: string | undefined;
  subcategoryId: string | undefined;
  amount: number;
  currency: string;
  notes: string | undefined;
  date: Date;
  createdBy: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Transaction {
  constructor(
    public readonly id: EntityId | undefined,
    public readonly workspaceId: EntityId,
    public readonly type: TransactionType,
    public readonly accountId: EntityId,
    public readonly toAccountId: EntityId | undefined,
    public readonly categoryId: EntityId | undefined,
    public readonly subcategoryId: string | undefined,
    public readonly amount: TransactionAmount,
    public readonly currency: Currency,
    public readonly notes: string | undefined,
    public readonly date: TransactionDate,
    public readonly createdBy: EntityId,
    public readonly isArchived: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    id?: string;
    workspaceId: string;
    type: string;
    accountId: string;
    toAccountId?: string;
    categoryId?: string;
    subcategoryId?: string;
    amount: number;
    currency: string;
    notes?: string;
    date: Date | string;
    createdBy: string;
    isArchived?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): Transaction {
    const now = new Date();
    const transactionType = new TransactionType(params.type);

    // Validate: transfers require toAccountId
    if (transactionType.requiresDestinationAccount() && !params.toAccountId) {
      throw new TransferRequiresToAccountError();
    }

    // Validate: income/expense require categoryId
    if (transactionType.requiresCategory() && !params.categoryId) {
      throw new CategoryRequiredError(transactionType.value);
    }

    // Validate: cannot transfer to same account
    if (transactionType.isTransfer() && params.accountId === params.toAccountId) {
      throw new SameAccountTransferError();
    }

    return new Transaction(
      params.id ? new EntityId(params.id) : undefined,
      new EntityId(params.workspaceId),
      transactionType,
      new EntityId(params.accountId),
      params.toAccountId ? new EntityId(params.toAccountId) : undefined,
      params.categoryId ? new EntityId(params.categoryId) : undefined,
      params.subcategoryId,
      new TransactionAmount(params.amount),
      new Currency(params.currency),
      params.notes?.trim(),
      new TransactionDate(params.date),
      new EntityId(params.createdBy),
      params.isArchived ?? false,
      params.createdAt ?? now,
      params.updatedAt ?? now,
    );
  }

  update(params: {
    type?: string;
    accountId?: string;
    toAccountId?: string | null;
    categoryId?: string | null;
    subcategoryId?: string | null;
    amount?: number;
    notes?: string | null;
    date?: Date | string;
  }): Transaction {
    const newType = params.type ? new TransactionType(params.type) : this.type;
    const newAccountId = params.accountId ? new EntityId(params.accountId) : this.accountId;

    // Determine new toAccountId
    let newToAccountId: EntityId | undefined;
    if (params.toAccountId !== undefined) {
      newToAccountId = params.toAccountId ? new EntityId(params.toAccountId) : undefined;
    } else {
      newToAccountId = this.toAccountId;
    }

    // Determine new categoryId
    let newCategoryId: EntityId | undefined;
    if (params.categoryId !== undefined) {
      newCategoryId = params.categoryId ? new EntityId(params.categoryId) : undefined;
    } else {
      newCategoryId = this.categoryId;
    }

    // Determine new subcategoryId
    let newSubcategoryId: string | undefined;
    if (params.subcategoryId !== undefined) {
      newSubcategoryId = params.subcategoryId ?? undefined;
    } else {
      newSubcategoryId = this.subcategoryId;
    }

    // Validate: transfers require toAccountId
    if (newType.requiresDestinationAccount() && !newToAccountId) {
      throw new TransferRequiresToAccountError();
    }

    // Validate: income/expense require categoryId
    if (newType.requiresCategory() && !newCategoryId) {
      throw new CategoryRequiredError(newType.value);
    }

    // Validate: cannot transfer to same account
    if (newType.isTransfer() && newAccountId.value === newToAccountId?.value) {
      throw new SameAccountTransferError();
    }

    return new Transaction(
      this.id,
      this.workspaceId,
      newType,
      newAccountId,
      newToAccountId,
      newCategoryId,
      newSubcategoryId,
      params.amount !== undefined ? new TransactionAmount(params.amount) : this.amount,
      this.currency,
      params.notes !== undefined ? params.notes?.trim() : this.notes,
      params.date !== undefined ? new TransactionDate(params.date) : this.date,
      this.createdBy,
      this.isArchived,
      this.createdAt,
      new Date(),
    );
  }

  archive(): Transaction {
    return new Transaction(
      this.id,
      this.workspaceId,
      this.type,
      this.accountId,
      this.toAccountId,
      this.categoryId,
      this.subcategoryId,
      this.amount,
      this.currency,
      this.notes,
      this.date,
      this.createdBy,
      true,
      this.createdAt,
      new Date(),
    );
  }

  toPrimitives(): TransactionPrimitives {
    return {
      id: this.id?.value,
      workspaceId: this.workspaceId.value,
      type: this.type.value,
      accountId: this.accountId.value,
      toAccountId: this.toAccountId?.value,
      categoryId: this.categoryId?.value,
      subcategoryId: this.subcategoryId,
      amount: this.amount.value,
      currency: this.currency.value,
      notes: this.notes,
      date: this.date.value,
      createdBy: this.createdBy.value,
      isArchived: this.isArchived,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
