import { Inject, Injectable } from "@nestjs/common";
import {
  RecurringTransaction,
  type RecurringTransactionPrimitives,
} from "../../../domain/entities";
import { RECURRING_TRANSACTION_REPOSITORY, type RecurringTransactionRepository } from "../../ports";
import { CreateRecurringTransactionCommand } from "./create-recurring-transaction.command";

export type CreateRecurringTransactionResult = RecurringTransactionPrimitives;

@Injectable()
export class CreateRecurringTransactionHandler {
  constructor(
    @Inject(RECURRING_TRANSACTION_REPOSITORY)
    private readonly repository: RecurringTransactionRepository,
  ) {}

  async execute(
    command: CreateRecurringTransactionCommand,
  ): Promise<CreateRecurringTransactionResult> {
    const recurringTransaction = RecurringTransaction.create({
      workspaceId: command.workspaceId,
      type: command.type,
      accountId: command.accountId,
      categoryId: command.categoryId,
      subcategoryId: command.subcategoryId,
      amount: command.amount,
      currency: command.currency,
      notes: command.notes,
      frequency: command.frequency,
      interval: command.interval,
      dayOfWeek: command.dayOfWeek,
      dayOfMonth: command.dayOfMonth,
      monthOfYear: command.monthOfYear,
      startDate: command.startDate,
      endDate: command.endDate,
      createdBy: command.createdBy,
    });

    const saved = await this.repository.save(recurringTransaction);
    return saved.toPrimitives();
  }
}
