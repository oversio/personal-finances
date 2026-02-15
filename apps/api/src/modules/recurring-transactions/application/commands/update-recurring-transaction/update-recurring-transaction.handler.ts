import { Inject, Injectable } from "@nestjs/common";
import type { RecurringTransactionPrimitives } from "../../../domain/entities";
import { RecurringTransactionNotFoundError } from "../../../domain/exceptions";
import { RECURRING_TRANSACTION_REPOSITORY, type RecurringTransactionRepository } from "../../ports";
import { UpdateRecurringTransactionCommand } from "./update-recurring-transaction.command";

export type UpdateRecurringTransactionResult = RecurringTransactionPrimitives;

@Injectable()
export class UpdateRecurringTransactionHandler {
  constructor(
    @Inject(RECURRING_TRANSACTION_REPOSITORY)
    private readonly repository: RecurringTransactionRepository,
  ) {}

  async execute(
    command: UpdateRecurringTransactionCommand,
  ): Promise<UpdateRecurringTransactionResult> {
    const existing = await this.repository.findById(command.id);

    if (!existing || existing.workspaceId.value !== command.workspaceId) {
      throw new RecurringTransactionNotFoundError(command.id);
    }

    const updated = existing.update({
      type: command.type,
      accountId: command.accountId,
      categoryId: command.categoryId,
      subcategoryId: command.subcategoryId,
      amount: command.amount,
      notes: command.notes,
      frequency: command.frequency,
      interval: command.interval,
      dayOfWeek: command.dayOfWeek,
      dayOfMonth: command.dayOfMonth,
      monthOfYear: command.monthOfYear,
      startDate: command.startDate,
      endDate: command.endDate,
    });

    const saved = await this.repository.update(updated);
    return saved.toPrimitives();
  }
}
