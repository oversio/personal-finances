import { EntityId } from "@/modules/shared/domain/value-objects";
import { Currency } from "@/modules/workspaces/domain/value-objects";
import { TransactionAmount, TransactionType } from "@/modules/transactions/domain/value-objects";
import {
  AlreadyActiveError,
  AlreadyPausedError,
  InvalidDateRangeError,
  TransferNotAllowedError,
} from "../exceptions";
import { RecurrenceSchedule, type RecurrenceSchedulePrimitives } from "../value-objects";

export interface RecurringTransactionPrimitives {
  id: string | undefined;
  workspaceId: string;
  type: string;
  accountId: string;
  categoryId: string;
  subcategoryId: string | undefined;
  amount: number;
  currency: string;
  notes: string | undefined;
  schedule: RecurrenceSchedulePrimitives;
  startDate: Date;
  endDate: Date | undefined;
  nextRunDate: Date;
  lastRunDate: Date | undefined;
  isActive: boolean;
  isArchived: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class RecurringTransaction {
  constructor(
    public readonly id: EntityId | undefined,
    public readonly workspaceId: EntityId,
    public readonly type: TransactionType,
    public readonly accountId: EntityId,
    public readonly categoryId: EntityId,
    public readonly subcategoryId: string | undefined,
    public readonly amount: TransactionAmount,
    public readonly currency: Currency,
    public readonly notes: string | undefined,
    public readonly schedule: RecurrenceSchedule,
    public readonly startDate: Date,
    public readonly endDate: Date | undefined,
    public readonly nextRunDate: Date,
    public readonly lastRunDate: Date | undefined,
    public readonly isActive: boolean,
    public readonly isArchived: boolean,
    public readonly createdBy: EntityId,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    id?: string;
    workspaceId: string;
    type: string;
    accountId: string;
    categoryId: string;
    subcategoryId?: string;
    amount: number;
    currency: string;
    notes?: string;
    frequency: string;
    interval: number;
    dayOfWeek?: number;
    dayOfMonth?: number;
    monthOfYear?: number;
    startDate: Date | string;
    endDate?: Date | string;
    createdBy: string;
    isActive?: boolean;
    isArchived?: boolean;
    nextRunDate?: Date;
    lastRunDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }): RecurringTransaction {
    const now = new Date();
    const transactionType = new TransactionType(params.type);

    // Only income and expense are allowed for recurring transactions
    if (transactionType.isTransfer()) {
      throw new TransferNotAllowedError();
    }

    const startDate =
      params.startDate instanceof Date ? params.startDate : new Date(params.startDate);
    const endDate = params.endDate
      ? params.endDate instanceof Date
        ? params.endDate
        : new Date(params.endDate)
      : undefined;

    // Validate date range
    if (endDate && endDate <= startDate) {
      throw new InvalidDateRangeError();
    }

    const schedule = new RecurrenceSchedule({
      frequency: params.frequency,
      interval: params.interval,
      dayOfWeek: params.dayOfWeek,
      dayOfMonth: params.dayOfMonth,
      monthOfYear: params.monthOfYear,
    });

    // Calculate initial nextRunDate if not provided
    const nextRunDate = params.nextRunDate ?? startDate;

    return new RecurringTransaction(
      params.id ? new EntityId(params.id) : undefined,
      new EntityId(params.workspaceId),
      transactionType,
      new EntityId(params.accountId),
      new EntityId(params.categoryId),
      params.subcategoryId,
      new TransactionAmount(params.amount),
      new Currency(params.currency),
      params.notes?.trim(),
      schedule,
      startDate,
      endDate,
      nextRunDate,
      params.lastRunDate,
      params.isActive ?? true,
      params.isArchived ?? false,
      new EntityId(params.createdBy),
      params.createdAt ?? now,
      params.updatedAt ?? now,
    );
  }

