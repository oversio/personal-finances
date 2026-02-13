import { EntityId } from "@/modules/shared/domain/value-objects";
import { AlertThreshold, BudgetAmount, BudgetName, BudgetPeriod } from "../value-objects";

export interface BudgetProgress {
  spent: number;
  remaining: number;
  percentage: number;
  isExceeded: boolean;
  isWarning: boolean;
  periodStart: Date;
  periodEnd: Date;
}

export class Budget {
  constructor(
    public readonly id: EntityId | undefined,
    public readonly workspaceId: EntityId,
    public readonly categoryId: EntityId,
    public readonly subcategoryId: string | undefined,
    public readonly name: BudgetName,
    public readonly amount: BudgetAmount,
    public readonly period: BudgetPeriod,
    public readonly startDate: Date,
    public readonly alertThreshold: AlertThreshold | undefined,
    public readonly isArchived: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    id?: string;
    workspaceId: string;
    categoryId: string;
    subcategoryId?: string;
    name: string;
    amount: number;
    period: string;
    startDate: Date;
    alertThreshold?: number;
    isArchived?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): Budget {
    const now = new Date();
    return new Budget(
      params.id ? new EntityId(params.id) : undefined,
      new EntityId(params.workspaceId),
      new EntityId(params.categoryId),
      params.subcategoryId,
      new BudgetName(params.name),
      new BudgetAmount(params.amount),
      new BudgetPeriod(params.period),
      params.startDate,
      params.alertThreshold !== undefined ? new AlertThreshold(params.alertThreshold) : undefined,
      params.isArchived ?? false,
      params.createdAt ?? now,
      params.updatedAt ?? now,
    );
  }

  update(params: {
    name?: string;
    amount?: number;
    period?: string;
    alertThreshold?: number | null;
  }): Budget {
    return new Budget(
      this.id,
      this.workspaceId,
      this.categoryId,
      this.subcategoryId,
      params.name ? new BudgetName(params.name) : this.name,
      params.amount !== undefined ? new BudgetAmount(params.amount) : this.amount,
      params.period ? new BudgetPeriod(params.period) : this.period,
      this.startDate,
      params.alertThreshold !== undefined
        ? params.alertThreshold === null
          ? undefined
          : new AlertThreshold(params.alertThreshold)
        : this.alertThreshold,
      this.isArchived,
      this.createdAt,
      new Date(),
    );
  }

  archive(): Budget {
    return new Budget(
      this.id,
      this.workspaceId,
      this.categoryId,
      this.subcategoryId,
      this.name,
      this.amount,
      this.period,
      this.startDate,
      this.alertThreshold,
      true,
      this.createdAt,
      new Date(),
    );
  }

  getCurrentPeriodRange(): { start: Date; end: Date } {
    return this.period.getCurrentPeriodRange(this.startDate);
  }

  calculateProgress(spent: number): BudgetProgress {
    const { start, end } = this.getCurrentPeriodRange();
    const remaining = Math.max(0, this.amount.value - spent);
    const percentage = Math.min(Math.round((spent / this.amount.value) * 100), 999); // Cap at 999%
    const isExceeded = spent > this.amount.value;
    const isWarning =
      this.alertThreshold !== undefined &&
      this.alertThreshold.isTriggered(percentage) &&
      !isExceeded;

    return {
      spent,
      remaining,
      percentage,
      isExceeded,
      isWarning,
      periodStart: start,
      periodEnd: end,
    };
  }

  toPrimitives() {
    return {
      id: this.id?.value,
      workspaceId: this.workspaceId.value,
      categoryId: this.categoryId.value,
      subcategoryId: this.subcategoryId,
      name: this.name.value,
      amount: this.amount.value,
      period: this.period.value,
      startDate: this.startDate,
      alertThreshold: this.alertThreshold?.value,
      isArchived: this.isArchived,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
