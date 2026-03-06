import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CreateTransactionCommand } from "../commands/create-transaction/create-transaction.command";
import { CreateTransactionHandler } from "../commands/create-transaction/create-transaction.handler";

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
  private readonly logger = new Logger(CreateTransactionFromRecurringHandler.name);

  constructor(private readonly createTransactionHandler: CreateTransactionHandler) {}

  @OnEvent("recurring-transaction.due")
  async handle(event: RecurringTransactionDueEvent): Promise<void> {
    this.logger.log(
      `Creating transaction from recurring transaction ${event.recurringTransactionId}`,
    );

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

    this.logger.log(
      `Successfully created transaction from recurring transaction ${event.recurringTransactionId}`,
    );
  }
}
