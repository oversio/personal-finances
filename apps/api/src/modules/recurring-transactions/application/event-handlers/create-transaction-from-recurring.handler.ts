import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import {
  CreateTransactionCommand,
  CreateTransactionHandler,
} from "@/modules/transactions/application";

export interface RecurringTransactionDueEvent {
  recurringTransactionId: string;
  workspaceId: string;
  type: string;
  accountId: string;
  categoryId: string;
  subcategoryId?: string;
  amount: number;
  currency: string;
  notes?: string;
  date: Date;
  createdBy: string;
}

@Injectable()
export class CreateTransactionFromRecurringHandler {
  constructor(private readonly createTransactionHandler: CreateTransactionHandler) {}

  @OnEvent("recurring-transaction.due")
  async handle(event: RecurringTransactionDueEvent): Promise<void> {
    // Prepend note with recurring transaction reference
    const notes = event.notes ? `[Recurring] ${event.notes}` : "[Recurring transaction]";

    const command = new CreateTransactionCommand(
      event.workspaceId,
      event.type,
      event.accountId,
      event.amount,
      event.currency,
      event.date,
      event.createdBy,
      undefined, // toAccountId - not used for income/expense
      event.categoryId,
      event.subcategoryId,
      notes,
    );

    await this.createTransactionHandler.execute(command);
  }
}