  update(params: {
    type?: string;
    accountId?: string;
    categoryId?: string;
    subcategoryId?: string | null;
    amount?: number;
    notes?: string | null;
    frequency?: string;
    interval?: number;
    dayOfWeek?: number | null;
    dayOfMonth?: number | null;
    monthOfYear?: number | null;
    startDate?: Date | string;
    endDate?: Date | string | null;
  }): RecurringTransaction {
    const newType = params.type ? new TransactionType(params.type) : this.type;

    // Only income and expense are allowed
    if (newType.isTransfer()) {
      throw new TransferNotAllowedError();
    }

    // Determine new schedule
    const newFrequency = params.frequency ?? this.schedule.frequency.value;
    const newInterval = params.interval ?? this.schedule.interval;
    const newDayOfWeek =
      params.dayOfWeek !== undefined ? (params.dayOfWeek ?? undefined) : this.schedule.dayOfWeek;
    const newDayOfMonth =
      params.dayOfMonth !== undefined ? (params.dayOfMonth ?? undefined) : this.schedule.dayOfMonth;
    const newMonthOfYear =
      params.monthOfYear !== undefined
        ? (params.monthOfYear ?? undefined)
        : this.schedule.monthOfYear;

    const newSchedule = new RecurrenceSchedule({
      frequency: newFrequency,
      interval: newInterval,
      dayOfWeek: newDayOfWeek,
      dayOfMonth: newDayOfMonth,
      monthOfYear: newMonthOfYear,
    });

    // Determine dates
    const newStartDate = params.startDate
      ? params.startDate instanceof Date
        ? params.startDate
        : new Date(params.startDate)
      : this.startDate;

    let newEndDate: Date | undefined;
    if (params.endDate !== undefined) {
      newEndDate = params.endDate
        ? params.endDate instanceof Date
          ? params.endDate
          : new Date(params.endDate)
        : undefined;
    } else {
      newEndDate = this.endDate;
    }

    // Validate date range
    if (newEndDate && newEndDate <= newStartDate) {
      throw new InvalidDateRangeError();
    }

    // Recalculate nextRunDate if schedule changed
    let newNextRunDate = this.nextRunDate;
    if (
      params.frequency !== undefined ||
      params.interval !== undefined ||
      params.dayOfWeek !== undefined ||
      params.dayOfMonth !== undefined ||
      params.monthOfYear !== undefined ||
      params.startDate !== undefined
    ) {
      // Reset to start date and calculate from there
      newNextRunDate = this.lastRunDate
        ? newSchedule.calculateNextRunDate(this.lastRunDate)
        : newStartDate;
    }

    return new RecurringTransaction(
      this.id,
      this.workspaceId,
      newType,
      params.accountId ? new EntityId(params.accountId) : this.accountId,
      params.categoryId ? new EntityId(params.categoryId) : this.categoryId,
      params.subcategoryId !== undefined ? (params.subcategoryId ?? undefined) : this.subcategoryId,
      params.amount !== undefined ? new TransactionAmount(params.amount) : this.amount,
      this.currency,
      params.notes !== undefined ? params.notes?.trim() : this.notes,
      newSchedule,
      newStartDate,
      newEndDate,
      newNextRunDate,
      this.lastRunDate,
      this.isActive,
      this.isArchived,
      this.createdBy,
      this.createdAt,
      new Date(),
    );
  }

  pause(): RecurringTransaction {
    if (!this.isActive) {
      throw new AlreadyPausedError();
    }

    return new RecurringTransaction(
      this.id,
      this.workspaceId,
      this.type,
      this.accountId,
      this.categoryId,
      this.subcategoryId,
      this.amount,
      this.currency,
      this.notes,
      this.schedule,
      this.startDate,
      this.endDate,
      this.nextRunDate,
      this.lastRunDate,
      false,
      this.isArchived,
      this.createdBy,
      this.createdAt,
      new Date(),
    );
  }

  resume(): RecurringTransaction {
    if (this.isActive) {
      throw new AlreadyActiveError();
    }

    return new RecurringTransaction(
      this.id,
      this.workspaceId,
      this.type,
      this.accountId,
      this.categoryId,
      this.subcategoryId,
      this.amount,
      this.currency,
      this.notes,
      this.schedule,
      this.startDate,
      this.endDate,
      this.nextRunDate,
      this.lastRunDate,
      true,
      this.isArchived,
      this.createdBy,
      this.createdAt,
      new Date(),
    );
  }

  archive(): RecurringTransaction {
    return new RecurringTransaction(
      this.id,
      this.workspaceId,
      this.type,
      this.accountId,
      this.categoryId,
      this.subcategoryId,
      this.amount,
      this.currency,
      this.notes,
      this.schedule,
      this.startDate,
      this.endDate,
      this.nextRunDate,
      this.lastRunDate,
      false, // Deactivate when archiving
      true,
      this.createdBy,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Process this recurring transaction: advance the schedule and return updated entity
   */
  process(): RecurringTransaction {
    const newLastRunDate = this.nextRunDate;
    const newNextRunDate = this.schedule.calculateNextRunDate(newLastRunDate);

    // Check if we should deactivate (end date reached)
    let shouldDeactivate = false;
    if (this.endDate && newNextRunDate > this.endDate) {
      shouldDeactivate = true;
    }

    return new RecurringTransaction(
      this.id,
      this.workspaceId,
      this.type,
      this.accountId,
      this.categoryId,
      this.subcategoryId,
      this.amount,
      this.currency,
      this.notes,
      this.schedule,
      this.startDate,
      this.endDate,
      newNextRunDate,
      newLastRunDate,
      shouldDeactivate ? false : this.isActive,
      this.isArchived,
      this.createdBy,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Check if this recurring transaction is due (should be processed)
   */
  isDue(asOfDate: Date = new Date()): boolean {
    return this.isActive && !this.isArchived && this.nextRunDate <= asOfDate;
  }

  toPrimitives(): RecurringTransactionPrimitives {
    return {
      id: this.id?.value,
      workspaceId: this.workspaceId.value,
      type: this.type.value,
      accountId: this.accountId.value,
      categoryId: this.categoryId.value,
      subcategoryId: this.subcategoryId,
      amount: this.amount.value,
      currency: this.currency.value,
      notes: this.notes,
      schedule: this.schedule.toPrimitives(),
      startDate: this.startDate,
      endDate: this.endDate,
      nextRunDate: this.nextRunDate,
      lastRunDate: this.lastRunDate,
      isActive: this.isActive,
      isArchived: this.isArchived,
      createdBy: this.createdBy.value,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
