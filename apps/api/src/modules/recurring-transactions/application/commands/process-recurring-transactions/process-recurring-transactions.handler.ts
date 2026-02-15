import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import type { RecurringTransactionPrimitives } from "../../../domain/entities";
import { RECURRING_TRANSACTION_REPOSITORY, type RecurringTransactionRepository } from "../../ports";
import { ProcessRecurringTransactionsCommand } from "./process-recurring-transactions.command";

export interface ProcessRecurringTransactionsResult {
  processed: number;
  transactions: RecurringTransactionPrimitives[];
}

@Injectable()
export class ProcessRecurringTransactionsHandler {
  constructor(
    @Inject(RECURRING_TRANSACTION_REPOSITORY)
    private readonly repository: RecurringTransactionRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    command: ProcessRecurringTransactionsCommand,
  ): Promise<ProcessRecurringTransactionsResult> {
    const dueRecurring = await this.repository.findDue(command.workspaceId, command.asOfDate);

    const processedTransactions: RecurringTransactionPrimitives[] = [];

    for (const recurring of dueRecurring) {
      // Create a transaction event (the transaction module will handle actual creation via event)
      this.eventEmitter.emit("recurring-transaction.due", {
        recurringTransactionId: recurring.id!.value,
        workspaceId: recurring.workspaceId.value,
        type: recurring.type.value,
        accountId: recurring.accountId.value,
        categoryId: recurring.categoryId.value,
        subcategoryId: recurring.subcategoryId,
        amount: recurring.amount.value,
        currency: recurring.currency.value,
        notes: recurring.notes,
        date: recurring.nextRunDate,
        createdBy: command.userId,
      });

      // Process the recurring transaction (advance schedule)
      const processed = recurring.process();
      const saved = await this.repository.update(processed);
      processedTransactions.push(saved.toPrimitives());
    }

    return {
      processed: processedTransactions.length,
      transactions: processedTransactions,
    };
  }
}
